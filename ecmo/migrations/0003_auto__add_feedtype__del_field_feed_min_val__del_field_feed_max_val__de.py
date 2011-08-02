# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Removing unique constraint on 'Feed', fields ['run', 'js_name']
        db.delete_unique('ecmo_feed', ['run_id', 'js_name'])

        # Adding model 'FeedType'
        db.create_table('ecmo_feedtype', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('label', self.gf('django.db.models.fields.CharField')(max_length=64)),
            ('js_name', self.gf('django.db.models.fields.SlugField')(unique=True, max_length=32, db_index=True)),
            ('min_val', self.gf('django.db.models.fields.FloatField')()),
            ('max_val', self.gf('django.db.models.fields.FloatField')()),
        ))
        db.send_create_signal('ecmo', ['FeedType'])

        # Deleting field 'Feed.min_val'
        db.delete_column('ecmo_feed', 'min_val')

        # Deleting field 'Feed.max_val'
        db.delete_column('ecmo_feed', 'max_val')

        # Deleting field 'Feed.js_name'
        db.delete_column('ecmo_feed', 'js_name')

        # Adding field 'Feed.feed_type'
        db.add_column('ecmo_feed', 'feed_type', self.gf('django.db.models.fields.related.ForeignKey')(default=1, to=orm['ecmo.FeedType']), keep_default=False)

        # Adding unique constraint on 'Feed', fields ['feed_type', 'run']
        db.create_unique('ecmo_feed', ['feed_type_id', 'run_id'])


    def backwards(self, orm):
        
        # Removing unique constraint on 'Feed', fields ['feed_type', 'run']
        db.delete_unique('ecmo_feed', ['feed_type_id', 'run_id'])

        # Deleting model 'FeedType'
        db.delete_table('ecmo_feedtype')

        # User chose to not deal with backwards NULL issues for 'Feed.min_val'
        raise RuntimeError("Cannot reverse this migration. 'Feed.min_val' and its values cannot be restored.")

        # User chose to not deal with backwards NULL issues for 'Feed.max_val'
        raise RuntimeError("Cannot reverse this migration. 'Feed.max_val' and its values cannot be restored.")

        # User chose to not deal with backwards NULL issues for 'Feed.js_name'
        raise RuntimeError("Cannot reverse this migration. 'Feed.js_name' and its values cannot be restored.")

        # Deleting field 'Feed.feed_type'
        db.delete_column('ecmo_feed', 'feed_type_id')

        # Adding unique constraint on 'Feed', fields ['run', 'js_name']
        db.create_unique('ecmo_feed', ['run_id', 'js_name'])


    models = {
        'ecmo.feed': {
            'Meta': {'unique_together': "(('feed_type', 'run'),)", 'object_name': 'Feed'},
            'feed_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['ecmo.FeedType']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
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
        'ecmo.feedtype': {
            'Meta': {'object_name': 'FeedType'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'js_name': ('django.db.models.fields.SlugField', [], {'unique': 'True', 'max_length': '32', 'db_index': 'True'}),
            'label': ('django.db.models.fields.CharField', [], {'max_length': '64'}),
            'max_val': ('django.db.models.fields.FloatField', [], {}),
            'min_val': ('django.db.models.fields.FloatField', [], {})
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
