from django.db import models
from django.utils.text import slugify
from django.core.validators import MinValueValidator
from django.contrib.auth.models import User
from decimal import Decimal
import uuid


class UserProfile(models.Model):
    """Extended user profile"""
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    phone = models.CharField('Teléfono', max_length=20, blank=True)
    
    # Default address
    address = models.CharField('Dirección', max_length=255, blank=True)
    address_line2 = models.CharField('Línea 2', max_length=255, blank=True)
    city = models.CharField('Ciudad', max_length=100, blank=True)
    department = models.CharField('Departamento', max_length=100, blank=True)
    postal_code = models.CharField('Código Postal', max_length=20, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Perfil de Usuario'
        verbose_name_plural = 'Perfiles de Usuarios'

    def __str__(self):
        return f"Perfil de {self.user.get_full_name() or self.user.username}"


class Category(models.Model):
    """Product categories (Macramé, Textiles, etc.)"""
    name = models.CharField('Nombre', max_length=100)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField('Descripción', blank=True)
    image = models.ImageField(
        'Imagen',
        upload_to='categories/',
        blank=True,
        null=True
    )
    icon = models.CharField(
        'Icono (emoji o código)',
        max_length=50,
        blank=True,
        help_text='Emoji o nombre de icono para mostrar'
    )
    is_active = models.BooleanField('Activa', default=True)
    order = models.PositiveIntegerField('Orden', default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Categoría'
        verbose_name_plural = 'Categorías'
        ordering = ['order', 'name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    @property
    def product_count(self):
        return self.products.filter(is_active=True).count()


class Product(models.Model):
    """Main product model"""
    
    BADGE_CHOICES = [
        ('', 'Sin etiqueta'),
        ('new', 'Nuevo'),
        ('bestseller', 'Más Vendido'),
        ('sale', 'Oferta'),
        ('limited', 'Edición Limitada'),
        ('handmade', '100% Artesanal'),
    ]

    # Basic info
    name = models.CharField('Nombre', max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField('Descripción')
    short_description = models.CharField(
        'Descripción corta',
        max_length=255,
        blank=True,
        help_text='Resumen para tarjetas de producto'
    )

    # Pricing
    price = models.DecimalField(
        'Precio (GTQ)',
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    original_price = models.DecimalField(
        'Precio original (GTQ)',
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        help_text='Dejar vacío si no hay descuento'
    )

    # Organization
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='products',
        verbose_name='Categoría'
    )
    badge = models.CharField(
        'Etiqueta',
        max_length=20,
        choices=BADGE_CHOICES,
        blank=True,
        default=''
    )

    # Inventory
    stock = models.PositiveIntegerField('Stock', default=0)
    sku = models.CharField(
        'SKU',
        max_length=50,
        unique=True,
        blank=True,
        null=True
    )

    # Status
    is_active = models.BooleanField('Activo', default=True)
    is_featured = models.BooleanField('Destacado', default=False)

    # Artisan info
    artisan_name = models.CharField(
        'Nombre del artesano',
        max_length=100,
        blank=True
    )
    origin = models.CharField(
        'Lugar de origen',
        max_length=100,
        blank=True,
        help_text='Ej: Antigua Guatemala, Chichicastenango'
    )
    materials = models.CharField(
        'Materiales',
        max_length=255,
        blank=True,
        help_text='Ej: Algodón orgánico, tintes naturales'
    )

    # Dimensions (optional)
    dimensions = models.CharField(
        'Dimensiones',
        max_length=100,
        blank=True,
        help_text='Ej: 30cm x 40cm'
    )
    weight = models.DecimalField(
        'Peso (kg)',
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Producto'
        verbose_name_plural = 'Productos'
        ordering = ['-is_featured', '-created_at']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    @property
    def in_stock(self):
        return self.stock > 0

    @property
    def discount_percentage(self):
        if self.original_price and self.original_price > self.price:
            discount = ((self.original_price - self.price) / self.original_price) * 100
            return int(discount)
        return 0


class ProductImage(models.Model):
    """Multiple images per product"""
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='images',
        verbose_name='Producto'
    )
    image = models.ImageField('Imagen', upload_to='products/')
    alt_text = models.CharField(
        'Texto alternativo',
        max_length=200,
        blank=True
    )
    is_primary = models.BooleanField('Imagen principal', default=False)
    order = models.PositiveIntegerField('Orden', default=0)

    class Meta:
        verbose_name = 'Imagen de producto'
        verbose_name_plural = 'Imágenes de productos'
        ordering = ['-is_primary', 'order']

    def __str__(self):
        return f"{self.product.name} - Imagen {self.order}"

    def save(self, *args, **kwargs):
        # If this is set as primary, unset others
        if self.is_primary:
            ProductImage.objects.filter(
                product=self.product,
                is_primary=True
            ).exclude(pk=self.pk).update(is_primary=False)
        super().save(*args, **kwargs)


class Order(models.Model):
    """Customer orders"""
    
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('confirmed', 'Confirmado'),
        ('processing', 'Procesando'),
        ('shipped', 'Enviado'),
        ('delivered', 'Entregado'),
        ('cancelled', 'Cancelado'),
    ]
    
    PAYMENT_CHOICES = [
        ('card', 'Tarjeta de crédito/débito'),
        ('transfer', 'Transferencia bancaria'),
        ('cash', 'Pago contra entrega'),
    ]

    # Order ID
    order_number = models.CharField(
        'Número de orden',
        max_length=20,
        unique=True,
        editable=False
    )
    
    # Customer (optional for guest checkout)
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders',
        verbose_name='Usuario'
    )
    
    # Contact info
    email = models.EmailField('Email')
    phone = models.CharField('Teléfono', max_length=20)
    
    # Shipping address
    first_name = models.CharField('Nombre', max_length=100)
    last_name = models.CharField('Apellido', max_length=100)
    address = models.CharField('Dirección', max_length=255)
    address_line2 = models.CharField('Línea 2', max_length=255, blank=True)
    city = models.CharField('Ciudad', max_length=100)
    department = models.CharField('Departamento', max_length=100)
    postal_code = models.CharField('Código Postal', max_length=20, blank=True)
    
    # Order details
    subtotal = models.DecimalField(
        'Subtotal',
        max_digits=10,
        decimal_places=2
    )
    shipping_cost = models.DecimalField(
        'Costo de envío',
        max_digits=10,
        decimal_places=2,
        default=Decimal('35.00')
    )
    total = models.DecimalField(
        'Total',
        max_digits=10,
        decimal_places=2
    )
    
    # Status & Payment
    status = models.CharField(
        'Estado',
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    payment_method = models.CharField(
        'Método de pago',
        max_length=20,
        choices=PAYMENT_CHOICES,
        default='card'
    )
    is_paid = models.BooleanField('Pagado', default=False)
    paid_at = models.DateTimeField('Fecha de pago', null=True, blank=True)
    
    # Notes
    notes = models.TextField('Notas', blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Orden'
        verbose_name_plural = 'Órdenes'
        ordering = ['-created_at']

    def __str__(self):
        return f"Orden #{self.order_number}"

    def save(self, *args, **kwargs):
        if not self.order_number:
            # Generate unique order number: AA-XXXXXXXX
            self.order_number = f"AA-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def full_address(self):
        parts = [self.address]
        if self.address_line2:
            parts.append(self.address_line2)
        parts.append(f"{self.city}, {self.department}")
        if self.postal_code:
            parts.append(self.postal_code)
        return ", ".join(parts)


class OrderItem(models.Model):
    """Individual items in an order"""
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name='Orden'
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        null=True,
        verbose_name='Producto'
    )
    # Store product info at time of order (in case product changes/deleted)
    product_name = models.CharField('Nombre del producto', max_length=200)
    product_price = models.DecimalField(
        'Precio unitario',
        max_digits=10,
        decimal_places=2
    )
    quantity = models.PositiveIntegerField('Cantidad', default=1)
    
    class Meta:
        verbose_name = 'Item de orden'
        verbose_name_plural = 'Items de orden'

    def __str__(self):
        return f"{self.quantity}x {self.product_name}"

    @property
    def subtotal(self):
        return self.product_price * self.quantity


class Wishlist(models.Model):
    """User wishlist"""
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='wishlist_items'
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='wishlisted_by'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Favorito'
        verbose_name_plural = 'Favoritos'
        unique_together = ['user', 'product']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.product.name}"


class CartItem(models.Model):
    """Persistent cart for logged-in users"""
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='cart_items'
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE
    )
    quantity = models.PositiveIntegerField('Cantidad', default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Item de carrito'
        verbose_name_plural = 'Items de carrito'
        unique_together = ['user', 'product']

    def __str__(self):
        return f"{self.user.username} - {self.quantity}x {self.product.name}"

    @property
    def subtotal(self):
        return self.product.price * self.quantity