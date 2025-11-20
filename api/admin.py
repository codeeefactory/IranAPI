from django.contrib import admin
from .models import Category, API, PricingPlan, Documentation, UserProfile, APIUsage


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'name_en', 'slug', 'color', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'name_en', 'description']
    prepopulated_fields = {'slug': ('name_en', 'name')}


@admin.register(API)
class APIAdmin(admin.ModelAdmin):
    list_display = ['name', 'name_en', 'category', 'status', 'is_featured', 'is_popular', 'rating', 'views_count', 'created_at']
    list_filter = ['status', 'is_featured', 'is_popular', 'category', 'created_at']
    search_fields = ['name', 'name_en', 'description', 'tags']
    prepopulated_fields = {'slug': ('name_en', 'name')}
    readonly_fields = ['views_count', 'rating', 'rating_count', 'created_at', 'updated_at']
    filter_horizontal = []


@admin.register(PricingPlan)
class PricingPlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'api', 'plan_type', 'price', 'currency', 'is_popular', 'is_active', 'created_at']
    list_filter = ['plan_type', 'is_popular', 'is_active', 'created_at']
    search_fields = ['name', 'api__name']
    raw_id_fields = ['api']


@admin.register(Documentation)
class DocumentationAdmin(admin.ModelAdmin):
    list_display = ['title', 'api', 'order', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['title', 'content', 'api__name']
    raw_id_fields = ['api']
    prepopulated_fields = {'slug': ('title',)}


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone', 'company', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'user__email', 'phone', 'company']
    raw_id_fields = ['user']


@admin.register(APIUsage)
class APIUsageAdmin(admin.ModelAdmin):
    list_display = ['user', 'api', 'requests_count', 'last_used', 'created_at']
    list_filter = ['last_used', 'created_at']
    search_fields = ['user__username', 'api__name']
    raw_id_fields = ['user', 'api']
    readonly_fields = ['last_used', 'created_at']
