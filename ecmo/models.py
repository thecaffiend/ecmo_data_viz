from django.db import models

class Run(models.Model):
    """
    A single ECMO run.
    """
    start = models.DateTimeField(auto_now_add=True)
    
class Feed(models.Model):
    """
    A datafeed relating to a run: either a sensor, set point or
    some sort.
    """
    js_name = models.SlugField(max_length=32)
    run = models.ForeignKey(Run)
    min_val = models.FloatField()
    max_val = models.FloatField()
    
    class Meta:
        unique_together = ('js_name', 'run')

EVT_SET = 'SET'
EVT_NRM = 'NRM'
EVT_UNI = 'UNI'

EVT_DISTRIBUTIONS = (
    (EVT_SET, 'Set value (val=val, arg=ignored)'),
    (EVT_NRM, 'Normal (val=mean, arg=stddev)'),
    (EVT_UNI, 'Uniform (val=min, arg=max)'),
)

class FeedEvent(models.Model):
    """
    The script of the feed. When generating feed points,
    these will be used to generate the value until the 
    next feed event is encountered.
    """
    feed = models.ForeignKey(Feed)
    value = models.FloatField()
    run_time = models.IntegerField(help_text="Seconds from beginning of run.")
    distribution = models.CharField(max_length=3, choices=EVT_DISTRIBUTIONS)
    
    class Meta:
        unique_together = ('feed', 'run_time')

class FeedPoint(models.Model):
    feed = models.ForeignKey(Feed) 
    run_time = models.IntegerField(help_text="Seconds from beginning of run.")
    value = models.FloatField()
    
    class Meta:
        unique_together = ('feed', 'run_time')

TEMPLATES = (
    ('dashboard', 'Dashboard'),
    ('analysis', 'Analysis'),
    ('maintenance', 'Maintenance'),
)

class Screen(models.Model):
    """
    A reusable display.
    """
    label = models.CharField(max_length=128)
    js_name = models.SlugField(max_length=32)
    regions = models.ManyToManyField("ScreenRegion")
    template = models.SlugField(max_length=32, choices=TEMPLATES)
    
class ScreenRegion(models.Model):
    js_name = models.SlugField(max_length=32, unique=True)

class WidgetType(models.Model):
    """
    A screen widget, showing the feeds relevant to an ECMO component
    """
    label = models.CharField(max_length=64,
        help_text="the label that will be shown along with a widget")
    js_name = models.CharField(max_length=32, unique=True)
    
class WidgetSeries(models.Model):
    """
    A timestamped series of data on a widget.
    """
    widget_type = models.ForeignKey(WidgetType)
    label = models.CharField(max_length=64)
    js_name = models.SlugField(max_length=32)
    
    class Meta:
        unique_together = ('widget_type', 'js_name')

class Widget(models.Model):
    """
    A single display on a screen.
    """
    screen = models.ForeignKey(Screen)
    widget_type = models.ForeignKey(WidgetType)
    region = models.ForeignKey(ScreenRegion)
    position = models.SmallIntegerField(help_text="Zero is closest to the top/left.")
    
    class Meta:
        unique_together = ('screen', 'region', 'position')
    
#ew.
from django.conf import settings
from django.contrib.auth import models as auth_models
from django.contrib.auth.management import create_superuser
from django.db.models import signals

# Ew.
signals.post_syncdb.disconnect(
    create_superuser,
    sender=auth_models,
    dispatch_uid='django.contrib.auth.management.create_superuser')

def create_testuser(app, created_models, verbosity, **kwargs):
    # Create our own test user automatically.
    if not settings.DEBUG:
        return
    try:
        auth_models.User.objects.get(username='ecmo')
    except auth_models.User.DoesNotExist:
        print '*' * 80
        print 'Creating test user -- login: ecmo, password: ecmo'
        print '*' * 80
        assert auth_models.User.objects.create_superuser('ecmo', 'x@x.com', 'ecmo')
    else:
        print 'Test user already exists.'

signals.post_syncdb.connect(create_testuser,
    sender=auth_models, dispatch_uid='common.models.create_testuser')