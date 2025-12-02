from rest_framework import viewsets, filters, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q, Sum, F
from django.contrib.auth.models import User
from decimal import Decimal

from .models import Category, Product, UserProfile, Order, CartItem, Wishlist
from .serializers import (
    CategorySerializer,
    ProductListSerializer,
    ProductDetailSerializer,
    UserSerializer,
    RegisterSerializer,
    UpdateProfileSerializer,
    CartItemSerializer,
    WishlistSerializer,
    OrderSerializer,
    CreateOrderSerializer
)


# =====================================================
# AUTH VIEWS
# =====================================================

class RegisterView(generics.CreateAPIView):
    """
    Register a new user
    POST /api/auth/register/
    """
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Usuario registrado exitosamente'
        }, status=status.HTTP_201_CREATED)


class ProfileView(generics.RetrieveUpdateAPIView):
    """
    Get/Update current user profile
    GET/PUT /api/auth/profile/
    """
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UpdateProfileSerializer
        return UserSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Change user password
    POST /api/auth/change-password/
    """
    user = request.user
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')
    
    if not user.check_password(current_password):
        return Response(
            {'error': 'Contraseña actual incorrecta'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user.set_password(new_password)
    user.save()
    
    return Response({'message': 'Contraseña actualizada exitosamente'})


# =====================================================
# PRODUCT VIEWS
# =====================================================

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for categories.
    
    list: GET /api/categories/
    retrieve: GET /api/categories/{slug}/
    """
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    lookup_field = 'slug'

    @action(detail=True, methods=['get'])
    def products(self, request, slug=None):
        """Get all products in a category: GET /api/categories/{slug}/products/"""
        category = self.get_object()
        products = Product.objects.filter(
            category=category,
            is_active=True
        )
        serializer = ProductListSerializer(
            products,
            many=True,
            context={'request': request}
        )
        return Response(serializer.data)


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for products.
    
    list: GET /api/products/
    retrieve: GET /api/products/{slug}/
    
    Query params:
    - category: filter by category slug
    - search: search in name and description
    - badge: filter by badge (new, bestseller, sale, etc.)
    - min_price: minimum price filter
    - max_price: maximum price filter
    - in_stock: true/false
    - featured: true/false
    - ordering: price, -price, name, -name, created_at, -created_at
    """
    queryset = Product.objects.filter(is_active=True)
    lookup_field = 'slug'
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['price', 'name', 'created_at']
    ordering = ['-is_featured', '-created_at']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        params = self.request.query_params

        # Filter by category
        category = params.get('category')
        if category:
            queryset = queryset.filter(category__slug=category)

        # Search
        search = params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(short_description__icontains=search) |
                Q(artisan_name__icontains=search) |
                Q(materials__icontains=search)
            )

        # Filter by badge
        badge = params.get('badge')
        if badge:
            queryset = queryset.filter(badge=badge)

        # Price range
        min_price = params.get('min_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        
        max_price = params.get('max_price')
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        # In stock filter
        in_stock = params.get('in_stock')
        if in_stock == 'true':
            queryset = queryset.filter(stock__gt=0)
        elif in_stock == 'false':
            queryset = queryset.filter(stock=0)

        # Featured filter
        featured = params.get('featured')
        if featured == 'true':
            queryset = queryset.filter(is_featured=True)

        return queryset

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured products: GET /api/products/featured/"""
        products = self.get_queryset().filter(is_featured=True)[:8]
        serializer = ProductListSerializer(
            products,
            many=True,
            context={'request': request}
        )
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def new_arrivals(self, request):
        """Get newest products: GET /api/products/new_arrivals/"""
        products = self.get_queryset().order_by('-created_at')[:8]
        serializer = ProductListSerializer(
            products,
            many=True,
            context={'request': request}
        )
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def on_sale(self, request):
        """Get products on sale: GET /api/products/on_sale/"""
        products = self.get_queryset().filter(
            original_price__isnull=False,
            original_price__gt=0
        )[:8]
        serializer = ProductListSerializer(
            products,
            many=True,
            context={'request': request}
        )
        return Response(serializer.data)


