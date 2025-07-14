'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, Heart, MapPin, Phone, Mail, Play, Pause } from 'lucide-react';
import Image from 'next/image';

// Homepage component - Enhanced by SeGa_cc for Next.js
export default function Homepage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  
  // Touch/swipe state for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Sample slides data (in real app, this would come from API)
  const slides = [
    {
      type: 'hero',
      title: 'REEL WHEELS',
      subtitle: 'EXPERIENCE',
      description: 'Make your next party one to remember. Our collection of famous film and TV vehicles and memorabilia provides the perfect backdrop to any event.',
      buttonText: 'VIEW "THE COLLECTION"',
      image: '/reel wheel hero_first slide.webp',
      video: null
    },
    {
      type: 'product',
      id: '1',
      title: 'Batman Batmobile',
      subtitle: 'Iconic Dark Knight Vehicle',
      image: '/vdp hero (2).webp',
      video: null,
      slug: 'batman-batmobile'
    }
  ];

  // Touch/swipe handlers for mobile
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(false);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    setTouchEnd(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || !isDragging) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
    setIsDragging(false);
  };

  // Auto-advance slides
  useEffect(() => {
    if (isPlaying && !isHovered && !isDragging) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 4000);

      return () => clearInterval(timer);
    }
  }, [slides.length, isPlaying, isHovered, isDragging]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleViewCollection = () => {
    // Navigate to catalog page
    window.location.href = '/catalog';
  };

  const handleContactFormSubmit = async (formData: FormData) => {
    setIsSubmittingContact(true);
    
    try {
      const leadData = {
        form_slug: 'contact_us' as const,
        appendices: {
          first_name: formData.get('firstName') as string,
          last_name: formData.get('lastName') as string,
          email: formData.get('email') as string,
          phone_number: formData.get('phone') as string,
          comments: formData.get('comments') as string || 'Contact form submission from homepage',
        }
      };

      // Use Next.js API route instead of direct external API call
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }
      
      alert('Thank you for your message! We will get back to you soon.');
      
      // Reset the form
      const form = document.querySelector('form') as HTMLFormElement;
      if (form) {
        form.reset();
      }
      
    } catch (error) {
      console.error('Failed to submit contact form:', error);
      alert('Failed to send your message. Please try again or contact us directly.');
    } finally {
      setIsSubmittingContact(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header & Navigation */}
      <header className="bg-white shadow-sm relative z-40">
        {/* Promo Bar */}
        <div className="bg-yellow-600 text-black py-2 text-center text-sm font-medium font-inter">
          <p>🎬 Bring Hollywood Magic to Your <strong>Event</strong>!</p>
        </div>

        {/* Main Header */}
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <button className="flex items-center">
                <Image
                  src="/logo black and white.webp" 
                  alt="Reel Wheels Experience" 
                  width={200}
                  height={60}
                  className="h-8 md:h-12 w-auto"
                />
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button className="text-lg font-medium text-yellow-600 border-b-2 border-yellow-600 pb-1 font-inter">
                Home
              </button>
              <button className="text-lg font-medium text-gray-700 hover:text-yellow-600 font-inter">
                Shop
              </button>
              <button className="text-lg font-medium text-gray-700 hover:text-yellow-600 font-inter">
                About
              </button>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => setShowSearchModal(true)}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
              <button
                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Favorites"
              >
                <Heart className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Slider */}
      <div 
        className="homepage-hero-slider relative overflow-hidden" 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="slider-container relative w-full h-full">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <div className="w-full h-full relative overflow-hidden">
                <Image
                  src={slide.image} 
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
              </div>
              
              <div className="absolute inset-0">              
                <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
                  <div className="max-w-4xl mx-auto">
                    {slide.type === 'hero' ? (
                      <>
                        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bebas mb-2 tracking-[0.2em] drop-shadow-2xl whitespace-nowrap text-white transform scale-x-[0.7] origin-center">
                          {slide.title}
                        </h1>
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bebas mb-12 tracking-[0.4em] drop-shadow-xl whitespace-nowrap text-white transform scale-x-[0.8] origin-center">
                          {slide.subtitle}
                        </h2>
                        <button 
                          onClick={handleViewCollection}
                          className="hero-button"
                        >
                          {slide.buttonText}
                        </button>
                      </>
                    ) : (
                      <div className="absolute top-8 right-8 md:top-8 md:right-8 lg:top-12 lg:right-12 max-w-md">
                        <div className="bg-white bg-opacity-95 backdrop-blur-sm p-6 md:p-8 rounded-lg shadow-xl">
                          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bebas mb-4 text-gray-900 leading-tight tracking-wide">
                            {slide.title}
                          </h2>
                          <button className="bg-gray-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-all font-inter uppercase tracking-wider">
                            VIEW DETAILS
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-4 z-20">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlayPause}
            aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
            className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </button>
          
          {/* Slide Dots */}
          <div className="flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
                }`}
              />
            ))}
          </div>
        </div>
        
        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="hidden md:block absolute left-8 top-1/2 -translate-y-1/2 z-30 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-4 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        
        <button
          onClick={nextSlide}
          className="hidden md:block absolute right-8 top-1/2 -translate-y-1/2 z-30 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-4 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Trending Models Section */}
      <section className="homepage-trending-models bg-white text-black py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-bebas text-center mb-8 md:mb-16">TRENDING MODELS</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Sample trending products */}
            <div className="text-center cursor-pointer group">
              <div className="relative overflow-hidden">
                <Image
                  src="/vdp hero (2).webp"
                  alt="Batman Batmobile"
                  width={400}
                  height={300}
                  className="w-full h-40 md:h-48 object-cover group-hover:scale-105 transition-transform duration-300 rounded-lg"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold font-inter group-hover:text-blue-600 transition-colors leading-tight text-sm md:text-base">
                  Batman Batmobile
                </h3>
              </div>
            </div>
          </div>

          {/* See All Models Button */}
          <div className="text-center mt-8 md:mt-12">
            <button 
              onClick={handleViewCollection}
              className="bg-gray-900 text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors font-inter font-medium"
            >
              SEE ALL MODELS
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="homepage-about-section relative py-16 md:py-24 text-white">
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
              <Image 
                src="/logo-color.webp" 
                alt="Reel Wheels Experience" 
                width={400}
                height={300}
                className="max-w-md lg:max-w-lg"
              />
              <div className="flex mt-6">
                <button 
                  onClick={handleViewCollection}
                  className="bg-yellow-700 text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors font-inter font-medium mt-6"
                >
                  See "The Collection"
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="homepage-contact-form py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Contact Form */}
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-gray-100">
              <h2 className="text-3xl md:text-4xl font-bebas mb-8 text-gray-900 text-center lg:text-left">GET IN TOUCH</h2>
              <form className="space-y-6" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleContactFormSubmit(formData);
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">First Name*</label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 font-inter bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Last Name*</label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 font-inter bg-white transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Email*</label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 font-inter bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 font-inter bg-white transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Comments</label>
                  <textarea
                    rows={4}
                    name="comments"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 font-inter bg-white transition-all resize-none"
                    placeholder="Tell us about your event or inquiry..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingContact}
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
      <footer className="bg-black text-white py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 text-left">
            <div>
              <div className="flex align-left text-left">
                <Image
                  src="/logo-color.webp" 
                  alt="Reel Wheels Experience" 
                  width={284}
                  height={100}
                  className="mb-4"
                />
              </div>
              <p className="text-xs md:text-sm text-gray-400 font-inter">
                Pellentesque ut rhoncus magna nec molestie enim nunc commodo purus sit
              </p>
              <div className="mt-4 space-y-2">
                <p className="text-xs md:text-sm text-gray-400 font-inter">
                  <a href="tel:+19714166074" className="hover:text-white transition-colors flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    971-416-6074
                  </a>
                </p>
                <p className="text-xs md:text-sm text-gray-400 font-inter">
                  <a href="mailto:contact@reelwheelsexperience.com" className="hover:text-white transition-colors flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    contact@reelwheelsexperience.com
                  </a>
                </p>
              </div>
            </div>
            <div className="hidden md:block">
              <h3 className="font-bold mb-4 font-inter text-center">HOMEPAGE</h3>
            </div>
            <div className="hidden md:block">
              <h3 className="font-bold mb-4 font-inter text-center">SHOP</h3>
            </div>
            <div className="hidden md:block">
              <h3 className="font-bold mb-4 font-inter text-center">ABOUT</h3>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-xs md:text-sm text-gray-400 font-inter">
            © COPYRIGHT • <a href="https://dealertower.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">DEALERTOWER</a>
          </div>
        </div>
      </footer>
    </div>
  );
}