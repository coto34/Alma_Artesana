from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import (
    Category, Product, ProductImage, 
    UserProfile, Order, OrderItem, Wishlist, CartItem
)


# =====================================================
# PRODUCT SERIALIZERS
# =====================================================

class ProductImageSerializer(serializers.ModelSerializer):
    """Serializer for product images"""
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'image_url', 'alt_text', 'is_primary', 'order']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for categories"""
    product_count = serializers.ReadOnlyField()

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'image', 
            'icon', 'product_count', 'is_active'
        ]


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for product listings"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    primary_image = serializers.SerializerMethodField()
    in_stock = serializers.ReadOnlyField()
    discount_percentage = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'short_description',
            'price', 'original_price', 'discount_percentage',
            'category', 'category_name', 'category_slug',
            'badge', 'stock', 'in_stock',
            'primary_image', 'is_featured'
        ]

    def get_primary_image(self, obj):
        request = self.context.get('request')
        primary = obj.images.filter(is_primary=True).first()
        if not primary:
            primary = obj.images.first()
        if primary and request:
            return request.build_absolute_uri(primary.image.url)
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    """Full serializer for product detail page"""
    category = CategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    in_stock = serializers.ReadOnlyField()
    discount_percentage = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'short_description',
            'price', 'original_price', 'discount_percentage',
            'category', 'badge', 'stock', 'in_stock', 'sku',
            'artisan_name', 'origin', 'materials',
            'dimensions', 'weight',
            'images', 'is_featured',
            'created_at', 'updated_at'
        ]


# =====================================================
# AUTH SERIALIZERS
# =====================================================

class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile"""
    class Meta:
        model = UserProfile
        fields = [
            'phone', 'address', 'address_line2', 
            'city', 'department', 'postal_code'
        ]


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user info"""
    profile = UserProfileSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name', 'profile']
        read_only_fields = ['id', 'username']

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True, 
        required=True,
        style={'input_type': 'password'}
    )
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'password_confirm', 'first_name', 'last_name']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password_confirm": "Las contraseñas no coinciden."
            })
        
        # Check if email already exists
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({
                "email": "Ya existe un usuario con este email."
            })
        
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['email'],  # Use email as username
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        # Create profile
        UserProfile.objects.create(user=user)
        return user


class UpdateProfileSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    phone = serializers.CharField(source='profile.phone', required=False, allow_blank=True)
    address = serializers.CharField(source='profile.address', required=False, allow_blank=True)
    address_line2 = serializers.CharField(source='profile.address_line2', required=False, allow_blank=True)
    city = serializers.CharField(source='profile.city', required=False, allow_blank=True)
    department = serializers.CharField(source='profile.department', required=False, allow_blank=True)
    postal_code = serializers.CharField(source='profile.postal_code', required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'email',
            'phone', 'address', 'address_line2', 'city', 'department', 'postal_code'
        ]

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        
        # Update user fields
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.email = validated_data.get('email', instance.email)
        instance.save()
        
        # Update profile fields
        profile = instance.profile
        for field, value in profile_data.items():
            setattr(profile, field, value)
        profile.save()
        
        return instance


# =====================================================
# CART SERIALIZERS
# =====================================================

class CartItemSerializer(serializers.ModelSerializer):
    """Serializer for cart items"""
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'subtotal']

    def create(self, validated_data):
        user = self.context['request'].user
        product_id = validated_data['product_id']
        quantity = validated_data.get('quantity', 1)
        
        # Update if exists, create if not
        cart_item, created = CartItem.objects.update_or_create(
            user=user,
            product_id=product_id,
            defaults={'quantity': quantity}
        )
        
        if not created:
            # If item existed, add to quantity
            cart_item.quantity += quantity
            cart_item.save()
        
        return cart_item


class CartSerializer(serializers.Serializer):
    """Serializer for full cart"""
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    shipping = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)


# =====================================================
# WISHLIST SERIALIZERS
# =====================================================

class WishlistSerializer(serializers.ModelSerializer):
    """Serializer for wishlist items"""
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'product', 'product_id', 'created_at']

    def create(self, validated_data):
        user = self.context['request'].user
        product_id = validated_data['product_id']
        
        wishlist_item, created = Wishlist.objects.get_or_create(
            user=user,
            product_id=product_id
        )
        return wishlist_item


# =====================================================
# ORDER SERIALIZERS
# =====================================================

class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for order items"""
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product_name', 'product_price', 'quantity', 'subtotal']


class OrderSerializer(serializers.ModelSerializer):
    """Serializer for orders"""
    items = OrderItemSerializer(many=True, read_only=True)
    full_name = serializers.ReadOnlyField()
    full_address = serializers.ReadOnlyField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'email', 'phone',
            'first_name', 'last_name', 'full_name',
            'address', 'address_line2', 'city', 'department', 'postal_code', 'full_address',
            'subtotal', 'shipping_cost', 'total',
            'status', 'status_display', 
            'payment_method', 'payment_method_display',
            'is_paid', 'paid_at',
            'notes', 'items',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['order_number', 'is_paid', 'paid_at', 'created_at', 'updated_at']


class CreateOrderSerializer(serializers.ModelSerializer):
    """Serializer for creating orders"""
    items = serializers.ListField(
        child=serializers.DictField(),
        write_only=True
    )

    class Meta:
        model = Order
        fields = [
            'email', 'phone',
            'first_name', 'last_name',
            'address', 'address_line2', 'city', 'department', 'postal_code',
            'payment_method', 'notes', 'items'
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        user = self.context['request'].user if self.context['request'].user.is_authenticated else None
        
        # Calculate totals
        subtotal = sum(
            item['price'] * item['quantity'] 
            for item in items_data
        )
        shipping = 0 if subtotal >= 500 else 35
        total = subtotal + shipping
        
        # Create order
        order = Order.objects.create(
            user=user,
            subtotal=subtotal,
            shipping_cost=shipping,
            total=total,
            **validated_data
        )
        
        # Create order items
        for item_data in items_data:
            product = Product.objects.filter(id=item_data['product_id']).first()
            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=item_data['name'],
                product_price=item_data['price'],
                quantity=item_data['quantity']
            )
            
            # Reduce stock
            if product:
                product.stock = max(0, product.stock - item_data['quantity'])
                product.save()
        
        # Clear user's cart if logged in
        if user:
            CartItem.objects.filter(user=user).delete()
        
        return order