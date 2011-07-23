from django.http import HttpResponse
#from util.JsonResponse import JsonResponse
from django.db import connection
from ecmo.models import *
from django.shortcuts import render_to_response
#from util.json_encode import json_encode

import math

def ecmo_main(request):
    return render_to_response('ecmo_main.html', {})

