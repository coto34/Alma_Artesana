import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ cartCount = 0, user = null }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/productos?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-brand">
            Alma Artesana
          </Link>

          {/* Desktop Navigation */}
          <ul className="navbar-nav desktop-nav">
            <li><Link to="/" className="navbar-link">Inicio</Link></li>
            <li><Link to="/productos" className="navbar-link">Productos</Link></li>
            <li><Link to="/nosotros" className="navbar-link">Nosotros</Link></li>
            <li><Link to="/contacto" className="navbar-link">Contacto</Link></li>
          </ul>

          {/* Icons */}
          <div className="navbar-actions">
            {/* Search Toggle */}
            <button 
              className={`navbar-icon ${searchOpen ? 'active' : ''}`}
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Buscar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </button>

            {/* User Account */}
            <Link 
              to={user ? "/cuenta" : "/login"} 
              className={`navbar-icon ${user ? 'logged-in' : ''}`} 
              aria-label="Mi cuenta"
            >
              {user ? (
                <div className="user-avatar-small">
                  {user.firstName[0]}
                </div>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              )}
            </Link>

            {/* Wishlist */}
            <Link to="/favoritos" className="navbar-icon" aria-label="Favoritos">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </Link>

            {/* Cart */}
            <Link to="/carrito" className="navbar-icon cart-icon" aria-label="Carrito">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                <path d="M3 6h18"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {cartCount > 0 && (
                <span className="cart-count">{cartCount}</span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button 
              className="navbar-icon mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18"/>
                  <path d="m6 6 12 12"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 12h16"/>
                  <path d="M4 6h16"/>
                  <path d="M4 18h16"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <form className="search-bar" onSubmit={handleSearch}>
            <input 
              type="text" 
              placeholder="Buscar productos artesanales..." 
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              autoFocus
            />
            <button type="submit" className="search-btn" aria-label="Buscar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          </form>
        )}

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="mobile-nav">
            {/* Mobile Search */}
            <form className="mobile-search" onSubmit={(e) => {
              handleSearch(e);
              setMobileMenuOpen(false);
            }}>
              <input 
                type="text" 
                placeholder="Buscar..." 
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="search-btn" aria-label="Buscar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </button>
            </form>

            <ul className="mobile-nav-list">
              <li><Link to="/" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Inicio</Link></li>
              <li><Link to="/productos" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Productos</Link></li>
              <li><Link to="/favoritos" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Favoritos</Link></li>
              <li><Link to="/nosotros" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Nosotros</Link></li>
              <li><Link to="/contacto" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Contacto</Link></li>
            </ul>
            <div className="mobile-nav-footer">
              {user ? (
                <Link to="/cuenta" className="btn btn-secondary btn-full" onClick={() => setMobileMenuOpen(false)}>
                  Hola, {user.firstName}
                </Link>
              ) : (
                <>
                  <Link to="/login" className="btn btn-primary btn-full" onClick={() => setMobileMenuOpen(false)}>
                    Iniciar Sesión
                  </Link>
                  <Link to="/registro" className="btn btn-secondary btn-full" onClick={() => setMobileMenuOpen(false)}>
                    Crear Cuenta
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;