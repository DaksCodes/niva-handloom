import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  HeartHandshake, 
  ShieldCheck, 
  Award, 
  Phone, 
  Mail, 
  MapPin, 
  ArrowRight 
} from 'lucide-react';
import './Home.css';

const slides = [
  {
    id: 1,
    image: "/images/slide1.jpeg",
    title: 'Pure Cotton Handloom Bedsheets',
    subtitle: 'Elevate your bedroom with authentic Indian craftsmanship.',
  },
  {
    id: 2,
    image: "/images/slide2.jpeg",
    title: 'Vibrant Colors & Timeless Designs',
    subtitle: 'Breathable fabric crafted for ultimate comfort and elegance.',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=1200',
    title: 'Handcrafted With Love',
    subtitle: 'Directly from skilled artisans to your home.',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=1200',
    title: 'Premium Quality & Durability',
    subtitle: 'Long-lasting softness that feels better with every wash.',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?q=80&w=1200',
    title: 'Festive & Daily Essentials',
    subtitle: 'Perfect bedcovers for every special moment and everyday living.',
  }
];

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play Slideshow (Har 4 seconds mein next slide)
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 4000);

    return () => clearInterval(slideInterval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide(currentSlide === slides.length - 1 ? 0 : currentSlide + 1);
  };

  const prevSlide = () => {
    setCurrentSlide(currentSlide === 0 ? slides.length - 1 : currentSlide - 1);
  };

  return (
    <div className="home-landing-page">

      {/* 1. HERO SLIDESHOW SECTION */}
      <section className="slideshow-container">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.45)), url(${slide.image})`, 
                    zIndex: index === currentSlide ? 10 : 0, 
              pointerEvents: index === currentSlide ? 'auto' : 'none'
          }}
            
          >
            {index === currentSlide && (
              <div className="slide-content">
                <span className="hero-tag"><Sparkles size={16} /> Handloom Collection</span>
                <h1>{slide.title}</h1>
                <p>{slide.subtitle}</p>
                <Link to="/products" className="hero-cta-btn">
                  Explore Products <ArrowRight size={18} />
                </Link>
              </div>
            )}
          </div>
        ))}

        {/* Slideshow Controls */}
        <button className="slider-btn prev" onClick={prevSlide}>
          <ChevronLeft size={24} />
        </button>
        <button className="slider-btn next" onClick={nextSlide}>
          <ChevronRight size={24} />
        </button>

        {/* Dots Indicator */}
        <div className="dots-container">
          {slides.map((_, idx) => (
            <span
              key={idx}
              className={`dot ${idx === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(idx)}
            />
          ))}
        </div>
      </section>


      {/* 2. ABOUT US SECTION */}
      <section className="about-section">
        <div className="about-container">
          
          <div className="about-image-wrapper">
            <img 
              src="/images/logo.jpeg" 
              alt="About Niva Handlooms" 
              className="about-main-img"
            />
            <div className="experience-badge">
              <Award size={28} />
              <div>
                <strong>100% Authentic</strong>
                <span>Handcrafted Quality</span>
              </div>
            </div>
          </div>

          <div className="about-text-content">
            <span className="section-subtitle">OUR STORY</span>
            <h2>Welcome to Niva Handlooms</h2>
            <p className="about-description">
              At Niva Handlooms, we bring you a premium range of pure cotton bedsheets and handcrafted textiles for your home. Our goal is to blend traditional weaving techniques with modern aesthetics, ensuring you receive unmatched comfort and durability.
            </p>

            <div className="about-features">
              <div className="feature-item">
                <div className="feature-icon"><HeartHandshake size={20} /></div>
                <div>
                  <h4>Artisanal Heritage</h4>
                  <p>Every bedsheet is a symbol of the hard work and love of traditional weavers.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon"><ShieldCheck size={20} /></div>
                <div>
                  <h4>Skin-Friendly & Pure</h4>
                  <p>100% breathable fabric that keeps you comfortable in every season.</p>
                </div>
              </div>
            </div>

            <Link to="/products" className="about-btn">
              Browse All Bedsheets
            </Link>
          </div>

        </div>
      </section>


      {/* 3. CONTACT & OWNER SECTION */}
      <section className="contact-owner-section">
        <div className="contact-container">
          <div className="contact-header">
            <span className="section-subtitle">GET IN TOUCH</span>
            <h2>Meet the Founder & Connect With Us</h2>
            <p>For any custom requirements or order-related queries, please contact us directly.</p>
          </div>

          <div className="owner-card">
            
            {/* Circle Photo Frame for Aunty */}
            <div className="owner-avatar-container">
              <div className="circle-image-frame">
                <img 
                  src="/images/solopic.jpeg" 
                  alt="Founder - Niva Handlooms" 
                />
              </div>
              <div className="owner-title">
                <h3>Monika Agarwal</h3>
                <p>Niva Handlooms</p>
              </div>
            </div>

            {/* Contact Details Grid */}
            <div className="contact-info-grid">
              
              <a href="tel:+919876543210" className="info-card">
                <div className="info-icon-wrapper"><Phone size={22} /></div>
                <div>
                  <span className="info-label">Call / WhatsApp</span>
                  <p className="info-value">+91 98109 79213</p>
                </div>
              </a>

              <a href="mailto:nivahandlooms@gmail.com" className="info-card">
                <div className="info-icon-wrapper"><Mail size={22} /></div>
                <div>
                  <span className="info-label">Email Us</span>
                  <p className="info-value">nivahandlooms@gmail.com</p>
                </div>
              </a>

              <div className="info-card">
                <div className="info-icon-wrapper"><MapPin size={22} /></div>
                <div>
                  <span className="info-label">Location</span>
                  <p className="info-value">Indirapuram, Ghaziabad</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="simple-footer">
        <p>© 2026 Niva Handlooms. Crafted with care for your home.</p>
      </footer>

    </div>
  );
};

export default Home;