from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path, re_path

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from api import views

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'apis', views.APIViewSet, basename='api')
router.register(r'pricing-plans', views.PricingPlanViewSet, basename='pricing-plan')
router.register(r'documentations', views.DocumentationViewSet, basename='documentation')
router.register(r'users', views.UserViewSet, basename='user')
router.register(r'profiles', views.UserProfileViewSet, basename='profile')
router.register(r'usage', views.APIUsageViewSet, basename='usage')

urlpatterns = [
    path("admin/", admin.site.urls),
    re_path(
        r"^api/(?!(?:v1|auth|health|usage|profile|categories|apis|pricing-plans|documentations)/)(?P<slug>[-\w]+)/?$",
        frontend_app,
        name="frontend-api-detail",
    ),
    path("api/", include("api.urls")),
    path("robots.txt", robots_txt, name="robots-txt"),
    path("sitemap.xml", sitemap_xml, name="sitemap-xml"),
]
