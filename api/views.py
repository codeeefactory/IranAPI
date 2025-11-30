from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.db.models import Q, Count, Avg
from django.utils import timezone
from datetime import timedelta

from .models import Category, API, PricingPlan, Documentation, UserProfile, APIUsage
from .serializers import (
    CategorySerializer, APISerializer, APISummarySerializer,
    PricingPlanSerializer, DocumentationSerializer,
    UserSerializer, UserProfileSerializer, UserRegistrationSerializer,
    LoginSerializer, APIUsageSerializer
)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    search_fields = ['name', 'name_en', 'description']
    ordering_fields = ['name', 'created_at']

    @action(detail=True, methods=['get'])
    def apis(self, request, pk=None):
        """Get all APIs in a category"""
        category = self.get_object()
        apis = API.objects.filter(category=category, status='active')
        serializer = APISummarySerializer(apis, many=True)
        return Response(serializer.data)


class APIViewSet(viewsets.ModelViewSet):
    queryset = API.objects.all()
    permission_classes = [AllowAny]
    search_fields = ['name', 'name_en', 'description', 'short_description', 'tags']
    ordering_fields = ['created_at', 'rating', 'views_count', 'name']
    filterset_fields = ['category', 'status', 'is_featured', 'is_popular']

    def get_serializer_class(self):
        if self.action == 'list':
            return APISummarySerializer
        return APISerializer

    def get_queryset(self):
        queryset = API.objects.select_related('category', 'created_by').prefetch_related('pricing_plans', 'documentations')
        
        # Filter by status if not authenticated or not admin
        if not self.request.user.is_authenticated or not self.request.user.is_staff:
            queryset = queryset.filter(status='active')
        
        # Filter featured APIs
        if self.request.query_params.get('featured') == 'true':
            queryset = queryset.filter(is_featured=True)
        
        # Filter popular APIs
        if self.request.query_params.get('popular') == 'true':
            queryset = queryset.filter(is_popular=True)
        
        return queryset

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view count
        instance.views_count += 1
        instance.save(update_fields=['views_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def similar(self, request, pk=None):
        """Get similar APIs"""
        api = self.get_object()
        similar_apis = API.objects.filter(
            Q(category=api.category) | Q(tags__overlap=api.tags),
            status='active'
        ).exclude(id=api.id)[:5]
        serializer = APISummarySerializer(similar_apis, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def rate(self, request, pk=None):
        """Rate an API"""
        api = self.get_object()
        rating = request.data.get('rating')
        
        if not rating or not (1 <= float(rating) <= 5):
            return Response(
                {'error': 'امتیاز باید بین 1 تا 5 باشد'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update rating (simplified - in production, use a separate Rating model)
        current_rating = api.rating or 0
        current_count = api.rating_count or 0
        new_rating = ((current_rating * current_count) + float(rating)) / (current_count + 1)
        
        api.rating = round(new_rating, 2)
        api.rating_count = current_count + 1
        api.save()
        
        return Response({'rating': api.rating, 'rating_count': api.rating_count})


class PricingPlanViewSet(viewsets.ModelViewSet):
    queryset = PricingPlan.objects.filter(is_active=True)
    serializer_class = PricingPlanSerializer
    permission_classes = [AllowAny]
    filterset_fields = ['api', 'plan_type', 'is_popular']

    def get_queryset(self):
        queryset = PricingPlan.objects.filter(is_active=True).select_related('api')
        api_id = self.request.query_params.get('api')
        if api_id:
            queryset = queryset.filter(api_id=api_id)
        return queryset


class DocumentationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Documentation.objects.filter(is_active=True)
    serializer_class = DocumentationSerializer
    permission_classes = [AllowAny]
    filterset_fields = ['api']

    def get_queryset(self):
        queryset = Documentation.objects.filter(is_active=True).select_related('api')
        api_id = self.request.query_params.get('api')
        if api_id:
            queryset = queryset.filter(api_id=api_id)
        return queryset.order_by('order', 'title')


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    @action(detail=False, methods=['get', 'put', 'patch'])
    def me(self, request):
        """Get or update current user"""
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        """User registration"""
        import sys
        import json
        
        try:
            # Log request data - use both print and logger
            print("=" * 50, file=sys.stderr)
            print("REGISTRATION REQUEST RECEIVED", file=sys.stderr)
            print(f"Method: {request.method}", file=sys.stderr)
            print(f"Content-Type: {request.content_type}", file=sys.stderr)
            print(f"Data type: {type(request.data)}", file=sys.stderr)
            
            # Get data
            if hasattr(request, 'data') and request.data:
                data = dict(request.data) if hasattr(request.data, 'keys') else request.data
            else:
                import json
                try:
                    data = json.loads(request.body.decode('utf-8')) if request.body else {}
                except:
                    data = {}
            
            print(f"Request data: {json.dumps(data, default=str, ensure_ascii=False)}", file=sys.stderr)
            sys.stderr.flush()
            
            serializer = UserRegistrationSerializer(data=data)
            if serializer.is_valid():
                user = serializer.save()
                token, created = Token.objects.get_or_create(user=user)
                print(f"Registration successful for user: {user.username}", file=sys.stderr)
                sys.stderr.flush()
                return Response({
                    'user': UserSerializer(user).data,
                    'token': token.key
                }, status=status.HTTP_201_CREATED)
            
            # Log validation errors
            errors = dict(serializer.errors)
            print("=" * 50, file=sys.stderr)
            print("SERIALIZER VALIDATION ERRORS", file=sys.stderr)
            print(json.dumps(errors, default=str, ensure_ascii=False, indent=2), file=sys.stderr)
            sys.stderr.flush()
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import traceback
            print("=" * 50, file=sys.stderr)
            print("REGISTRATION EXCEPTION", file=sys.stderr)
            print(f"Error: {str(e)}", file=sys.stderr)
            print(traceback.format_exc(), file=sys.stderr)
            sys.stderr.flush()
            return Response(
                {'detail': f'خطا در ثبت‌نام: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        """User login"""
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'user': UserSerializer(user).data,
                'token': token.key
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def logout(self, request):
        """User logout"""
        try:
            request.user.auth_token.delete()
        except:
            pass
        return Response({'message': 'با موفقیت خارج شدید'})


class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile

    @action(detail=False, methods=['get', 'put', 'patch'])
    def me(self, request):
        """Get or update current user profile"""
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def generate_api_key(self, request):
        """Generate a new API key for the user"""
        import secrets
        import string
        
        if not request.user.is_authenticated:
            return Response(
                {'detail': 'Authentication credentials were not provided.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        try:
            profile, created = UserProfile.objects.get_or_create(user=request.user)
            
            # Generate a secure random API key
            alphabet = string.ascii_letters + string.digits
            api_key = 'iapi_' + ''.join(secrets.choice(alphabet) for _ in range(32))
            
            # Ensure uniqueness
            max_attempts = 10
            attempts = 0
            while UserProfile.objects.filter(api_key=api_key).exclude(user=request.user).exists() and attempts < max_attempts:
                api_key = 'iapi_' + ''.join(secrets.choice(alphabet) for _ in range(32))
                attempts += 1
            
            profile.api_key = api_key
            profile.save()
            
            serializer = UserProfileSerializer(profile)
            return Response({
                'api_key': api_key,
                'profile': serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'detail': f'خطا در ساخت کلید API: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class APIUsageViewSet(viewsets.ModelViewSet):
    serializer_class = APIUsageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return APIUsage.objects.filter(user=self.request.user).select_related('api')

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get usage statistics"""
        usage = self.get_queryset()
        total_requests = usage.aggregate(total=Count('requests_count'))['total'] or 0
        recent_usage = usage.filter(last_used__gte=timezone.now() - timedelta(days=30))
        
        return Response({
            'total_requests': total_requests,
            'active_apis': usage.count(),
            'recent_usage_count': recent_usage.count(),
        })
