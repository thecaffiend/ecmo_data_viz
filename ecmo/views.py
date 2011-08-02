from django.http import HttpResponse
#from util.JsonResponse import JsonResponse
from django.db import connection
from ecmo.models import *
from django.shortcuts import render_to_response
#from util.json_encode import json_encode
from django.template import RequestContext

from django_websocket import require_websocket
from django.utils import simplejson

import math

def ecmo_main(request):
    return render_to_response('ecmo_main.html', {})

def pressure_gauge_view(request):
    return render_to_response('pressure_gauge_view.html', {})

def pressure_graph_view(request):
    return render_to_response('pressure_graph_view.html', {})

def trend_symbol_view(request):
    return render_to_response('trend_symbol_view.html', {})

def widget_view(request):
    return render_to_response('ecmo_widget.html', {})

def man_behind_curtain(request, run_id=None):
    ctxt = {'event_types': dict(EVT_DISTRIBUTIONS), 'trend_types': dict(EVT_TRENDS)}
    template = 'man_behind_curtain'
    if run_id:
        ctxt['run'] = Run.objects.get(id=run_id)
    else:
        ctxt['runs'] = Run.objects.all()
        template += "_all"
    return render_to_response(template+'.html', RequestContext(request, ctxt))


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
    
    Returns:    {feed: <float>, run_time: <int>}
                    or
                {events: [<above struct, plus id>,]}
                
    """
    
    run = Run.objects.get(id=run_id)
    ws = request.websocket
    
    for msg in ws:
        msg = simplejson.loads(msg)
        for feed in run.feed_set.all():
            if feed.feed_type.js_name == msg['feed']:
                msg['feed'] = feed
                try:
                    event = FeedEvent(**msg)
                    event.full_clean()
                    event.save()
                    ws.send(jsjson({'events':[event.msg]}))
                except Exception, e:
                    print "bad", e
                break
        #ws.send(jsjson(msg))

import time

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
                
                run.update_feeds()
                
                sleep_time = time.time()
                # attempt to counter drift
                time.sleep(1 - (sleep_time - wake_time))
                wake_time = time.time()
        elif msg['type'] == CLK_SET:
            run.run_time = msg['run_time']
            msg_time()

def jsjson(msg):
     return simplejson.dumps(msg, ensure_ascii=True)
    