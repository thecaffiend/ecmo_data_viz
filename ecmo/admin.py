from django.contrib import admin
import models

admin.site.register(models.Run)
admin.site.register(models.Feed)
admin.site.register(models.FeedEvent)
admin.site.register(models.FeedPoint)
admin.site.register(models.Screen)
admin.site.register(models.ScreenRegion)
admin.site.register(models.WidgetType)
admin.site.register(models.WidgetSeries)
admin.site.register(models.Widget)