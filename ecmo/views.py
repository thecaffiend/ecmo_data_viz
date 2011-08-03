from django.http import HttpResponse
from util.JsonResponse import JsonResponse
from django.db import connection
from ecmo.models import *
from django.shortcuts import render_to_response
#from util.json_encode import json_encode
from django.template import RequestContext

from django.utils import simplejson

import math

def home(request):
    return render_to_response('home.html', RequestContext(request, {}))

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

def widget_confs_json(request):
    widget_confs = []
    
    widgets = Widget.objects.all()
    
    for widget in widgets:
        w = {"screen": widget.screen.js_name,
             "container": widget.region.js_name,
             "pos": widget.position,
             "series": [ws.js_name for ws in widget.widget_type.widgetseries_set.all()],
             "div_id": widget.widget_type.js_name,
             "label":widget.widget_type.label,
             "unit":widget.widget_type.unit,
             "symbol":widget.widget_type.symbol,
        }
        widget_confs.append(w)
    return JsonResponse(widget_confs)

def screen_data(request, screen_name, run_id, min_back):
    screen = Screen.objects.select_related().get(js_name=screen_name)
    run = Run.objects.select_related().get(id=run_id)
    
    screen_struct = generate_data(screen, run, int(min_back))
    
    return JsonResponse(screen_struct)

def generate_data(screen, run, min_back):
    # get the baseline structure and mapping from feed_type.js_name to (widget, series)
    screen_struct, point_ss_map = screen.struct_base_map()
    
    for feed in run.feed_set.all():
        feed_js = feed.feed_type.js_name
        try:
            # check that the data is mappable
            p_map = point_ss_map[feed_js]
            screen_struct[p_map[0]][p_map[1]] = []
            
            points = ensure_feed_data(feed, None, min_back)
            screen_struct[p_map[0]][p_map[1]] = [[p.run_time, p.value] for p in points]
        except KeyError:
            # expected: not all data from a run will neccessarily be used in a screen
            pass
    return screen_struct
    
def ensure_feed_data(feed, start_time=None, end_time=None):    
    
    events = list(feed.feedevent_set.order_by('run_time'))
    points = feed.feedpoint_set.order_by('run_time')
    
    if start_time is not None:
        points = points.filter(run_time__gte=start_time)
    if end_time is not None:
        points = points.filter(run_time__lte=end_time)
    
    points = list(points)
    
    try:
        last_point = points[-1].run_time
    except:
        last_point = 0
    
    # not enough... need to generate more
    if last_point < end_time:
        for rt in range(last_point, end_time):
            next_event = None
            trend_event = None
            if events:
                # calculating this everytime is a bit silly
                next_event = filter(lambda x: x.run_time <= rt, events)[-1]
                try:
                    trend_event = filter(lambda x: x.run_time > rt, events)[0]
                except:
                    trend_event = None
            # naive. slow
            # next_event, trend_event = feed.next_event(rt)
            point = FeedPoint.generate(feed, rt, next_event, trend_event)
            try:
                # trying to recreate the problem... probably not a problem
                # point.full_clean()
                point.save()
                points.append(point)
            except:
                pass
    return points

def man_behind_curtain(request, run_id=None):
    ctxt = {'event_types': dict(EVT_DISTRIBUTIONS), 'trend_types': dict(EVT_TRENDS)}
    template = 'man_behind_curtain'
    if run_id:
        ctxt['run'] = Run.objects.get(id=run_id)
    else:
        ctxt['runs'] = Run.objects.all()
        template += "_all"
    return render_to_response(template+'.html', RequestContext(request, ctxt))

def screen(request, screen_name, run_id):
    return render_to_response('base_socket_screen.html', RequestContext(request, {}))

def trend_view(request):
    ctxt = {'runs': Run.objects.all()}
    return render_to_response('trends.html', RequestContext(request, ctxt))

def trend_data(request, ids):
    ids = [int(x) for x in ids.split("/")]
    feeds = Feed.objects.filter(id__in=ids)
    
    result = {}
    for feed in feeds:
        result[feed.id] = [{"x": p.run_time, "y": p.value} for p in ensure_feed_data(feed, 0, 1000)]
    return JsonResponse(result)

from sockets import *