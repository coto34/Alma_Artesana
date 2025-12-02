from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'products', views.ProductViewSet, basename='product')

urlpatterns = [
    # Router URLs (categories, products)
    path('', include(router.urls)),
    
    # Auth endpoints
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', views.ProfileView.as_view(), name='profile'),
    path('auth/change-password/', views.change_password, name='change_password'),
    
    # Cart endpoints
    path('cart/', views.CartView.as_view(), name='cart'),
    path('cart/<int:pk>/', views.CartItemView.as_view(), name='cart_item'),
    path('cart/clear/', views.clear_cart, name='clear_cart'),
    
    # Wishlist endpoints
    path('wishlist/', views.WishlistView.as_view(), name='wishlist'),
    path('wishlist/<int:pk>/', views.WishlistItemView.as_view(), name='wishlist_item'),
    path('wishlist/toggle/', views.toggle_wishlist, name='toggle_wishlist'),
    
    # Order endpoints
    path('orders/', views.OrderListView.as_view(), name='orders'),
    path('orders/create/', views.CreateOrderView.as_view(), name='create_order'),
    path('orders/<str:order_number>/', views.OrderDetailView.as_view(), name='order_detail'),
]

# =====================================================
# API ENDPOINT DOCUMENTATION
# =====================================================
#
# CATEGORIES
# ----------
# GET  /api/categories/                   - List all categories
# GET  /api/categories/{slug}/            - Get single category
# GET  /api/categories/{slug}/products/   - Get products in category
#
# PRODUCTS
# --------
# GET  /api/products/                     - List all products (with filters)
# GET  /api/products/{slug}/              - Get single product detail
# GET  /api/products/featured/            - Get featured products
# GET  /api/products/new_arrivals/        - Get newest products
# GET  /api/products/on_sale/             - Get products on sale
#
# Query params for /api/products/:
#   ?category=macrame                     - Filter by category slug
#   ?search=colgante                      - Search products
#   ?badge=new                            - Filter by badge
#   ?min_price=100&max_price=500          - Price range
#   ?in_stock=true                        - Only in stock
#   ?featured=true                        - Only featured
#   ?ordering=price                       - Sort by price (asc)
#   ?ordering=-price                      - Sort by price (desc)
#
# AUTHENTICATION
# --------------
# POST /api/auth/register/                - Register new user
#      Body: { email, password, password_confirm, first_name, last_name }
#      Returns: { user, tokens: { access, refresh } }
#
# POST /api/auth/login/                   - Login user
#      Body: { username (email), password }
#      Returns: { access, refresh }
#
# POST /api/auth/refresh/                 - Refresh access token
#      Body: { refresh }
#      Returns: { access }
#
# GET  /api/auth/profile/                 - Get user profile (auth required)
# PUT  /api/auth/profile/                 - Update profile (auth required)
# POST /api/auth/change-password/         - Change password (auth required)
#      Body: { current_password, new_password }
#
# CART (auth required)
# --------------------
# GET    /api/cart/                       - Get user's cart
# POST   /api/cart/                       - Add item to cart
#        Body: { product_id, quantity }
# PUT    /api/cart/{id}/                  - Update item quantity
#        Body: { quantity }
# DELETE /api/cart/{id}/                  - Remove item from cart
# DELETE /api/cart/clear/                 - Clear entire cart
#
# WISHLIST (auth required)
# ------------------------
# GET    /api/wishlist/                   - Get user's wishlist
# POST   /api/wishlist/                   - Add item to wishlist
#        Body: { product_id }
# DELETE /api/wishlist/{id}/              - Remove item from wishlist
# POST   /api/wishlist/toggle/            - Toggle product in wishlist
#        Body: { product_id }
#
# ORDERS
# ------
# GET  /api/orders/                       - Get user's orders (auth required)
# GET  /api/orders/{order_number}/        - Get order details (auth required)
# POST /api/orders/create/                - Create new order (guest allowed)
#      Body: {
#        email, phone,
#        first_name, last_name,
#        address, address_line2, city, department, postal_code,
#        payment_method,
#        items: [{ product_id, name, price, quantity }, ...]
#      }