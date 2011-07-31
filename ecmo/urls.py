from django.conf.urls.defaults import *

urlpatterns = patterns('ecmo_data_viz.ecmo.views',
    # required html, js and json views for ecmo
    (r'^ecmo_viz/$', 'ecmo_main'),
    (r'^widget/$', 'widget_view'),
    (r'^pressure_gauge/$', 'pressure_gauge_view'),
    (r'^pressure_graph/$', 'pressure_graph_view'),
    (r'^trend_symbol/$', 'trend_symbol_view'),

)

