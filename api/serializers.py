from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Category, API, PricingPlan, Documentation, UserProfile, APIUsage


class CategorySerializer(serializers.ModelSerializer):
    apis_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'name_en', 'slug', 'description', 'icon', 'color', 'apis_count', 'created_at', 'updated_at']
        read_only_fields = ['slug', 'created_at', 'updated_at']

    def get_apis_count(self, obj):
        return obj.apis.filter(status='active').count()


class PricingPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = PricingPlan
        fields = ['id', 'name', 'plan_type', 'price', 'currency', 'requests_per_month', 
                  'requests_per_day', 'features', 'is_popular', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class DocumentationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Documentation
        fields = ['id', 'title', 'slug', 'content', 'order', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['slug', 'created_at', 'updated_at']


class APISerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), 
        source='category', 
        write_only=True, 
        required=False
    )
    pricing_plans = PricingPlanSerializer(many=True, read_only=True)
    documentations = DocumentationSerializer(many=True, read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = API
        fields = ['id', 'name', 'name_en', 'slug', 'description', 'short_description', 
                  'category', 'category_id', 'base_url', 'documentation_url', 
                  'logo', 'banner', 'status', 'is_featured', 'is_popular', 
                  'views_count', 'rating', 'rating_count', 'tags', 
                  'created_by', 'created_by_username', 'created_at', 'updated_at',
                  'pricing_plans', 'documentations']
        read_only_fields = ['slug', 'views_count', 'rating', 'rating_count', 'created_by', 'created_at', 'updated_at']


class APISummarySerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    category = CategorySerializer(read_only=True)

    class Meta:
        model = API
        fields = ['id', 'name', 'name_en', 'slug', 'short_description', 'category', 
                  'logo', 'status', 'is_featured', 'is_popular', 'rating', 
                  'rating_count', 'tags', 'created_at']


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['date_joined']


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'phone', 'company', 'bio', 'avatar', 'api_key', 'created_at', 'updated_at']
        read_only_fields = ['api_key', 'created_at', 'updated_at']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "رمزهای عبور مطابقت ندارند"})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        UserProfile.objects.create(user=user)
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('نام کاربری یا رمز عبور اشتباه است')
            if not user.is_active:
                raise serializers.ValidationError('حساب کاربری غیرفعال است')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('نام کاربری و رمز عبور الزامی است')
        return attrs


class APIUsageSerializer(serializers.ModelSerializer):
    api = APISummarySerializer(read_only=True)

    class Meta:
        model = APIUsage
        fields = ['id', 'api', 'requests_count', 'last_used', 'created_at']
        read_only_fields = ['created_at']

