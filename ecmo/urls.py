from django.conf.urls.defaults import *

urlpatterns = patterns('ecmo_data_viz.ecmo.views',
    # required html, js and json views for ecmo
    (r'^$', 'home'),
    
    (r'^ecmo_viz/$', 'ecmo_main'),
    (r'^widget/$', 'widget_view'),
    (r'^pressure_gauge/$', 'pressure_gauge_view'),
    (r'^pressure_graph/$', 'pressure_graph_view'),
    (r'^trend_symbol/$', 'trend_symbol_view'),
    
    (r'^trend/$', 'trend_view'),
    (r'^trend/data/(.*)$', 'trend_data'),
    
    (r'^widget_confs/json/$', 'widget_confs_json'),
    
    (r'^screen/([^/]+)/(\d+)/socket$', 'screen_socket'),
    (r'^screen/([^/]+)/(\d+)$', 'screen'),
    (r'^screen/([^/]+)/(\d+)/data/(\d+)$', 'screen_data'),
    
    (r'^man_behind_curtain/(\d+)?$', 'man_behind_curtain'),
    (r'^man_behind_curtain/(\d+)/command$', 'mbc_command'),
    (r'^man_behind_curtain/(\d+)/clock$', 'mbc_clock'),
)

