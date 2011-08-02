from django.db import models

class Run(models.Model):
    """
    A single ECMO run.
    """
    start = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=64)
    run_time = models.IntegerField(default=0)
    
    def __unicode__(self):
        return self.name
    
    def update_feeds(self):
        """
        This is where all of the next FeedPoints should be queued.
        This will be called from the clock thread, right before sleeping.
        Seems like the cache should be used to keep from doing unneccessary
        roundtrips, but maybe this just adds a layer of complexity?
        """
        points = []
        for feed in self.feed_set.all():
            try:
                point = feed.feedpoint_set.get(run_time=self.run_time)
            except:
                point = FeedPoint.generate(feed, self.run_time, feed.next_event(self.run_time))
                point.save()
            points.append(point)
        return points

    @property
    def raw_points_key(self):
        return 'points-%s' % self.id

class FeedType(models.Model):
    label = models.CharField(max_length=64)
    js_name = models.SlugField(max_length=32, unique=True)
    min_val = models.FloatField()
    max_val = models.FloatField()
    
    def __unicode__(self):
        return self.label


class Feed(models.Model):
    """
    A datafeed relating to a run: either a sensor, set point or
    some sort.
    """
    feed_type = models.ForeignKey(FeedType)
    run = models.ForeignKey(Run)
    
    class Meta:
        unique_together = ('feed_type', 'run')
        
    def __unicode__(self):
        return '%s: %s' % (self.run, self.feed_type)
    
    def next_event(self, run_time):
        try:
            return self.feedevent_set.filter(run_time__lte=run_time).order_by('-run_time')[0]
        except:
            return None
            

DIST_SET = 'SET'
DIST_NRM = 'NRM'
DIST_UNI = 'UNI'

EVT_DISTRIBUTIONS = (
    (DIST_SET, 'Set value (val=val, arg=ignored)'),
    (DIST_NRM, 'Normal (val=mean, arg=stddev)'),
    (DIST_UNI, 'Uniform (val=min, arg=max)'),
)

TND_LNR = 'LNR'

EVT_TRENDS = (
    (TND_LNR, 'Linear'),
)

import random

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
    arg = models.FloatField(null=True, blank=True)
    trend = models.CharField(blank=True, null=True, choices=EVT_TRENDS, max_length=3,
        help_text="If set, and an event exists with a greater run_time, the intervening values will be interpolated")
    
    class Meta:
        unique_together = ('feed', 'run_time')

    @property
    def msg(self):
        dct = dict([(k,v) for k,v in self.__dict__.items() if k[0] != '_'])
        dct['feed'] = self.feed.feed_type.js_name
        return dct
        
    def save(self, *args, **kwargs):
        super(FeedEvent, self).save(*args, **kwargs) # Call the "real" save() method.
        self.feed.feedpoint_set.filter(run_time__gte=self.run_time).delete()
            
    def generate_value(self, run_time):
        dists = {
            DIST_SET: lambda value, a: v,
            DIST_NRM: lambda mu, sigma: random.gauss(mu, sigma),
            DIST_UNI: lambda min_v, max_v: random.uniform(min_v, max_v) 
        }
        return dists[self.distribution](self.value, self.arg)


class FeedPoint(models.Model):
    feed = models.ForeignKey(Feed)
    run_time = models.IntegerField(help_text="Seconds from beginning of run.")
    value = models.FloatField()
    
    class Meta:
        unique_together = ('feed', 'run_time')
    
    @property
    def msg(self):
        return {'val': self.value, 'feed': self.feed.feed_type.js_name}
    
    @staticmethod
    def generate(feed, run_time, event):
        args = {
            "run_time": run_time,
            "feed": feed
        }
        if event:
            args['value'] = event.generate_value(run_time)
        else:
            args['value'] = 0
        point = FeedPoint(**args)
        
        return point

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
    
    def __unicode__(self):
        return self.label
    

class ScreenRegion(models.Model):
    js_name = models.SlugField(max_length=32, unique=True)
    
    def __unicode__(self):
        return self.js_name

WIDGET_SYMBOLS = (("P", "Pressure"),
                  ("S", "Saturation"),
                  ("T", "Temperature"),)

MEASURAND_UNITS = (("mmHG", "mm Mercury"),
                  ("oC", "Degrees Celsius"),
                  ("%", "Percent"),)

class WidgetType(models.Model):
    """
    A screen widget, showing the feeds relevant to an ECMO component
    """
    label = models.CharField(max_length=64,
        help_text="the label that will be shown along with a widget")
    js_name = models.CharField(max_length=32, unique=True)
    symbol = models.CharField(max_length=3, choices=WIDGET_SYMBOLS)
    unit = models.CharField(max_length=5, choices=MEASURAND_UNITS)
    
    def __unicode__(self):
        return "%s: %s" % (self.label, self.unit)
    

class WidgetSeries(models.Model):
    """
    A timestamped series of data on a widget.
    """
    widget_type = models.ForeignKey(WidgetType)
    label = models.CharField(max_length=64)
    js_name = models.SlugField(max_length=32)
    feed_type = models.ForeignKey(FeedType)
    
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