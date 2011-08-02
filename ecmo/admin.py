from django.contrib import admin
import models

class FeedInlineAdmin(admin.TabularInline):
    model = models.Feed

class FeedEventInlineAdmin(admin.TabularInline):
    model = models.FeedEvent

class RunAdmin(admin.ModelAdmin):
    inlines = [FeedInlineAdmin]
admin.site.register(models.Run, RunAdmin)

class FeedAdmin(admin.ModelAdmin):
    inlines = [FeedEventInlineAdmin]
admin.site.register(models.Feed, FeedAdmin)

admin.site.register(models.FeedType)
admin.site.register(models.FeedEvent)
admin.site.register(models.FeedPoint)
admin.site.register(models.Screen)
admin.site.register(models.ScreenRegion)
admin.site.register(models.WidgetType)
admin.site.register(models.WidgetSeries)
admin.site.register(models.Widget)