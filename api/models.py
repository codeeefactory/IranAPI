from django.contrib.auth.models import User
from django.core.validators import MaxValueValidator, MinValueValidator, RegexValidator
from django.db import models
from django.urls import reverse
from django.utils.text import slugify


hex_color_validator = RegexValidator(
    regex=r"^#[0-9A-Fa-f]{6}$",
    message="Color must be a valid 6-digit hex value.",
)


def build_unique_slug(instance, source_value: str, *, fallback: str = "item") -> str:
    field = instance._meta.get_field("slug")
    max_length = getattr(field, "max_length", 50)
    base = slugify(source_value, allow_unicode=True).strip("-")[:max_length] or fallback
    slug = base
    index = 2
    queryset = instance.__class__.objects.all()
    if instance.pk:
        queryset = queryset.exclude(pk=instance.pk)

    while queryset.filter(slug=slug).exists():
        suffix = f"-{index}"
        slug = f"{base[: max_length - len(suffix)]}{suffix}"
        index += 1
    return slug


def build_slug(instance, source_value: str, *, fallback: str = "item") -> str:
    field = instance._meta.get_field("slug")
    max_length = getattr(field, "max_length", 50)
    return slugify(source_value, allow_unicode=True).strip("-")[:max_length] or fallback


class Category(models.Model):
    """API Categories"""
    name = models.CharField(max_length=100, verbose_name="نام")
    name_en = models.CharField(max_length=100, blank=True, verbose_name="نام انگلیسی")
    slug = models.SlugField(unique=True, blank=True, allow_unicode=True)
    description = models.TextField(blank=True, verbose_name="توضیحات")
    icon = models.CharField(max_length=50, blank=True, verbose_name="آیکون")
    color = models.CharField(max_length=7, default="#3b82f6", validators=[hex_color_validator], verbose_name="رنگ")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "دسته‌بندی"
        verbose_name_plural = "دسته‌بندی‌ها"
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = build_unique_slug(self, self.name_en or self.name, fallback="category")
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class API(models.Model):
    """API Model"""
    STATUS_CHOICES = [
        ('active', 'فعال'),
        ('inactive', 'غیرفعال'),
        ('beta', 'بتا'),
        ('deprecated', 'منسوخ شده'),
    ]

    name = models.CharField(max_length=200, verbose_name="نام")
    name_en = models.CharField(max_length=200, blank=True, verbose_name="نام انگلیسی")
    slug = models.SlugField(unique=True, blank=True, allow_unicode=True)
    description = models.TextField(verbose_name="توضیحات")
    short_description = models.CharField(max_length=300, blank=True, verbose_name="توضیحات کوتاه")
    
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='apis', verbose_name="دسته‌بندی")
    
    base_url = models.URLField(verbose_name="آدرس پایه API")
    documentation_url = models.URLField(blank=True, verbose_name="آدرس مستندات")
    
    logo = models.URLField(blank=True, verbose_name="لوگو")
    banner = models.URLField(blank=True, verbose_name="بنر")
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', verbose_name="وضعیت")
    
    is_featured = models.BooleanField(default=False, verbose_name="ویژه")
    is_popular = models.BooleanField(default=False, verbose_name="محبوب")
    
    views_count = models.PositiveIntegerField(default=0, verbose_name="تعداد بازدید")
    rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name="امتیاز",
    )
    rating_count = models.PositiveIntegerField(default=0, verbose_name="تعداد امتیاز")
    
    tags = models.JSONField(default=list, blank=True, verbose_name="تگ‌ها")
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_apis', verbose_name="ایجاد کننده")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "API"
        verbose_name_plural = "API ها"
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = build_unique_slug(self, self.name_en or self.name, fallback="api")
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse('api-detail', kwargs={'slug': self.slug})


class PricingPlan(models.Model):
    """Pricing Plans for APIs"""
    PLAN_TYPES = [
        ('free', 'رایگان'),
        ('basic', 'پایه'),
        ('pro', 'حرفه‌ای'),
        ('enterprise', 'سازمانی'),
    ]

    api = models.ForeignKey(API, on_delete=models.CASCADE, related_name='pricing_plans', verbose_name="API")
    name = models.CharField(max_length=100, verbose_name="نام")
    plan_type = models.CharField(max_length=20, choices=PLAN_TYPES, default='basic', verbose_name="نوع پلن")
    
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0)],
        verbose_name="قیمت",
    )
    currency = models.CharField(
        max_length=3,
        default='IRR',
        validators=[RegexValidator(regex=r"^[A-Z]{3}$", message="Currency must be a 3-letter ISO code.")],
        verbose_name="ارز",
    )
    
    requests_per_month = models.PositiveIntegerField(null=True, blank=True, verbose_name="درخواست در ماه")
    requests_per_day = models.PositiveIntegerField(null=True, blank=True, verbose_name="درخواست در روز")
    
    features = models.JSONField(default=list, blank=True, verbose_name="ویژگی‌ها")
    
    is_popular = models.BooleanField(default=False, verbose_name="محبوب")
    is_active = models.BooleanField(default=True, verbose_name="فعال")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "پلن قیمت‌گذاری"
        verbose_name_plural = "پلن‌های قیمت‌گذاری"
        ordering = ['price']

    def __str__(self):
        return f"{self.api.name} - {self.name}"


class Documentation(models.Model):
    """API Documentation"""
    api = models.ForeignKey(API, on_delete=models.CASCADE, related_name='documentations', verbose_name="API")
    title = models.CharField(max_length=200, verbose_name="عنوان")
    slug = models.SlugField(blank=True, allow_unicode=True)
    content = models.TextField(verbose_name="محتوای")
    order = models.PositiveIntegerField(default=0, verbose_name="ترتیب")
    is_active = models.BooleanField(default=True, verbose_name="فعال")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "مستندات"
        verbose_name_plural = "مستندات"
        ordering = ['order', 'title']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = build_slug(self, self.title, fallback="doc")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.api.name} - {self.title}"


class UserProfile(models.Model):
    """Extended User Profile"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile', verbose_name="کاربر")
    phone = models.CharField(max_length=20, blank=True, verbose_name="تلفن")
    company = models.CharField(max_length=200, blank=True, verbose_name="شرکت")
    bio = models.TextField(blank=True, verbose_name="بیوگرافی")
    avatar = models.URLField(blank=True, null=True, verbose_name="آواتار")
    api_key = models.CharField(max_length=100, blank=True, null=True, unique=True, verbose_name="کلید API")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "پروفایل کاربر"
        verbose_name_plural = "پروفایل‌های کاربران"

    def __str__(self):
        return f"{self.user.username} Profile"


class APIUsage(models.Model):
    """Track API Usage"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='api_usage', verbose_name="کاربر")
    api = models.ForeignKey(API, on_delete=models.CASCADE, related_name='usage_stats', verbose_name="API")
    requests_count = models.PositiveIntegerField(default=0, verbose_name="تعداد درخواست")
    last_used = models.DateTimeField(auto_now=True, verbose_name="آخرین استفاده")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "استفاده از API"
        verbose_name_plural = "استفاده از API ها"
        unique_together = ['user', 'api']

    def __str__(self):
        return f"{self.user.username} - {self.api.name}"
