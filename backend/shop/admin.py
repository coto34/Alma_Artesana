from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Product, ProductImage, UserProfile, Order, OrderItem, Wishlist, CartItem


class ProductImageInline(admin.TabularInline):
    """Inline for adding multiple images to a product"""
    model = ProductImage
    extra = 1
    fields = ['image', 'image_preview', 'alt_text', 'is_primary', 'order']
    readonly_fields = ['image_preview']

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height: 50px; max-width: 100px;" />',
                obj.image.url
            )
        return "Sin imagen"
    image_preview.short_description = "Vista previa"


class OrderItemInline(admin.TabularInline):
    """Inline for order items"""
    model = OrderItem
    extra = 0
    readonly_fields = ['product_name', 'product_price', 'quantity', 'subtotal']
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'product_count', 'is_active', 'order']
    list_filter = ['is_active']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ['is_active', 'order']
    ordering = ['order', 'name']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        'thumbnail',
        'name',
        'category',
        'price_display',
        'stock',
        'badge',
        'is_active',
        'is_featured'
    ]
    list_filter = ['category', 'is_active', 'is_featured', 'badge', 'created_at']
    search_fields = ['name', 'description', 'sku', 'artisan_name']
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ['is_active', 'is_featured', 'stock']
    list_per_page = 20
    date_hierarchy = 'created_at'
    inlines = [ProductImageInline]

    fieldsets = (
        ('Información Básica', {
            'fields': ('name', 'slug', 'description', 'short_description')
        }),
        ('Precio y Stock', {
            'fields': ('price', 'original_price', 'stock', 'sku')
        }),
        ('Organización', {
            'fields': ('category', 'badge', 'is_active', 'is_featured')
        }),
        ('Información del Artesano', {
            'fields': ('artisan_name', 'origin', 'materials'),
            'classes': ('collapse',)
        }),
        ('Detalles Físicos', {
            'fields': ('dimensions', 'weight'),
            'classes': ('collapse',)
        }),
    )

    def thumbnail(self, obj):
        primary_image = obj.images.filter(is_primary=True).first()
        if not primary_image:
            primary_image = obj.images.first()
        if primary_image:
            return format_html(
                '<img src="{}" style="max-height: 40px; max-width: 60px; object-fit: cover; border-radius: 4px;" />',
                primary_image.image.url
            )
        return "📷"
    thumbnail.short_description = "Foto"

    def price_display(self, obj):
        if obj.original_price:
            return format_html(
                '<span style="text-decoration: line-through; color: #999;">Q{}</span> '
                '<strong style="color: #E85A0C;">Q{}</strong>',
                obj.original_price,
                obj.price
            )
        return format_html('<strong>Q{}</strong>', obj.price)
    price_display.short_description = "Precio"


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ['image_preview', 'product', 'is_primary', 'order']
    list_filter = ['is_primary', 'product__category']
    search_fields = ['product__name', 'alt_text']
    list_editable = ['is_primary', 'order']

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height: 50px; max-width: 80px; object-fit: cover; border-radius: 4px;" />',
                obj.image.url
            )
        return "Sin imagen"
    image_preview.short_description = "Imagen"


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone', 'city', 'department']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'phone']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        'order_number', 
        'full_name', 
        'email', 
        'total_display', 
        'status', 
        'payment_method',
        'is_paid',
        'created_at'
    ]
    list_filter = ['status', 'payment_method', 'is_paid', 'created_at']
    search_fields = ['order_number', 'email', 'first_name', 'last_name', 'phone']
    readonly_fields = ['order_number', 'subtotal', 'shipping_cost', 'total', 'created_at', 'updated_at']
    list_per_page = 20
    date_hierarchy = 'created_at'
    inlines = [OrderItemInline]

    fieldsets = (
        ('Orden', {
            'fields': ('order_number', 'status', 'is_paid', 'paid_at')
        }),
        ('Cliente', {
            'fields': ('user', 'email', 'phone', 'first_name', 'last_name')
        }),
        ('Dirección de Envío', {
            'fields': ('address', 'address_line2', 'city', 'department', 'postal_code')
        }),
        ('Pago', {
            'fields': ('payment_method', 'subtotal', 'shipping_cost', 'total')
        }),
        ('Notas', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def total_display(self, obj):
        return format_html('<strong>Q{}</strong>', obj.total)
    total_display.short_description = "Total"


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__email', 'product__name']


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'quantity', 'subtotal', 'updated_at']
    list_filter = ['updated_at']
    search_fields = ['user__email', 'product__name']


# Customize admin site
admin.site.site_header = "Alma Artesana - Administración"
admin.site.site_title = "Alma Artesana Admin"
admin.site.index_title = "Panel de Control"