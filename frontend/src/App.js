import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar, Footer } from './components';
import { 
  Home, 
  ProductDetail, 
  Products, 
  CategoryDetail, 
  Cart, 
  Checkout,
  About, 
  Contact,
  Account,
  Wishlist,
  Login,
  Register
} from './pages';
import { getProfile, logout as apiLogout, isAuthenticated } from './services/api';
import './styles/brand.css';

// Helper functions for localStorage
const getStoredCart = () => {
  try {
    const stored = localStorage.getItem('almaartesana_cart');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const getStoredWishlist = () => {
  try {
    const stored = localStorage.getItem('almaartesana_wishlist');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const getStoredUser = () => {
  try {
    const stored = localStorage.getItem('almaartesana_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

function App() {
  // User state - persisted
  const [user, setUser] = useState(getStoredUser);

  // Cart state - persisted
  const [cart, setCart] = useState(getStoredCart);

  // Wishlist state - persisted
  const [wishlist, setWishlist] = useState(getStoredWishlist);

  // Verify token and fetch user on app load
  useEffect(() => {
    const verifyAuth = async () => {
      if (isAuthenticated() && !user) {
        try {
          const response = await getProfile();
          const userData = response.data;
          setUser({
            id: userData.id,
            firstName: userData.first_name,
            lastName: userData.last_name,
            email: userData.email,
            profile: userData.profile
          });
        } catch (error) {
          // Token invalid, clear it
          apiLogout();
          setUser(null);
        }
      }
    };
    verifyAuth();
  }, []);

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem('almaartesana_cart', JSON.stringify(cart));
  }, [cart]);

  // Persist wishlist to localStorage
  useEffect(() => {
    localStorage.setItem('almaartesana_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Persist user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('almaartesana_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('almaartesana_user');
    }
  }, [user]);

  // Auth handlers
  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    apiLogout(); // Clear tokens
    setUser(null);
  };

  // Add to cart
  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
  };

  // Remove from cart
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  // Update cart quantity
  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
  };

  // Toggle wishlist (syncs with API if logged in)
  const toggleWishlist = async (product) => {
    // Optimistic update for UI
    setWishlist(prevWishlist => {
      const exists = prevWishlist.find(item => item.id === product.id);
      if (exists) {
        return prevWishlist.filter(item => item.id !== product.id);
      }
      return [...prevWishlist, product];
    });

    // Sync with API if logged in
    if (user) {
      try {
        const { toggleWishlist: apiToggle } = await import('./services/api');
        await apiToggle(product.id);
      } catch (error) {
        console.error('Error syncing wishlist:', error);
        // Revert on error
        setWishlist(prevWishlist => {
          const exists = prevWishlist.find(item => item.id === product.id);
          if (exists) {
            return prevWishlist.filter(item => item.id !== product.id);
          }
          return [...prevWishlist, product];
        });
      }
    }
  };

  // Remove from wishlist (syncs with API if logged in)
  const removeFromWishlist = async (product) => {
    setWishlist(prevWishlist => prevWishlist.filter(item => item.id !== product.id));

    // Sync with API if logged in
    if (user) {
      try {
        const { removeFromWishlist: apiRemove, getWishlist } = await import('./services/api');
        // Find the wishlist item ID from API
        const response = await getWishlist();
        const wishlistItems = response.data.results || response.data || [];
        const item = wishlistItems.find(w => w.product?.id === product.id);
        if (item) {
          await apiRemove(item.id);
        }
      } catch (error) {
        console.error('Error removing from wishlist:', error);
      }
    }
  };

  // Fetch wishlist from API on login
  useEffect(() => {
    const fetchWishlist = async () => {
      if (user) {
        try {
          const { getWishlist } = await import('./services/api');
          const response = await getWishlist();
          const wishlistItems = response.data.results || response.data || [];
          // Transform API wishlist to local format
          const products = wishlistItems.map(item => ({
            id: item.product?.id,
            name: item.product?.name,
            slug: item.product?.slug,
            price: item.product?.price,
            primary_image: item.product?.primary_image,
            ...item.product
          })).filter(p => p.id);
          setWishlist(products);
        } catch (error) {
          console.error('Error fetching wishlist:', error);
        }
      }
    };
    fetchWishlist();
  }, [user]);

  // Calculate cart count
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Calculate cart total
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <Router>
      <div className="App">
        <Navbar cartCount={cartCount} user={user} />
        
        <Routes>
          {/* Home */}
          <Route 
            path="/" 
            element={
              <Home 
                onAddToCart={addToCart} 
                onAddToWishlist={toggleWishlist} 
              />
            } 
          />

          {/* Products Listing */}
          <Route 
            path="/productos" 
            element={
              <Products 
                onAddToCart={addToCart} 
                onAddToWishlist={toggleWishlist} 
              />
            } 
          />

          {/* Product Detail */}
          <Route 
            path="/producto/:slug" 
            element={
              <ProductDetail 
                onAddToCart={addToCart} 
                onAddToWishlist={toggleWishlist} 
              />
            } 
          />

          {/* Category Detail */}
          <Route 
            path="/categorias/:slug" 
            element={
              <CategoryDetail 
                onAddToCart={addToCart} 
                onAddToWishlist={toggleWishlist} 
              />
            } 
          />

          {/* Cart */}
          <Route 
            path="/carrito" 
            element={
              <Cart 
                cart={cart}
                onUpdateQuantity={updateCartQuantity}
                onRemoveItem={removeFromCart}
                cartTotal={cartTotal}
              />
            } 
          />

          {/* Checkout */}
          <Route 
            path="/checkout" 
            element={
              <Checkout 
                cart={cart}
                cartTotal={cartTotal}
                onClearCart={clearCart}
                user={user}
              />
            } 
          />

          {/* Wishlist */}
          <Route 
            path="/favoritos" 
            element={
              <Wishlist 
                wishlist={wishlist}
                onAddToCart={addToCart}
                onRemoveFromWishlist={removeFromWishlist}
              />
            } 
          />

          {/* Auth */}
          <Route 
            path="/login" 
            element={<Login onLogin={handleLogin} />} 
          />
          <Route 
            path="/registro" 
            element={<Register onLogin={handleLogin} />} 
          />

          {/* Account */}
          <Route 
            path="/cuenta" 
            element={
              <Account 
                user={user} 
                onLogout={handleLogout} 
              />
            } 
          />

          {/* About */}
          <Route 
            path="/nosotros" 
            element={<About />} 
          />

          {/* Contact */}
          <Route 
            path="/contacto" 
            element={<Contact />} 
          />

          {/* 404 */}
          <Route 
            path="*" 
            element={
              <div style={{ 
                minHeight: '60vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '1rem',
                padding: '2rem',
                textAlign: 'center'
              }}>
                <h1 style={{ 
                  fontFamily: 'Cinzel, serif', 
                  color: '#4C2A0A',
                  fontSize: '5rem',
                  margin: 0
                }}>
                  404
                </h1>
                <p style={{ 
                  color: '#6B3B1C', 
                  fontSize: '1.25rem',
                  marginBottom: '1rem'
                }}>
                  Página no encontrada
                </p>
                <a 
                  href="/" 
                  style={{
                    padding: '0.875rem 2rem',
                    background: '#E85A0C',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '10px',
                    fontWeight: '600'
                  }}
                >
                  Volver al Inicio
                </a>
              </div>
            } 
          />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;