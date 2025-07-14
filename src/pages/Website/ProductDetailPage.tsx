import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Heart, ChevronDown, ChevronLeft, ChevronRight, Play, Pause, X, Check, ArrowLeft } from 'lucide-react';
import { formatPriceWithSale } from '../../utils/priceUtils';
import { leadsService } from '../../services/leads';
import type { LeadCreate } from '../../services/leads';
import { apiService } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import SearchModal from '../../components/Website/SearchModal';
import { useFavorites } from '../../contexts/FavoritesContext';
import WebsiteHeader from '../../components/Website/WebsiteHeader';
import WebsiteFooter from '../../components/Website/WebsiteFooter';
import SEOHead from '../../components/UI/SEOHead';
import OptimizedImage from '../../components/UI/OptimizedImage';

export default function ProductDetailPage() {
  const { productType, slug } = useParams();
  const navigate = useNavigate();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryImageIndex, setGalleryImageIndex] = useState(0);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();
  
  // Form state
  const [formData, setFormData] = useState({
    mainOption: '',
    rentPeriod: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    comment: '',
    consent: true
  });

  // Fetch product details
  const { data: product, loading, error } = useApi(
    () => apiService.getProduct(slug),
    { 
      immediate: true,
      cacheKey: `product-detail-${slug}`,
      cacheTTL: 5 * 60 * 1000,
      staleWhileRevalidate: true
    }
  );

  // Fetch related memorabilia
  const { data: memorabiliaData } = useApi(
    () => product ? apiService.getMemorabilia({ limit: 10 }) : Promise.resolve({ rows: [], total: 0, offset: 0 }),
    { 
      immediate: !!product,
      cacheKey: `product-memorabilia-${slug}`,
      cacheTTL: 5 * 60 * 1000,
      staleWhileRevalidate: true
    }
  );

  // Fetch related merchandise
  const { data: merchandiseData } = useApi(
    () => product ? apiService.getMerchandise({ limit: 10 }) : Promise.resolve({ rows: [], total: 0, offset: 0 }),
    { 
      immediate: !!product,
      cacheKey: `product-merchandise-${slug}`,
      cacheTTL: 5 * 60 * 1000,
      staleWhileRevalidate: true
    }
  );

  // Filter memorabilia and merchandise related to this product
  const relatedMemorabilia = memorabiliaData?.rows.filter(item => 
    item.product_ids?.includes(product?.id)
  ) || [];

  const relatedMerchandise = merchandiseData?.rows.filter(item => 
    item.product_ids?.includes(product?.id)
  ) || [];

  // Auto-advance images
  useEffect(() => {
    if (isPlaying && product?.images?.length > 1) {
      const timer = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [isPlaying, product]);

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
    setIsPlaying(false);
  };

  const handleNextImage = () => {
    if (!product?.images?.length) return;
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    setIsPlaying(false);
  };

  const handlePrevImage = () => {
    if (!product?.images?.length) return;
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const openGallery = (index: number) => {
    setGalleryImageIndex(index);
    setIsGalleryOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
    document.body.style.overflow = '';
  };

  const nextGalleryImage = () => {
    if (!product?.images?.length) return;
    setGalleryImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevGalleryImage = () => {
    if (!product?.images?.length) return;
    setGalleryImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMainOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, mainOption: value, rentPeriod: '' }));
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.firstName.trim()) {
      alert('Please enter your first name.');
      return;
    }
    
    if (!formData.lastName.trim()) {
      alert('Please enter your last name.');
      return;
    }
    
    if (!formData.email.trim()) {
      alert('Please enter your email address.');
      return;
    }
    
    if (!formData.mainOption) {
      alert('Please select Buy or Rent first.');
      return;
    }
    
    if (formData.mainOption === 'rent' && !formData.rentPeriod) {
      alert('Please select a rental period.');
      return;
    }
    
    setIsSubmittingForm(true);

    try {
      // Prepare lead data
      const leadData: LeadCreate = {
        form_slug: 'rent_a_product',
        appendices: {
          product_id: product?.id || '',
          rental_period: formData.rentPeriod,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone_number: formData.phone,
          comments: formData.comment || `${formData.mainOption === 'buy' ? 'Purchase' : 'Rental'} inquiry for ${product?.title}. Selected option: ${formData.mainOption}${formData.rentPeriod ? `, Rental period: ${formData.rentPeriod}` : ''}`,
        }
      };

      // Submit lead to API
      await leadsService.submitLead(leadData);
      
      // Show success alert
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 5000);
      
      // Reset form
      setFormData({
        mainOption: '',
        rentPeriod: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        comment: '',
        consent: true
      });
      
    } catch (error) {
      console.error('Failed to submit lead:', error);
      alert('Failed to submit your request. Please try again.');
    } finally {
      setIsSubmittingForm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600 font-inter">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white">
        <WebsiteHeader 
          onSearchClick={() => setShowSearchModal(true)}
          variant="dark"
        />
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 font-inter">Product Not Found</h1>
          <p className="text-gray-600 mb-8 font-inter">The product you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/catalog')}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors font-inter"
          >
            Browse Catalog
          </button>
        </div>
        <WebsiteFooter />
      </div>
    );
  }

  // Determine if we should show "Call for Price" or the actual price
  const priceInfo = formatPriceWithSale(product.retail_price, product.sale_price);

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title={`${product.title} - Reel Wheels Experience`}
        description={product.subtitle || `Authentic ${product.title} available for rent or purchase. ${product.description?.substring(0, 100)}...`}
        keywords={product.keywords?.join(', ') || `movie vehicle, ${product.title}, film car rental`}
        image={product.images[0] || '/vdp hero (2).webp'}
        url={`https://reelwheelsexperience.com/catalog/${productType}/${slug}`}
        type="product"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": product.title,
          "description": product.description,
          "image": product.images[0] || '/vdp hero (2).webp',
          "offers": {
            "@type": "Offer",
            "price": product.sale_price || product.retail_price || "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          }
        }}
      />
      
      {/* Header & Navigation */}
      <WebsiteHeader 
        onSearchClick={() => setShowSearchModal(true)}
        variant="dark"
        className="product-detail-header hidden"
      />

      {/* Back to Catalog Link */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
        <button
          onClick={() => navigate('/catalog')}
          className="flex items-center text-yellow-600 hover:text-yellow-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Catalog
        </button>
      </div>

      {/* Success Alert */}
      {showSuccessAlert && (
        <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 animate-fadeIn">
          <Check className="h-5 w-5" />
          <p className="font-medium">Your request has been submitted successfully!</p>
          <button 
            onClick={() => setShowSuccessAlert(false)}
            className="ml-2 text-white hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="product-detail-main">
        {/* Main Image Slider */}
        <div className="w-full">
          <div className="product-detail-main-slider relative product-hero-slider">
            <div className="absolute inset-0 w-full h-full">
              {product.video_url && currentImageIndex === 0 ? (
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                  poster={product.images[0]}
                >
                  <source src={product.video_url} type="video/mp4" />
                  <OptimizedImage
                    src={product.images[0]} 
                    alt={product.title}
                    size="hero"
                    className="w-full h-full object-cover"
                  />
                </video>
              ) : (
                <OptimizedImage
                  src={product.images[currentImageIndex]} 
                  alt={product.title}
                  size="hero"
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Image Counter */}
            <div className="absolute bottom-8 left-8 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
              {currentImageIndex + 1} / {product.images.length}
            </div>

            {/* Gallery Button */}
            <button
              onClick={() => openGallery(currentImageIndex)}
              className="absolute bottom-8 right-8 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm flex items-center space-x-2 hover:bg-opacity-70 transition-colors gallery-controls"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              </svg>
              <span>View Gallery</span>
            </button>

            {/* Navigation Arrows */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-8 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-colors nav-arrows"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-8 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-colors nav-arrows"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Play/Pause Button */}
            {product.images.length > 1 && false && (
              <button
                onClick={togglePlayPause}
                className="absolute bottom-8 right-8 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Thumbnails */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 product-thumbnails-wrapper relative product-thumbnails">
          <div className="thumbnail-slider-container overflow-hidden px-10">
            <div 
              className="thumbnail-slider-track flex space-x-4 transition-transform duration-300"
              style={{ 
                transform: `translateX(-${Math.max(0, currentImageIndex - 2) * (120 + 16)}px)` 
              }}
            >
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => handleThumbnailClick(index)}
                  className={`thumbnail-slider-item w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentImageIndex ? 'border-blue-500' : 'border-transparent hover:border-gray-300'
                  }`}
                  aria-selected={index === currentImageIndex}
                >
                  <OptimizedImage
                    src={image} 
                    alt={`${product.title} - Image ${index + 1}`}
                    size="thumbnail"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
            
            {/* Thumbnail Navigation Arrows */}
            {product.images.length > 5 && (
              <>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentImageIndex(Math.max(0, currentImageIndex - 1));
                  }}
                  className="thumbnail-slider-nav left absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2"
                  disabled={currentImageIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentImageIndex(Math.min(product.images.length - 1, currentImageIndex + 1));
                  }}
                  className="thumbnail-slider-nav right absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2"
                  disabled={currentImageIndex === product.images.length - 1}
                >
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Product Title and Price Section */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 product-title-section">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="mb-4 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 font-bebas">{product.title}</h1>
              <p className="text-lg text-gray-600 font-inter">{product.subtitle}</p>
            </div>
            
            <div className="flex flex-col items-end">
              {/* Price */}
              <div className="price-container mb-4">
                {priceInfo.isCallForPrice ? (
                  <div className="call-for-price">Call for Price</div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className={`text-2xl md:text-3xl font-bold ${priceInfo.isOnSale ? 'text-red-600' : 'text-gray-900'} font-inter`}>
                      {priceInfo.displayPrice}
                    </span>
                    {priceInfo.originalPrice && (
                      <span className="text-xl md:text-2xl text-gray-500 line-through font-inter">
                        {priceInfo.originalPrice}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              {/* CTA Button */}
              <button
                onClick={() => setShowContactForm(!showContactForm)}
                className="bg-gray-900 text-white px-8 py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors font-inter"
              >
                Get in Touch
              </button>
            </div>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className={`max-w-7xl mx-auto px-4 md:px-6 py-8 product-contact-form bg-gray-50 rounded-lg shadow-md my-8 ${showContactForm ? 'block' : 'hidden'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-inter">Get {product.title}</h2>
              <div className="flex items-center gap-3 mb-6 p-3 bg-white rounded-lg">
                <div className="w-16 h-12 bg-black rounded flex items-center justify-center">
                  <OptimizedImage
                    src={product.images[0]}
                    alt={product.title}
                    size="thumbnail"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 font-inter">{product.title}</h3>
                </div>
                <div className="text-lg font-bold text-gray-900 font-inter">
                  {priceInfo.displayPrice}
                </div>
              </div>
              
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                    Select Option<span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    name="mainOption"
                    value={formData.mainOption}
                    onChange={handleMainOptionChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-inter"
                  >
                    <option value="">Choose an option...</option>
                    <option value="buy">Buy</option>
                    <option value="rent">Rent</option>
                  </select>
                </div>

                {formData.mainOption === 'rent' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                      Rental Period<span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      name="rentPeriod"
                      value={formData.rentPeriod}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-inter"
                    >
                      <option value="">Choose rental period...</option>
                      <option value="daily">Daily - $5,000/day</option>
                      <option value="weekly">Weekly - $30,000/week</option>
                      <option value="monthly">Monthly - $100,000/month</option>
                      <option value="yearly">Yearly - $1,000,000/year</option>
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                      First Name<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-inter"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                      Last Name<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-inter"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                    Email<span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-inter"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-inter"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Comments</label>
                  <textarea
                    name="comment"
                    value={formData.comment}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Enter your comments here..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-inter"
                  />
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={formData.consent}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                  <label className="text-sm text-gray-600 font-inter">
                    Reel Wheels Experience may text me updates about my inquiry or appointment. Message and data rates may apply. 
                    Message frequency varies. Reply HELP for help or STOP to opt out.{' '}
                    <a href="#" className="text-blue-600 underline">Privacy Policy</a>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingForm || !formData.mainOption}
                  className={`w-full py-3 rounded-lg font-semibold font-inter transition-colors ${
                    formData.mainOption 
                      ? 'bg-gray-900 text-white hover:bg-gray-800' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isSubmittingForm 
                    ? 'Submitting...' 
                    : formData.mainOption === 'buy' ? 'Get Purchase Quote' : formData.mainOption === 'rent' ? 'Get Rental Quote' : 'Select an option first'}
                </button>
              </form>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-inter">Product Details</h2>
              <div className="prose prose-lg max-w-none text-gray-600 font-inter bg-white p-6 rounded-lg shadow-sm">
                <p>{product.description}</p>
                
                {/* Product Features */}
                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Features</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {product.keywords.map((keyword, index) => (
                      <li key={index} className="text-gray-700">{keyword}</li>
                    ))}
                  </ul>
                </div>
                
                {/* Product Specifications */}
                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Specifications</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Type:</span>{' '}
                      <span className="text-gray-600">{product.product_types.join(', ')}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Movie:</span>{' '}
                      <span className="text-gray-600">{product.movies?.join(', ') || 'N/A'}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Genre:</span>{' '}
                      <span className="text-gray-600">{product.genres?.join(', ') || 'N/A'}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Available For:</span>{' '}
                      <span className="text-gray-600">{product.available_rental_periods?.join(', ') || 'Purchase Only'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 product-description-section">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 font-inter">Description</h2>
          <div className="prose prose-lg max-w-none text-gray-600 font-inter bg-white p-6 rounded-lg shadow-sm">
            <p>{product.description}</p>
            
            {/* Product Features */}
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Features</h3>
              <ul className="list-disc pl-5 space-y-2">
                {product.keywords.map((keyword, index) => (
                  <li key={index} className="text-gray-700">{keyword}</li>
                ))}
              </ul>
            </div>
            
            {/* Product Specifications */}
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Type:</span>{' '}
                  <span className="text-gray-600">{product.product_types.join(', ')}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Movie:</span>{' '}
                  <span className="text-gray-600">{product.movies?.join(', ') || 'N/A'}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Genre:</span>{' '}
                  <span className="text-gray-600">{product.genres?.join(', ') || 'N/A'}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Available For:</span>{' '}
                  <span className="text-gray-600">{product.available_rental_periods?.join(', ') || 'Purchase Only'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Products Sections */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          {/* Merchandise Section */}
          {relatedMerchandise.length > 0 && (
            <section className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 font-bebas">MERCHANDISE</h2>
                <a href={`/${product.slug}/merchandise`} className="text-yellow-600 hover:text-yellow-800 font-medium">View All →</a>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {relatedMerchandise.slice(0, 4).map((item) => (
                  <div 
                    key={item.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/${product.slug}/merchandise`)}
                  >
                    <div className="relative w-full object-cover h-48">
                      <OptimizedImage
                        src={item.photos[0] || '/vdp hero (2).webp'} 
                        alt={item.title}
                        size="card"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-1 truncate font-inter">{item.title}</h3>
                      <p className="text-xs text-gray-500 mb-2 truncate font-inter">{item.subtitle}</p>
                      <p className="text-sm font-bold text-gray-900 font-inter">${item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
          
          {/* Memorabilia Section */}
          {relatedMemorabilia.length > 0 && (
            <section className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 font-bebas">MOVIE MEMORABILIA</h2>
                <a href={`/${product.slug}/memorabilia`} className="text-yellow-600 hover:text-yellow-800 font-medium">View All →</a>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                {relatedMemorabilia.slice(0, 4).map((item) => (
                  <div 
                    key={item.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/${product.slug}/memorabilia`)}
                  >
                    <div className="relative w-full object-cover h-48">
                      <OptimizedImage
                        src={item.photos[0] || '/vdp hero (2).webp'} 
                        alt={item.title}
                        size="card"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-1 truncate font-inter">{item.title}</h3>
                      <p className="text-xs text-gray-500 truncate font-inter">{item.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Full Screen Gallery Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <button
            onClick={closeGallery}
            className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/10 transition-colors z-10"
          >
            <X className="h-8 w-8" />
          </button>
          
          <div className="relative max-w-4xl max-h-full">
            <OptimizedImage
              src={product.images[galleryImageIndex]} 
              alt={`${product.title} - Image ${galleryImageIndex + 1}`}
              size="fullscreen"
              className="max-w-full max-h-[90vh] object-contain"
            />
            
            {/* Navigation Arrows */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={prevGalleryImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 text-white p-3 rounded-full hover:bg-black/50 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextGalleryImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 text-white p-3 rounded-full hover:bg-black/50 transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
            
            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {galleryImageIndex + 1} / {product.images.length}
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      <SearchModal 
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />

      <WebsiteFooter className="product-detail-footer" />
    </div>
  );
}