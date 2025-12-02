import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand-col">
            <h2 className="footer-brand">Alma Artesana</h2>
            <p className="footer-tagline">
              Artesanías guatemaltecas hechas a mano con amor, tradición y respeto por nuestra cultura.
            </p>
            <div className="footer-social">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a href="https://wa.me/50212345678" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="WhatsApp">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div className="footer-col">
            <h3 className="footer-title">Tienda</h3>
            <ul className="footer-links">
              <li><Link to="/productos" className="footer-link">Todos los Productos</Link></li>
              <li><Link to="/categorias/macrame" className="footer-link">Macramé</Link></li>
              <li><Link to="/categorias/textiles" className="footer-link">Textiles</Link></li>
              <li><Link to="/categorias/decoracion" className="footer-link">Decoración</Link></li>
              <li><Link to="/ofertas" className="footer-link">Ofertas</Link></li>
            </ul>
          </div>

          {/* Help Links */}
          <div className="footer-col">
            <h3 className="footer-title">Ayuda</h3>
            <ul className="footer-links">
              <li><Link to="/envios" className="footer-link">Envíos</Link></li>
              <li><Link to="/devoluciones" className="footer-link">Devoluciones</Link></li>
              <li><Link to="/preguntas-frecuentes" className="footer-link">Preguntas Frecuentes</Link></li>
              <li><Link to="/contacto" className="footer-link">Contacto</Link></li>
              <li><Link to="/rastrear-pedido" className="footer-link">Rastrear Pedido</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-col">
            <h3 className="footer-title">Contacto</h3>
            <div className="footer-contact">
              <div className="footer-contact-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>Ciudad de Guatemala, Guatemala</span>
              </div>
              <div className="footer-contact-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span>+502 1234-5678</span>
              </div>
              <div className="footer-contact-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span>hola@almaartesana.gt</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="footer-payments">
          <span className="footer-payments-label">Métodos de pago:</span>
          <div className="footer-payments-icons">
            <div className="payment-icon" title="Visa">
              <svg viewBox="0 0 48 32" fill="currentColor">
                <rect width="48" height="32" rx="4" fill="#1A1F71"/>
                <text x="24" y="20" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">VISA</text>
              </svg>
            </div>
            <div className="payment-icon" title="Mastercard">
              <svg viewBox="0 0 48 32" fill="currentColor">
                <rect width="48" height="32" rx="4" fill="#EB001B"/>
                <circle cx="18" cy="16" r="10" fill="#EB001B"/>
                <circle cx="30" cy="16" r="10" fill="#F79E1B"/>
                <path d="M24 8a10 10 0 000 16 10 10 0 000-16z" fill="#FF5F00"/>
              </svg>
            </div>
            <div className="payment-icon" title="Pagadito">
              <svg viewBox="0 0 48 32" fill="currentColor">
                <rect width="48" height="32" rx="4" fill="#00A651"/>
                <text x="24" y="18" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">PAGADITO</text>
              </svg>
            </div>
          </div>
        </div>

        {/* IEPADES Support Section */}
        <div className="footer-support">
          <span className="footer-support-text">Con el apoyo de</span>
          <a 
            href="https://iepades.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-support-logo"
            title="IEPADES - Instituto de Enseñanza para el Desarrollo Sostenible"
          >
            <img 
              src="/iepades-logo.png" 
              alt="IEPADES - Instituto de Enseñanza para el Desarrollo Sostenible" 
              className="iepades-logo"
            />
          </a>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>&copy; {currentYear} Alma Artesana. Todos los derechos reservados.</p>
          <div className="footer-legal">
            <Link to="/privacidad">Privacidad</Link>
            <Link to="/terminos">Términos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;