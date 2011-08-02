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

def man_behind_curtain(request, run_id=None):
    ctxt = {'event_types': dict(EVT_DISTRIBUTIONS), 'trend_types': dict(EVT_TRENDS)}
    template = 'man_behind_curtain'
    if run_id:
        ctxt['run'] = Run.objects.get(id=run_id)
    else:
        ctxt['runs'] = Run.objects.all()
        template += "_all"
    return render_to_response(template+'.html', RequestContext(request, ctxt))

from sockets import *