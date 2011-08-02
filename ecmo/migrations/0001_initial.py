# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Adding model 'Run'
        db.create_table('ecmo_run', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('start', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
        ))
        db.send_create_signal('ecmo', ['Run'])

        # Adding model 'Feed'
        db.create_table('ecmo_feed', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('js_name', self.gf('django.db.models.fields.SlugField')(max_length=32, db_index=True)),
            ('run', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['ecmo.Run'])),
            ('min_val', self.gf('django.db.models.fields.FloatField')()),
            ('max_val', self.gf('django.db.models.fields.FloatField')()),
        ))
        db.send_create_signal('ecmo', ['Feed'])

        # Adding unique constraint on 'Feed', fields ['js_name', 'run']
        db.create_unique('ecmo_feed', ['js_name', 'run_id'])

        # Adding model 'FeedEvent'
        db.create_table('ecmo_feedevent', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('feed', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['ecmo.Feed'])),
            ('value', self.gf('django.db.models.fields.FloatField')()),
            ('run_time', self.gf('django.db.models.fields.IntegerField')()),
            ('distribution', self.gf('django.db.models.fields.CharField')(max_length=3)),
        ))
        db.send_create_signal('ecmo', ['FeedEvent'])

        # Adding unique constraint on 'FeedEvent', fields ['feed', 'run_time']
        db.create_unique('ecmo_feedevent', ['feed_id', 'run_time'])

        # Adding model 'FeedPoint'
        db.create_table('ecmo_feedpoint', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('feed', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['ecmo.Feed'])),
            ('run_time', self.gf('django.db.models.fields.IntegerField')()),
            ('value', self.gf('django.db.models.fields.FloatField')()),
        ))
        db.send_create_signal('ecmo', ['FeedPoint'])

        # Adding unique constraint on 'FeedPoint', fields ['feed', 'run_time']
        db.create_unique('ecmo_feedpoint', ['feed_id', 'run_time'])

        # Adding model 'Screen'
        db.create_table('ecmo_screen', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('label', self.gf('django.db.models.fields.CharField')(max_length=128)),
            ('js_name', self.gf('django.db.models.fields.SlugField')(max_length=32, db_index=True)),
            ('template', self.gf('django.db.models.fields.SlugField')(max_length=32, db_index=True)),
        ))
        db.send_create_signal('ecmo', ['Screen'])

        # Adding M2M table for field regions on 'Screen'
        db.create_table('ecmo_screen_regions', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('screen', models.ForeignKey(orm['ecmo.screen'], null=False)),
            ('screenregion', models.ForeignKey(orm['ecmo.screenregion'], null=False))
        ))
        db.create_unique('ecmo_screen_regions', ['screen_id', 'screenregion_id'])

        # Adding model 'ScreenRegion'
        db.create_table('ecmo_screenregion', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('js_name', self.gf('django.db.models.fields.SlugField')(unique=True, max_length=32, db_index=True)),
        ))
        db.send_create_signal('ecmo', ['ScreenRegion'])

        # Adding model 'WidgetType'
        db.create_table('ecmo_widgettype', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('label', self.gf('django.db.models.fields.CharField')(max_length=64)),
            ('js_name', self.gf('django.db.models.fields.CharField')(unique=True, max_length=32)),
        ))
        db.send_create_signal('ecmo', ['WidgetType'])

        # Adding model 'WidgetSeries'
        db.create_table('ecmo_widgetseries', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('widget_type', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['ecmo.WidgetType'])),
            ('label', self.gf('django.db.models.fields.CharField')(max_length=64)),
            ('js_name', self.gf('django.db.models.fields.SlugField')(max_length=32, db_index=True)),
        ))
        db.send_create_signal('ecmo', ['WidgetSeries'])

        # Adding unique constraint on 'WidgetSeries', fields ['widget_type', 'js_name']
        db.create_unique('ecmo_widgetseries', ['widget_type_id', 'js_name'])

        # Adding model 'Widget'
        db.create_table('ecmo_widget', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('screen', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['ecmo.Screen'])),
            ('widget_type', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['ecmo.WidgetType'])),
            ('region', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['ecmo.ScreenRegion'])),
            ('position', self.gf('django.db.models.fields.SmallIntegerField')()),
        ))
        db.send_create_signal('ecmo', ['Widget'])

        # Adding unique constraint on 'Widget', fields ['screen', 'region', 'position']
        db.create_unique('ecmo_widget', ['screen_id', 'region_id', 'position'])


    def backwards(self, orm):
        
        # Removing unique constraint on 'Widget', fields ['screen', 'region', 'position']
        db.delete_unique('ecmo_widget', ['screen_id', 'region_id', 'position'])

        # Removing unique constraint on 'WidgetSeries', fields ['widget_type', 'js_name']
        db.delete_unique('ecmo_widgetseries', ['widget_type_id', 'js_name'])

        # Removing unique constraint on 'FeedPoint', fields ['feed', 'run_time']
        db.delete_unique('ecmo_feedpoint', ['feed_id', 'run_time'])

        # Removing unique constraint on 'FeedEvent', fields ['feed', 'run_time']
        db.delete_unique('ecmo_feedevent', ['feed_id', 'run_time'])

        # Removing unique constraint on 'Feed', fields ['js_name', 'run']
        db.delete_unique('ecmo_feed', ['js_name', 'run_id'])

        # Deleting model 'Run'
        db.delete_table('ecmo_run')

        # Deleting model 'Feed'
        db.delete_table('ecmo_feed')

        # Deleting model 'FeedEvent'
        db.delete_table('ecmo_feedevent')

        # Deleting model 'FeedPoint'
        db.delete_table('ecmo_feedpoint')

        # Deleting model 'Screen'
        db.delete_table('ecmo_screen')

        # Removing M2M table for field regions on 'Screen'
        db.delete_table('ecmo_screen_regions')

        # Deleting model 'ScreenRegion'
        db.delete_table('ecmo_screenregion')

        # Deleting model 'WidgetType'
        db.delete_table('ecmo_widgettype')

        # Deleting model 'WidgetSeries'
        db.delete_table('ecmo_widgetseries')

        # Deleting model 'Widget'
        db.delete_table('ecmo_widget')


    models = {
        'ecmo.feed': {
            'Meta': {'unique_together': "(('js_name', 'run'),)", 'object_name': 'Feed'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'js_name': ('django.db.models.fields.SlugField', [], {'max_length': '32', 'db_index': 'True'}),
            'max_val': ('django.db.models.fields.FloatField', [], {}),
            'min_val': ('django.db.models.fields.FloatField', [], {}),
            'run': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['ecmo.Run']"})
        },
        'ecmo.feedevent': {
            'Meta': {'unique_together': "(('feed', 'run_time'),)", 'object_name': 'FeedEvent'},
            'distribution': ('django.db.models.fields.CharField', [], {'max_length': '3'}),
            'feed': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['ecmo.Feed']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'run_time': ('django.db.models.fields.IntegerField', [], {}),
            'value': ('django.db.models.fields.FloatField', [], {})
        },
        'ecmo.feedpoint': {
            'Meta': {'unique_together': "(('feed', 'run_time'),)", 'object_name': 'FeedPoint'},
            'feed': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['ecmo.Feed']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'run_time': ('django.db.models.fields.IntegerField', [], {}),
            'value': ('django.db.models.fields.FloatField', [], {})
        },
        'ecmo.run': {
            'Meta': {'object_name': 'Run'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'start': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'})
        },
        'ecmo.screen': {
            'Meta': {'object_name': 'Screen'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'js_name': ('django.db.models.fields.SlugField', [], {'max_length': '32', 'db_index': 'True'}),
            'label': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'regions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['ecmo.ScreenRegion']", 'symmetrical': 'False'}),
            'template': ('django.db.models.fields.SlugField', [], {'max_length': '32', 'db_index': 'True'})
        },
        'ecmo.screenregion': {
            'Meta': {'object_name': 'ScreenRegion'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'js_name': ('django.db.models.fields.SlugField', [], {'unique': 'True', 'max_length': '32', 'db_index': 'True'})
        },
        'ecmo.widget': {
            'Meta': {'unique_together': "(('screen', 'region', 'position'),)", 'object_name': 'Widget'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'position': ('django.db.models.fields.SmallIntegerField', [], {}),
            'region': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['ecmo.ScreenRegion']"}),
            'screen': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['ecmo.Screen']"}),
            'widget_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['ecmo.WidgetType']"})
        },
        'ecmo.widgetseries': {
            'Meta': {'unique_together': "(('widget_type', 'js_name'),)", 'object_name': 'WidgetSeries'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'js_name': ('django.db.models.fields.SlugField', [], {'max_length': '32', 'db_index': 'True'}),
            'label': ('django.db.models.fields.CharField', [], {'max_length': '64'}),
            'widget_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['ecmo.WidgetType']"})
        },
        'ecmo.widgettype': {
            'Meta': {'object_name': 'WidgetType'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'js_name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '32'}),
            'label': ('django.db.models.fields.CharField', [], {'max_length': '64'})
        }
    }

    complete_apps = ['ecmo']
