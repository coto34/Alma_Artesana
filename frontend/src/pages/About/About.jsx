import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';

const About = () => {
  const values = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      ),
      title: "Pasión Artesanal",
      description: "Cada pieza que vendemos es creada con dedicación y amor por artesanos guatemaltecos que han heredado técnicas ancestrales."
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      title: "Comercio Justo",
      description: "Trabajamos directamente con comunidades artesanales, asegurando que reciban una compensación justa por su trabajo."
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
          <path d="M2 12h20"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      ),
      title: "Cultura Viva",
      description: "Preservamos y promovemos las tradiciones culturales de Guatemala a través de cada producto que compartimos."
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
          <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
      ),
      title: "Calidad Garantizada",
      description: "Seleccionamos cuidadosamente cada producto para asegurar que cumpla con los más altos estándares de calidad."
    }
  ];

  return (
    <main className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-content">
          <span className="eyebrow">Nuestra Historia</span>
          <h1>Conectando Corazones a Través del Arte</h1>
          <p>
            Somos más que una tienda. Somos un puente entre los talentosos 
            artesanos de Guatemala y personas que valoran la belleza del 
            trabajo hecho a mano.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="story-section">
        <div className="container">
          <div className="story-grid">
            <div className="story-image">
              <img 
                src="/nosotros-artesanias.png" 
                alt="Artesana guatemalteca tejiendo textiles tradicionales"
              />
            </div>
            <div className="story-content">
              <span className="eyebrow">Quiénes Somos</span>
              <h2>Una Pasión Nacida en Guatemala</h2>
              <p>
                Alma Artesana nació de un profundo amor por las tradiciones 
                artesanales de Guatemala. Fundada con la visión de llevar la 
                belleza del trabajo hecho a mano a hogares alrededor del mundo, 
                nos dedicamos a conectar a artesanos talentosos con personas 
                que aprecian la autenticidad y la calidad.
              </p>
              <p>
                Cada pieza en nuestra colección cuenta una historia única. 
                Detrás de cada tejido, cada bordado y cada creación hay manos 
                expertas que han perfeccionado su arte a través de generaciones.
              </p>
              <p>
                Nuestro compromiso va más allá de vender productos hermosos. 
                Trabajamos para preservar tradiciones culturales, apoyar 
                economías locales y crear un impacto positivo en las comunidades 
                artesanales de Guatemala.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Nuestros Valores</span>
            <h2>Lo Que Nos Define</h2>
          </div>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="impact-section">
        <div className="container">
          <div className="impact-grid">
            <div className="impact-content">
              <span className="eyebrow">Nuestro Impacto</span>
              <h2>Creando un Cambio Positivo</h2>
              <p>
                Cada compra que realizas en Alma Artesana tiene un impacto 
                directo en la vida de familias artesanas guatemaltecas. 
                Nos enorgullece ser parte de un movimiento que valora el 
                trabajo manual y las tradiciones culturales.
              </p>
              <ul className="impact-list">
                <li>
                  <span className="check">✓</span>
                  Apoyo directo a más de 50 familias artesanas
                </li>
                <li>
                  <span className="check">✓</span>
                  Preservación de técnicas ancestrales de tejido
                </li>
                <li>
                  <span className="check">✓</span>
                  Promoción de la cultura guatemalteca
                </li>
                <li>
                  <span className="check">✓</span>
                  Comercio justo y precios equitativos
                </li>
              </ul>
            </div>
            <div className="impact-stats">
              <div className="stat-card">
                <span className="stat-number">50+</span>
                <span className="stat-label">Familias Artesanas</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">500+</span>
                <span className="stat-label">Productos Únicos</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">12</span>
                <span className="stat-label">Comunidades</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">100%</span>
                <span className="stat-label">Hecho a Mano</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Únete a Nuestra Comunidad</h2>
            <p>
              Descubre la magia de las artesanías guatemaltecas y lleva 
              un pedacito de nuestra cultura a tu hogar.
            </p>
            <div className="cta-buttons">
              <Link to="/productos" className="btn-primary">
                Explorar Productos
              </Link>
              <Link to="/contacto" className="btn-secondary">
                Contáctanos
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;