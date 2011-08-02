from django.http import HttpResponse
from util.JsonResponse import JsonResponse
from django.db import connection
from ecmo.models import *
from django.shortcuts import render_to_response
#from util.json_encode import json_encode
from django.template import RequestContext

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
    screen = Screen.objects.get(js_name=screen_name)
    run = Run.objects.get(id=run_id)
    min_back = int(min_back)
    
    # get the baseline structure and mapping from feed_type.js_name to (widget, series)
    screen_struct, point_ss_map = screen.struct_base_map()
    
    for feed in run.feed_set.all():
        feed_js = feed.feed_type.js_name
        
        try:
            p_map = point_ss_map[feed_js]
            screen_struct[p_map[0]][p_map[1]] = []
            points = list(feed.feedpoint_set.order_by('run_time'))
            try:
                last_point = points[-1].run_time
            except:
                last_point = -1
            # not enough... need to generate more
            if last_point < min_back:
                points.extend(map(
                    lambda rt: FeedPoint.generate(feed, rt, feed.next_event(rt), save=True),
                    range(last_point + 1, min_back)
                ))
            screen_struct[p_map[0]][p_map[1]] = [[p.run_time, p.value] for p in points]
        except KeyError:
            # expected: not all data from a run will neccessarily be used in a screen
            pass
                
    return JsonResponse(screen_struct)
    

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

from sockets import *