# =====================================================
# CART VIEWS
# =====================================================

class CartView(generics.GenericAPIView):
    """
    User cart management
    GET /api/cart/ - Get cart
    POST /api/cart/ - Add item to cart
    """
    permission_classes = [IsAuthenticated]
    serializer_class = CartItemSerializer

    def get(self, request):
        """Get user's cart with totals"""
        items = CartItem.objects.filter(user=request.user).select_related('product')
        
        # Calculate totals
        subtotal = sum(item.subtotal for item in items)
        shipping = Decimal('0') if subtotal >= 500 else Decimal('35')
        total = subtotal + shipping
        
        serializer = CartItemSerializer(items, many=True, context={'request': request})
        
        return Response({
            'items': serializer.data,
            'total_items': sum(item.quantity for item in items),
            'subtotal': str(subtotal),
            'shipping': str(shipping),
            'total': str(total)
        })

    def post(self, request):
        """Add item to cart"""
        serializer = CartItemSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CartItemView(generics.RetrieveUpdateDestroyAPIView):
    """
    Manage individual cart items
    GET/PUT/DELETE /api/cart/{id}/
    """
    permission_classes = [IsAuthenticated]
    serializer_class = CartItemSerializer

    def get_queryset(self):
        return CartItem.objects.filter(user=self.request.user)

    def update(self, request, *args, **kwargs):
        """Update quantity"""
        instance = self.get_object()
        quantity = request.data.get('quantity', 1)
        
        if quantity <= 0:
            instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        
        instance.quantity = quantity
        instance.save()
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def clear_cart(request):
    """
    Clear all items from cart
    DELETE /api/cart/clear/
    """
    CartItem.objects.filter(user=request.user).delete()
    return Response({'message': 'Carrito vaciado'}, status=status.HTTP_204_NO_CONTENT)


# =====================================================
# WISHLIST VIEWS
# =====================================================

class WishlistView(generics.ListCreateAPIView):
    """
    User wishlist management
    GET /api/wishlist/ - Get wishlist
    POST /api/wishlist/ - Add item to wishlist
    """
    permission_classes = [IsAuthenticated]
    serializer_class = WishlistSerializer

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user).select_related('product')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class WishlistItemView(generics.DestroyAPIView):
    """
    Remove item from wishlist
    DELETE /api/wishlist/{id}/
    """
    permission_classes = [IsAuthenticated]
    serializer_class = WishlistSerializer

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_wishlist(request):
    """
    Toggle product in wishlist
    POST /api/wishlist/toggle/
    """
    product_id = request.data.get('product_id')
    
    if not product_id:
        return Response(
            {'error': 'product_id is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    wishlist_item, created = Wishlist.objects.get_or_create(
        user=request.user,
        product_id=product_id
    )
    
    if not created:
        wishlist_item.delete()
        return Response({'action': 'removed', 'in_wishlist': False})
    
    return Response({'action': 'added', 'in_wishlist': True})


# =====================================================
# ORDER VIEWS
# =====================================================

class OrderListView(generics.ListAPIView):
    """
    Get user's orders
    GET /api/orders/
    """
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


class OrderDetailView(generics.RetrieveAPIView):
    """
    Get order details
    GET /api/orders/{order_number}/
    """
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer
    lookup_field = 'order_number'

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


class CreateOrderView(generics.CreateAPIView):
    """
    Create a new order
    POST /api/orders/create/
    """
    permission_classes = [AllowAny]  # Allow guest checkout
    serializer_class = CreateOrderSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        
        return Response({
            'order': OrderSerializer(order).data,
            'message': 'Orden creada exitosamente'
        }, status=status.HTTP_201_CREATED)