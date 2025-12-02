import React from 'react';
import { Link } from 'react-router-dom';
import './Cart.css';

const Cart = ({ cart, onUpdateQuantity, onRemoveItem, cartTotal }) => {
  const formatPrice = (amount) => {
    return `Q ${Number(amount).toLocaleString('es-GT', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    })}`;
  };

  const shipping = cartTotal >= 500 ? 0 : 35; // Free shipping over Q500
  const total = cartTotal + shipping;

  if (!cart || cart.length === 0) {
    return (
      <main className="cart-page">
        <div className="container">
          <div className="empty-cart">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
            <h1>Tu carrito está vacío</h1>
            <p>Parece que aún no has agregado productos a tu carrito.</p>
            <Link to="/productos" className="btn-shop">
              Explorar Productos
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="container">
        {/* Header */}
        <div className="cart-header">
          <h1>Tu Carrito</h1>
          <span className="cart-count">{cart.length} {cart.length === 1 ? 'producto' : 'productos'}</span>
        </div>

        <div className="cart-layout">
          {/* Cart Items */}
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <div className="image-placeholder">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <path d="M21 15l-5-5L5 21"/>
                      </svg>
                    </div>
                  )}
                </div>

                <div className="item-details">
                  <Link to={`/producto/${item.slug || item.id}`} className="item-name">
                    {item.name}
                  </Link>
                  <span className="item-price">{formatPrice(item.price)}</span>
                </div>

                <div className="item-quantity">
                  <button 
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    aria-label="Reducir cantidad"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </button>
                  <span>{item.quantity}</span>
                  <button 
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    aria-label="Aumentar cantidad"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </button>
                </div>

                <div className="item-subtotal">
                  {formatPrice(item.price * item.quantity)}
                </div>

                <button 
                  className="item-remove"
                  onClick={() => onRemoveItem(item.id)}
                  aria-label="Eliminar producto"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <h2>Resumen del Pedido</h2>
            
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            
            <div className="summary-row">
              <span>Envío</span>
              <span>
                {shipping === 0 ? (
                  <span className="free-shipping">¡Gratis!</span>
                ) : (
                  formatPrice(shipping)
                )}
              </span>
            </div>

            {shipping > 0 && (
              <div className="shipping-notice">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <span>Agrega {formatPrice(500 - cartTotal)} más para envío gratis</span>
              </div>
            )}

            <div className="summary-total">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            <Link to="/checkout" className="btn-checkout">
              Proceder al Pago
            </Link>

            <Link to="/productos" className="btn-continue">
              Continuar Comprando
            </Link>

            {/* Trust Badges */}
            <div className="trust-badges">
              <div className="badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span>Pago Seguro</span>
              </div>
              <div className="badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1" y="3" width="15" height="13" rx="2"/>
                  <path d="M16 8h4l3 3v5a2 2 0 0 1-2 2h-1"/>
                  <circle cx="5.5" cy="18.5" r="2.5"/>
                  <circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
                <span>Envío Nacional</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Cart;