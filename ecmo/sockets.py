from django_websocket import require_websocket
from django.utils import simplejson
from django.core.cache import cache

import math
import time

from ecmo.models import *

@require_websocket
def mbc_command(request, run_id):
    """
    The main MBC socket. Used for creating new (and deleting old) FeedEvents. Gives
    the current value.
    
    Accepts: {  feed: <js_name>,
                value: <value or min or mean>,
                arg: <max or stddev>,
                run_time: <int>,
                distribution:   one of EVT_DISTRIBUTIONS,
                trend:   one of EVT_TRENDS
                }
                    or
            {   delete: <event_id>}
    
    Returns:    {points: [{feed: <feed_name>, val:<float>}]}
                    or
                {events: [<above struct, plus id>,]}
                
    """
    
    run = Run.objects.get(id=run_id)
    ws = request.websocket
    last_sent = None
    
    while True:
        points = cache.get(run.points_key)
        if points and points['points'] and points['run_time'] != last_sent:
            ws.send(jsjson({'points':points['points']}))
            last_sent = points['run_time']
        while ws.has_messages():
            msg = simplejson.loads(ws.read())
            if msg['delete']:
                try:
                    FeedEvent.objects.get(id=msg['delete']).delete()
                    ws.send(jsjson(msg))
                except:
                    print "bad delete", e
            else:
                for feed in run.feed_set.all():
                    if feed.feed_type.js_name == msg['feed']:
                        msg['feed'] = feed
                        try:
                            event = FeedEvent(**msg)
                            event.full_clean()
                            event.save()
                            ws.send(jsjson({'events':[event.msg]}))
                        except Exception, e:
                            print "bad insert", e
                        break
        time.sleep(.25)

# DRY would put this in a JSON file that python can use, too
CLK_RESUME = 0
CLK_SET = 1
CLK_PAUSE = 2

@require_websocket
def mbc_clock(request, run_id):
    """
    Handles the magic of the clock as best as possible... there is some drift,
    but it's good enough for demo purposes.
    
    Expects:    {type: CLK_RESUME|CLK_PAUSE} 
                    or
                {type: CLK_SET, run_time: <int>}
                
    Returns:    {run_time: <int>}
                
    """
    run = Run.objects.get(id=run_id)
    
    ws = request.websocket
    
    def msg_time():
        ws.send(jsjson({'run_time':run.run_time}))
        run.save()
    
    # iterator will run forever until client disconnects
    for msg in ws:
        interrupted = False
        msg = simplejson.loads(msg)
        if msg['type'] == CLK_RESUME:
            # initialize wake time for outer loop
            wake_time = time.time()
            while not interrupted:
                if ws.has_messages():
                    # on pause or set, special stuff
                    interrupt = simplejson.loads(ws.read())
                    if interrupt["type"] == CLK_PAUSE:
                        msg_time()
                        # sends back to outer loop
                        interrupted = True
                        break
                    elif interrupt["type"] == CLK_SET:
                        # just updated the time
                        run.run_time = interrupt['run_time']
                else:
                    run.run_time += 1
                msg_time()
                
                # generates all the new points
                points = run.update_feeds()
                
                # send this up so other listeners can hear
                cache.set(run.points_key, {'run_time': run.run_time, 'points': [p.msg for p in points]})
                
                sleep_time = time.time()
                # attempt to counter drift
                time.sleep(1 - (sleep_time - wake_time))
                wake_time = time.time()
        elif msg['type'] == CLK_SET:
            run.run_time = msg['run_time']
            msg_time()

def jsjson(msg):
     return simplejson.dumps(msg, ensure_ascii=True)