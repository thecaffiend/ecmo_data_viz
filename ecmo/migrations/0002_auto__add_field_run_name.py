# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Adding field 'Run.name'
        db.add_column('ecmo_run', 'name', self.gf('django.db.models.fields.CharField')(default='Foo', max_length=64), keep_default=False)


    def backwards(self, orm):
        
        # Deleting field 'Run.name'
        db.delete_column('ecmo_run', 'name')


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
            'name': ('django.db.models.fields.CharField', [], {'max_length': '64'}),
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
