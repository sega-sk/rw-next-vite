import React, { useState } from 'react';
import { Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WebsiteHeader from '../../components/Website/WebsiteHeader';
import WebsiteFooter from '../../components/Website/WebsiteFooter';
import SEOHead from '../../components/UI/SEOHead';
import OptimizedImage from '../../components/UI/OptimizedImage';
import ResponsiveImage from '../../components/UI/ResponsiveImage';
import ContactModal from '../../components/UI/ContactModal';
import SearchModal from '../../components/Website/SearchModal';
import NotificationBanner from '../../components/UI/NotificationBanner';
import { useNotification } from '../../hooks/useNotification';
import { leadsService } from '../../services/leads';

// Homepage component - Enhanced by SeGa_cc
export default function Homepage() {
  const navigate = useNavigate();
  const { notification, showNotification, clearNotification } = useNotification();
  const [showContactModal, setShowContactModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [contactFormData, setContactFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    comments: ''
  });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  const handleViewCollection = () => {
    window.location.href = '/catalog';
  };

  const handleContactFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingContact(true);
    try {
      // Use the leads service with proper API structure
      const leadData = {
        form_slug: 'contact_us' as const,
        appendices: {
          first_name: contactFormData.firstName,
          last_name: contactFormData.lastName,
          email: contactFormData.email,
          phone_number: contactFormData.phone,
          comments: contactFormData.comments || 'General inquiry from homepage contact form'
        }
      };

      await leadsService.submitLead(leadData);
      
      showNotification('Thank you for contacting us! We will be in touch soon.', 'success');
      setContactFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        comments: ''
      });
      setShowContactModal(false);
    } catch (err) {
      console.error('Contact form submission error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to send your message. Please try again.';
      showNotification(errorMessage, 'error');
    } finally {
      setIsSubmittingContact(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <SEOHead
        title="Reel Wheels Experience - Authentic Movie Vehicle Rentals & Memorabilia"
        description="Rent iconic movie vehicles like the Batmobile, DeLorean, and Ecto-1. Premium collection of authentic film cars and memorabilia for events, parties, and productions."
        keywords="movie car rental, Batmobile rental, DeLorean rental, film vehicle rental, movie memorabilia, Hollywood cars, event rentals"
        url="https://reelwheelsexperience.com/"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Reel Wheels Experience",
          "description": "Premium movie vehicle rental and memorabilia collection for events and productions",
          "url": "https://reelwheelsexperience.com",
          "telephone": "+1-971-416-6074",
          "email": "contact@reelwheelsexperience.com",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "US"
          },
          "sameAs": [
            "https://dealertower.com"
          ],
          "serviceType": "Vehicle Rental Service",
          "areaServed": "United States"
        }}
      />

      {/* Header & Navigation */}
      <WebsiteHeader
        onSearchClick={() => setShowSearchModal(true)}
        variant="dark"
        className="homepage-header"
      />

      {/* Static Hero Block */}
      <div
        className="homepage-hero-slider relative overflow-hidden"
        style={{ perspective: '1000px' }}
      >
        {/* Cinematic overlay effect */}
        <div className="slide-overlay"></div>
        {/* Hollywood light rays overlay */}
        <div className="hollywood-rays"></div>
        <div className="slider-container relative w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
          <div
            className="no-transform-here absolute inset-0 opacity-100 z-10"
            role="img"
            aria-label="REEL WHEELS"
            style={{
              transform: 'rotateY(0deg) translateZ(0px)',
              transformOrigin: 'left center',
              backfaceVisibility: 'hidden'
            }}
          >
            <div className="w-full h-full relative overflow-hidden">
              <ResponsiveImage
                src="/reel_wheel_hero_first_slide.webp"
                alt="REEL WHEELS"
                priority
                sizes={{ mobile: 'large', tablet: 'hero', desktop: 'hero' }}
                className="w-full h-full object-cover min-h-full min-w-full"
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
            </div>
            <div className="absolute inset-0">
              <div className="relative z-10 h-full flex items-center justify-center text-center px-4 main-hero-slide-content">
                <div className="max-w-4xl mx-auto">
                  <h1 className="text-6xl md:text-8xl lg:text-9xl font-bebas mb-2 tracking-[0.2em] drop-shadow-2xl whitespace-nowrap text-white transform scale-x-[0.7] origin-center first-h1">
                    REEL WHEELS
                  </h1>
                  <h2 className="text-2xl md:text-4xl lg:text-5xl font-bebas mb-12 tracking-[0.4em] drop-shadow-xl whitespace-nowrap text-white transform scale-x-[0.8] origin-center first-h2">
                    EXPERIENCE
                  </h2>
                  <button
                    onClick={handleViewCollection}
                    className="hero-button first-btn"
                  >
                    VIEW "THE COLLECTION"
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section with proper background */}
      <section 
        className="homepage-about-section relative py-16 md:py-24 text-white"
        style={{
          backgroundImage: 'url(/bg1.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
            <div>
              <p className="text-yellow-600 text-sm font-medium mb-4 tracking-wider font-inter">THE REEL WHEELS EXPERIENCE</p>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bebas mb-6 leading-tight">ABOUT US</h2>
              <p className="text-lg md:text-xl leading-relaxed font-inter text-gray-200">
                Make your next party one to remember. Our collection of famous film and TV vehicles and memorabilia provides the perfect backdrop to any event. Bring the Batman to your birthday, the Batmobile to your bar mitzvah, or Ferris' Ferrari. Go Back to the Future for your birthday. From the A-Team to Wayne's World, Reel Wheels Experience delivers the magic of Hollywood to your front door.
              </p>
            </div>
            <div className="flex items-center justify-center lg:justify-end flex-col">
              <img 
                src="/logo-color.webp" 
                alt="Reel Wheels Experience" 
                className="max-w-md lg:max-w-lg m-30"
              />
              <div className="flex mt-6">
              <button 
                onClick={() => window.location.href = '/catalog'}
                className="bg-yellow-700 text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors font-inter font-medium mt-6"
              >
                See "The Collection"
              </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section with proper background and design */}
      <section 
        className="homepage-contact-form py-16 md:py-24 bg-white"
      >
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Contact Form */}
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-gray-100">
              <h2 className="text-3xl md:text-4xl font-bebas mb-8 text-gray-900 text-center lg:text-left">GET IN TOUCH</h2>
              <form className="space-y-6" onSubmit={handleContactFormSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">First Name*</label>
                    <input
                      type="text"
                      value={contactFormData.firstName}
                      onChange={(e) => setContactFormData({ ...contactFormData, firstName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 font-inter bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Last Name*</label>
                    <input
                      type="text"
                      value={contactFormData.lastName}
                      onChange={(e) => setContactFormData({ ...contactFormData, lastName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 font-inter bg-white transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Email*</label>
                    <input
                      type="email"
                      value={contactFormData.email}
                      onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 font-inter bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Phone*</label>
                    <input
                      type="tel"
                      value={contactFormData.phone}
                      onChange={(e) => setContactFormData({ ...contactFormData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 font-inter bg-white transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Comments</label>
                  <textarea
                    rows={4}
                    value={contactFormData.comments}
                    onChange={(e) => setContactFormData({ ...contactFormData, comments: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 font-inter bg-white transition-all resize-none"
                    placeholder="Tell us about your event or inquiry..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingContact ? true : false}
                  className="w-full bg-yellow-600 text-white px-8 py-4 rounded-lg hover:bg-yellow-500 transition-colors font-inter font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingContact ? 'SENDING...' : 'SEND MESSAGE'}
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="text-gray-900">
              <h2 className="text-4xl md:text-5xl font-bebas mb-6 leading-tight text-center lg:text-left">WE APPRECIATE YOUR FEEDBACK</h2>
              <p className="text-lg md:text-xl text-gray-600 mb-8 font-inter leading-relaxed text-center lg:text-left">
                We'd love to hear from you! Whether you have a question about our services, need support, or just want to say hello — our team is here to help.
              </p>
              <div className="space-y-6 text-lg font-inter mb-8">
                <div className="flex items-center group">
                  <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center mr-4 group-hover:bg-yellow-500 transition-colors">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wide">Phone</p>
                    <a href="tel:+19714166074" className="font-semibold text-gray-900 hover:text-yellow-600 transition-colors">
                      (971) 416-6074
                    </a>
                  </div>
                </div>
                <div className="flex items-center group">
                  <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center mr-4 group-hover:bg-yellow-500 transition-colors">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wide">Email</p>
                    <a href="mailto:contact@reelwheelsexperience.com" className="font-semibold text-gray-900 hover:text-yellow-600 transition-colors">
                      contact@reelwheelsexperience.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <WebsiteFooter className="homepage-footer" />

      {/* Contact Modal */}
      <ContactModal 
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />

      {/* Search Modal */}
      <SearchModal 
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />

      {/* Notification Banner */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md">
          <NotificationBanner
            type={notification.type}
            message={notification.message}
            onClose={clearNotification}
          />
        </div>
      )}
    </div>
  );
}

// ...existing code for TrendingModelsSlider (not used anymore), etc...