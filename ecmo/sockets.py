from django_websocket import require_websocket
from django.utils import simplejson
from django.core.cache import cache

import math
import time

from copy import deepcopy

from ecmo.models import *

import sys

def jsjson(msg):
     return simplejson.dumps(msg, ensure_ascii=True)

@require_websocket
def screen_socket(request, screen_name, run_id):
    """
    The main end user socket. Doesn't really accept anything.
    """
    
    run = Run.objects.get(id=run_id)
    screen = Screen.objects.get(js_name=screen_name)
    ws = request.websocket
    
    ss_base, point_ss_map = screen.struct_base_map()
    
    last_sent = None
    
    while True:
        points = cache.get(run.raw_points_key)
        if points and points.get('points',False) and points['run_time'] != last_sent:
            run_time = points['run_time']
            screen_struct = deepcopy(ss_base)
            for p in points['points']:
                p_map = point_ss_map[p['feed']]
                screen_struct[p_map[0]][p_map[1]].append([run_time, p['val']]) 
            jstruct = jsjson(screen_struct)
            ws.send(jstruct)
            last_sent = run_time
        time.sleep(.25)

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
        points = cache.get(run.raw_points_key)
        if points and points['points'] and points['run_time'] != last_sent:
            ws.send(jsjson({'points':points['points']}))
            last_sent = points['run_time']
        if ws.has_messages():
            msg = ws.read()
            msg = simplejson.loads(msg)
            if msg.get('delete', False):
                try:
                    FeedEvent.objects.get(id=msg['delete']).delete()
                    ws.send(jsjson(msg))
                except:
                    sys.stderr.write("bad delete %s" % e)
            if msg.get('feed', False):
                for feed in run.feed_set.all():
                    if feed.feed_type.js_name == msg['feed']:
                        msg['feed'] = feed
                        try:
                            event = FeedEvent(**msg)
                            event.full_clean()
                            event.save()
                            ws.send(jsjson({'events':[event.msg]}))
                        except Exception, e:
                            sys.stderr.write("bad insert %s" % e)
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
                cache.set(run.raw_points_key, {'run_time': run.run_time, 'points': [p.msg for p in points]})
                
                sleep_time = time.time()
                # attempt to counter drift
                time.sleep(1 - (sleep_time - wake_time))
                wake_time = time.time()
        elif msg['type'] == CLK_SET:
            run.run_time = msg['run_time']
            msg_time()
