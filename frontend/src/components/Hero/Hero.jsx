import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = ({ 
  title = "Artesanías Guatemaltecas",
  subtitle = "Descubre la belleza del trabajo artesanal hecho a mano con amor y tradición",
  ctaText = "Ver Colección",
  ctaLink = "/productos",
  secondaryCtaText = "Nuestra Historia",
  secondaryCtaLink = "/nosotros"
}) => {
  return (
    <section className="hero">
      <div className="hero-texture"></div>
      <div className="hero-pattern"></div>
      
      <div className="container">
        <div className="hero-grid">
          <div className="hero-content">
            <span className="hero-badge">✨ Hecho a mano en Guatemala</span>
            <h1 className="hero-title">{title}</h1>
            <p className="hero-subtitle">{subtitle}</p>
            
            <div className="hero-actions">
              <Link to={ctaLink} className="btn btn-earth btn-lg">
                {ctaText}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14"/>
                  <path d="m12 5 7 7-7 7"/>
                </svg>
              </Link>
              <Link to={secondaryCtaLink} className="btn btn-hero-secondary">
                {secondaryCtaText}
              </Link>
            </div>

            <div className="hero-features">
              <div className="hero-feature">
                <div className="hero-feature-icon">🧵</div>
                <span>100% Artesanal</span>
              </div>
              <div className="hero-feature">
                <div className="hero-feature-icon">🇬🇹</div>
                <span>Hecho en Guatemala</span>
              </div>
              <div className="hero-feature">
                <div className="hero-feature-icon">💚</div>
                <span>Comercio Justo</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-wrapper">
              <div className="hero-image-placeholder">
                <div className="hero-macrame-icon">
                  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="30" r="20" stroke="currentColor" strokeWidth="3"/>
                    <path d="M30 30 L20 80" stroke="currentColor" strokeWidth="3"/>
                    <path d="M70 30 L80 80" stroke="currentColor" strokeWidth="3"/>
                    <path d="M50 50 L50 90" stroke="currentColor" strokeWidth="3"/>
                    <path d="M35 55 L25 85" stroke="currentColor" strokeWidth="2"/>
                    <path d="M65 55 L75 85" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="50" cy="30" r="8" fill="currentColor" opacity="0.3"/>
                  </svg>
                </div>
                <p className="hero-image-text">Macramé Artesanal</p>
              </div>
              <div className="hero-decorative-circle hero-circle-1"></div>
              <div className="hero-decorative-circle hero-circle-2"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-scroll-indicator">
        <span>Descubre más</span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14"/>
          <path d="m19 12-7 7-7-7"/>
        </svg>
      </div>
    </section>
  );
};

export default Hero;