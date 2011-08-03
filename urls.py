from django.conf.urls.defaults import patterns, include, url

from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'ecmo_data_viz.views.home', name='home'),
    # url(r'^ecmo_data_viz/', include('ecmo_data_viz.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
    (r'^ecmo/', include('ecmo.urls')),
    (r'^$', 'ecmo.views.home'),
    (r'^favicon\.ico$', 'django.views.generic.simple.redirect_to', {'url': '/static/img/favicon.png'}),
)

urlpatterns += staticfiles_urlpatterns()