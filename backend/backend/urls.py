"""
URL configuration for backend project.
Alma Artesana E-commerce
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

# Health check / root view
def health_check(request):
    return JsonResponse({
        "status": "ok",
        "app": "Alma Artesana API",
        "version": "1.0",
        "endpoints": {
            "admin": "/admin/",
            "api": "/api/",
            "products": "/api/products/",
            "categories": "/api/categories/"
        }
    })

urlpatterns = [
    path('', health_check),  # ← AGREGA ESTA LÍNEA
    path('admin/', admin.site.urls),
    path('api/', include('shop.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
