import React from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../../components';
import './Wishlist.css';

const Wishlist = ({ wishlist = [], onAddToCart, onRemoveFromWishlist }) => {
  if (wishlist.length === 0) {
    return (
      <main className="wishlist-page">
        <div className="container">
          <div className="empty-wishlist">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <h1>Tu lista de favoritos está vacía</h1>
            <p>Guarda los productos que te gustan para comprarlos después.</p>
            <Link to="/productos" className="btn-shop">
              Explorar Productos
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="wishlist-page">
      <div className="container">
        <div className="wishlist-header">
          <h1>Mis Favoritos</h1>
          <span className="wishlist-count">
            {wishlist.length} {wishlist.length === 1 ? 'producto' : 'productos'}
          </span>
        </div>

        <div className="wishlist-grid">
          {wishlist.map((product) => (
            <div key={product.id} className="wishlist-item">
              <ProductCard
                product={product}
                onAddToCart={onAddToCart}
                onAddToWishlist={onRemoveFromWishlist}
              />
              <button 
                className="remove-btn"
                onClick={() => onRemoveFromWishlist(product)}
                aria-label="Eliminar de favoritos"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Wishlist;