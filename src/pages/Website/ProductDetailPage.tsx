import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Heart, X, Play, Images } from 'lucide-react';
import OptimizedImage from '../../components/UI/OptimizedImage';
import { apiService } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import ContactModal from '../../components/UI/ContactModal';
import SearchModal from '../../components/Website/SearchModal';
import { useFavorites } from '../../contexts/FavoritesContext';
import WebsiteHeader from '../../components/Website/WebsiteHeader';
import WebsiteFooter from '../../components/Website/WebsiteFooter';
import SEOHead from '../../components/UI/SEOHead';
import NotificationBanner from '../../components/UI/NotificationBanner';
import { useNotification } from '../../hooks/useNotification';
import { formatPriceWithSale } from '../../utils/priceUtils';

export default function ProductDetailPage() {
  const { productType, slug } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { notification, showNotification, clearNotification } = useNotification();

  // Fetch product details (includes related products, memorabilia, merchandise)
  const { data: product, loading } = useApi(
    () => slug ? apiService.getProduct(slug) : Promise.reject('No slug provided'),
    { 
      immediate: !!slug,
      skipCache: true // Remove caching for debugging
    }
  );

  // Normalize product and connected data
  const currentProduct = product
    ? {
        ...product,
        products: Array.isArray(product.products) ? product.products : [],
        memorabilia: Array.isArray((product as any).memorabilia) ? (product as any).memorabilia : [],
        merchandise: Array.isArray((product as any).merchandise) ? (product as any).merchandise : [],
      }
    : undefined;

  // Related products, memorabilia, and merchandise from product object
  const relatedProducts = currentProduct?.products || [];
  const memorabiliaItems = currentProduct?.memorabilia || [];
  const merchandiseItems = currentProduct?.merchandises || currentProduct?.merchandise || [];

  // Ensure we always have a valid images array
  const productImages = currentProduct?.images || [];
  const images = productImages.length > 0 ? productImages : [
    productImages[0] || '/vdp hero (2).webp',
    'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&dpr=2',
    'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&dpr=2',
    'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&dpr=2'
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const openGallery = (index: number) => {
    setGalleryIndex(index);
    setShowGallery(true);
  };

  // Add missing gallery navigation functions
  const nextGallery = () => {
    setGalleryIndex((prev) => (prev + 1) % images.length);
  };

  const prevGallery = () => {
    setGalleryIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Ensure component updates on slug change (force remount)
  useEffect(() => {
    setCurrentImageIndex(0);
    window.scrollTo(0, 0);
  }, [slug]);

  const handleRelatedProductClick = (relatedProduct: any) => {
    const type = relatedProduct.product_types?.[0] || 'vehicle';
    // Force full page reload to ensure proper navigation
    window.location.href = `/catalog/${type}/${relatedProduct.slug}`;
  };

  const handleMemorabiliaClick = (item: any) => {
    // Navigate to memorabilia page - fix URL structure
    if (item.slug) {
      window.location.href = `/memorabilia/${item.slug}`;
    } else {
      // Navigate to product's memorabilia page if no individual slug
      const type = currentProduct?.product_types?.[0] || 'vehicle';
      window.location.href = `/catalog/${type}/${slug}/memorabilia`;
    }
  };

  const handleMerchandiseClick = (item: any) => {
    // Navigate to merchandise page - fix URL structure
    if (item.slug) {
      window.location.href = `/merchandise/${item.slug}`;
    } else {
      // Navigate to product's merchandise page if no individual slug
      const type = currentProduct?.product_types?.[0] || 'vehicle';
      window.location.href = `/catalog/${type}/${slug}/merchandise`;
    }
  };

  // Helper to determine if price should be shown
  function shouldShowPrice(product) {
    const price = parseFloat(product.retail_price || product.price || '0');
    return !isNaN(price) && price >= 1000;
  }

  // Helper to get product type for navigation
  function getProductType(product) {
    return product.product_types?.[0] || 'vehicle';
  }

  // Error fallback: show maintenance message if fatal error
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (typeof currentProduct === 'undefined' && !loading) {
      setHasError(true);
    } else {
      setHasError(false);
    }
  }, [currentProduct, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <WebsiteHeader 
          onSearchClick={() => setShowSearchModal(true)}
          variant="dark"
          className="product-detail-header"
        />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <WebsiteHeader 
          onSearchClick={() => setShowSearchModal(true)}
          variant="dark"
          className="product-detail-header"
        />
        <div className="flex flex-col items-center justify-center h-96">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">We're Performing Maintenance</h1>
          <p className="text-gray-600 mb-6 max-w-xl text-center">
            Our product page is temporarily unavailable while we perform some updates. Please check back soon or contact us if you need assistance.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div className="min-h-screen bg-white">
        <WebsiteHeader 
          onSearchClick={() => setShowSearchModal(true)}
          variant="dark"
          className="product-detail-header"
        />
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/catalog')}
              className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800"
            >
              Browse Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  const priceInfo = formatPriceWithSale(currentProduct.retail_price, currentProduct.sale_price);

  return (
    <div key={slug} className="min-h-screen bg-white">
      <SEOHead
        title={`${currentProduct.title} - Reel Wheels Experience`}
        description={currentProduct.description || `${currentProduct.title} - ${currentProduct.subtitle}`}
        keywords={`${currentProduct.title}, ${currentProduct.keywords?.join(', ')}, movie vehicle rental`}
        url={`https://reelwheelsexperience.com/catalog/${productType}/${slug}`}
        image={images[0]}
        type="product"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": currentProduct.title,
          "description": currentProduct.description,
          "image": images,
          "offers": {
            "@type": "Offer",
            "price": currentProduct.retail_price || "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          }
        }}
      />
      
      <WebsiteHeader 
        onSearchClick={() => setShowSearchModal(true)}
        variant="dark"
        className="product-detail-header"
      />

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
        <button
          onClick={() => navigate('/catalog')}
          className="flex items-center text-blue-600 hover:text-blue-800 font-inter"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Catalog
        </button>
      </div>

      {/* Product Detail Main */}
      <div className="product-detail-main max-w-7xl mx-auto px-4 md:px-6 pb-12">
        {/* Responsive background image with overlayed title/subtitle */}
        <div
          className="relative w-full"
          style={{
            // Responsive height for hero section
            height: '930px',
            minHeight: '256px',
            maxHeight: '930px',
            background: `#000000 url('${getBgImage(currentProduct)}') center center / cover no-repeat`,
            transition: 'background-image 0.3s',
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40 z-10 hidden" />
          <div className="relative z-20 flex flex-col items-center justify-center h-full text-center px-4 product-hero-content">
            <h1 className="text-white font-bebas text-5xl md:text-7xl drop-shadow-lg mb-2">{currentProduct.title}</h1>
            {currentProduct.subtitle && (
              <h2 className="text-white font-inter text-xl md:text-2xl font-normal drop-shadow mb-4">{currentProduct.subtitle}</h2>
            )}
            {/* Main product image below title/subtitle */}
            <div className="flex">
              <div className="relative rounded-lg overflow-hidden shadow-lg" style={{ maxWidth: 600, width: '100%' }}>
                <OptimizedImage
                  src={images[0]}
                  alt={currentProduct.title}
                  size="fullscreen"
                  className="w-full h-auto object-cover cursor-pointer"
                  onClick={() => openGallery(0)}
                />
                
                {/* Open Gallery Button */}
                <button
                  onClick={() => openGallery(0)}
                  className="open-gallery-adds-btn absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg hover:bg-opacity-80 transition-all flex items-center gap-2 backdrop-blur-sm z-30"
                  aria-label="Open image gallery"
                >
                  <Images className="h-4 w-4" />
                  <span className="text-sm font-medium">Open Gallery</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Modal */}
        {showGallery && (
          <div className="fixed inset-0 z-[9999] bg-black bg-opacity-90 flex items-center justify-center">
            <button
              className="absolute top-6 right-6 text-white text-3xl z-50"
              onClick={() => setShowGallery(false)}
              aria-label="Close gallery"
            >
              <X />
            </button>
            <button
              className="absolute left-6 top-1/2 -translate-y-1/2 text-white text-3xl z-50"
              onClick={prevGallery}
              aria-label="Previous image"
            >
              <ChevronLeft />
            </button>
            <div className="relative max-w-3xl w-full flex flex-col items-center max-w-88vw-mode">
              <OptimizedImage
                src={images[galleryIndex]}
                alt={`${currentProduct.title} ${galleryIndex + 1}`}
                size="fullscreen"
                className="w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              />
              <div className="mt-4 text-white text-sm">{galleryIndex + 1} / {images.length}</div>
            </div>
            <button
              className="absolute right-6 top-1/2 -translate-y-1/2 text-white text-3xl z-50"
              onClick={nextGallery}
              aria-label="Next image"
            >
              <ChevronRight />
            </button>
          </div>
        )}
      </div>
      {/* End Product Detail Main */}

  <div className="w-full product-page-content-wrapper">

      {/* Thumbnails Slider and Product Info Row */}
      <div className="product-main-content grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        {/* Left Column: Thumbnails Slider */}
        <div className="lg:col-span-2">
          <ThumbnailSlider 
            images={images}
            currentImageIndex={currentImageIndex}
            onImageSelect={setCurrentImageIndex}
            onImageClick={openGallery}
            productTitle={currentProduct.title}
          />
        </div>

        {/* Right Column: Product Title and Price */}
        <div className="lg:col-span-1">
          <div className="flex justify-end">
            <div className="price-container mb-6">
              {shouldShowPrice(currentProduct) && (
                <div className="flex flex-col space-y-2">
                  <span className={`text-3xl font-bold ${priceInfo.isOnSale ? 'text-red-600' : 'text-gray-900'} font-inter`}>
                    {priceInfo.displayPrice}
                  </span>
                  {priceInfo.originalPrice && (
                    <span className="text-xl text-gray-500 line-through font-inter">
                      {priceInfo.originalPrice}
                    </span>
                  )}
                </div>
              )}
            </div>
    
            <div className="flex flex-col space-y-3 items-end product-big-cta">
              <button
                onClick={() => setShowContactModal(true)}
                className="bg-gray-900 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-800 transition-colors font-inter"
              >
                Get in Touch
              </button>
              <button
                onClick={() => toggleFavorite(currentProduct.id)}
                className={`flex items-center justify-center px-8 py-4 rounded-lg border-2 transition-colors font-inter ${
                  isFavorite(currentProduct.id)
                    ? 'border-red-500 text-red-500 bg-red-50'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                <Heart className={`h-5 w-5 mr-2 ${isFavorite(currentProduct.id) ? 'fill-current' : ''}`} />
                {isFavorite(currentProduct.id) ? 'Remove from Favorites' : 'Add to Favorites'}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Product Description and Keywords */}
      {(currentProduct.description || currentProduct.keywords?.length > 0) && (
        <div className="mb-16-none">
          {/* Product Types and Genres as tags above description */}
          <div className="flex flex-wrap gap-2 mb-4">
            {currentProduct.product_types?.map((type: string, idx: number) => (
              <span
                key={`ptype-${type}-${idx}`}
                className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-inter"
              >
                {type}
              </span>
            ))}
            {currentProduct.genres?.map((genre: string, idx: number) => (
              <span
                key={`genre-${genre}-${idx}`}
                className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-inter"
              >
                {genre}
              </span>
            ))}
          </div>
          {/* Movies as heading, comma separated */}
          {currentProduct.movies?.length > 0 && (
            <h3 className="text-lg font-semibold text-purple-700 mb-2 font-inter">
              Movie: {currentProduct.movies.join(', ')}
            </h3>
          )}
          {currentProduct.description && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 font-inter">{currentProduct.description_title ? currentProduct.description_title : 'Description'}</h3>
              <p className="text-gray-700 leading-relaxed font-inter text-lg">{currentProduct.description}</p>
            </div>
          )}
          {/* Keywords */}
          {currentProduct.keywords?.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 font-inter">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {currentProduct.keywords.map((keyword, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full font-inter">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Memorabilia and Merchandise Row Layout */}
      <div className="memorabilia-merchandise-row mt-16 w-full">
        {/* Merchandise Section */}
        {merchandiseItems.length > 0 && (
          <div>
            <div className="product-merchandise-wrapper flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bebas text-gray-900 flex items-center">
                Merchandise
              </h2>
              <button
                onClick={() => navigate(`/${currentProduct.slug}/merchandise`)}
                className="ml-4 text-blue-600 hover:text-blue-800 font-medium font-inter"
              >
                View All →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {merchandiseItems.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => handleMerchandiseClick(item)}
                >
                  <div className="relative overflow-hidden">
                    {item.photos?.[0] ? (
                      <OptimizedImage
                        src={item.photos[0]}
                        alt={item.title}
                        size="card"
                        className="no-transform-here w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-900 flex items-center justify-center">
                        <span className="text-white text-lg font-bold">T-SHIRT</span>
                      </div>
                    )}
                    <div className="hidden absolute top-4 left-4 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                      MERCHANDISE
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-1 font-inter">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-2 font-inter">{item.subtitle}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900 font-inter">${item.price}</span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {item.keywords?.slice(0, 2).map((keyword, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded font-inter">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

            </div>
          </div>
        )}
        
        {/* Memorabilia Section */}
        {memorabiliaItems.length > 0 && (
          <div className="product-memorabilia-wrapper mb-16 lg:mb-0">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bebas text-gray-900 flex items-center">
                Memorabilia
              </h2>
              <button
                onClick={() => navigate(`/${currentProduct.slug}/memorabilia`)}
                className="ml-4 text-blue-600 hover:text-blue-800 font-medium font-inter"
              >
                View All →
              </button>
            </div>
            <div className="flex flex-col">
              {memorabiliaItems.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group flex"
                  onClick={() => handleMemorabiliaClick(item)}
                >
                  <div className="relative overflow-hidden">
                    <OptimizedImage
                      src={item.photos?.[0] || '/memorabilia_balanced.webp'}
                      alt={item.title}
                      size="card"
                      className="no-transform-here w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="hidden absolute top-4 left-4 bg-purple-500 text-white px-2 py-1 rounded text-xs font-medium">
                      MEMORABILIA
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-1 font-inter">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 font-inter">{item.subtitle}</p>
                    <div className="flex flex-wrap gap-1">
                      {item.keywords?.slice(0, 2).map((keyword, index) => (
                        <span key={index} className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded font-inter">
                          {keyword}
                        </span>
                      ))}
                      {item.keywords && item.keywords.length > 2 && (
                        <span className="text-xs text-gray-500 font-inter">
                          +{item.keywords.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

  </div>

  {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 w-full related-products-wrapper">
          <h2 className="text-2xl md:text-3xl font-bebas text-gray-900 mb-8">You Might be Interested</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <div
                key={relatedProduct.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/catalog/${getProductType(relatedProduct)}/${relatedProduct.slug}`)}
              >
                <OptimizedImage
                  src={relatedProduct.images?.[0] || '/vdp hero (2).webp'}
                  alt={relatedProduct.title}
                  size="card"
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-1 font-inter">{relatedProduct.title}</h3>
                  <p className="text-sm text-gray-600 font-inter">{relatedProduct.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* Contact Modal as right sidebar */}
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        productTitle={currentProduct.title}
        productPrice={priceInfo.displayPrice}
        productImage={images[0]} // Add the first product image
        apiSlug="rent_a_product"
        showNotification={showNotification}
      />

      {/* Search Modal */}
      <SearchModal 
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />

      <WebsiteFooter className="product-detail-footer" />
    </div>
  );
}

// Thumbnail Slider Component
// Thumbnail Slider Component - Fix TypeScript types and add gallery click
interface ThumbnailSliderProps {
  images: string[];
  currentImageIndex: number;
  onImageSelect: (index: number) => void;
  onImageClick: (index: number) => void;
  productTitle: string;
}

function ThumbnailSlider({ 
  images, 
  currentImageIndex, 
  onImageSelect, 
  onImageClick,
  productTitle 
}: ThumbnailSliderProps) {
  const [startIndex, setStartIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const visibleCount = 4; // Show 4 thumbnails at a time
  
  const canScrollLeft = startIndex > 0;
  const canScrollRight = startIndex + visibleCount < images.length;
  
  const scrollLeft = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setStartIndex(Math.max(0, startIndex - 1));
    setTimeout(() => setIsAnimating(false), 300);
  };
  
  const scrollRight = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setStartIndex(Math.min(images.length - visibleCount, startIndex + 1));
    setTimeout(() => setIsAnimating(false), 300);
  };
  
  // Auto-scroll to keep current image visible
  useEffect(() => {
    if (currentImageIndex < startIndex) {
      setStartIndex(currentImageIndex);
    } else if (currentImageIndex >= startIndex + visibleCount) {
      setStartIndex(currentImageIndex - visibleCount + 1);
    }
  }, [currentImageIndex, startIndex, visibleCount]);
  
  const visibleImages = images.slice(startIndex, startIndex + visibleCount);
  
  return (
    <div className="relative product-thumbnails-wrapper overflow-hidden">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 font-inter hidden">Product Gallery</h3>
      
      <div className="relative thumbnail-slider-container">
        {/* Scroll Left Button */}
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            disabled={isAnimating}
            className="hidden thumbnail-slider-nav left absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-all transform hover:scale-110 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
        )}
        
        {/* Thumbnails Container */}
        <div className="thumbnail-slider-track flex space-x-3 px-8 transition-transform duration-300 ease-in-out">
          {visibleImages.map((image, index) => {
            const actualIndex = startIndex + index;
            return (
              <div key={actualIndex} className="relative">
                <button
                  onClick={() => onImageSelect(actualIndex)}
                  className={`thumbnail-slider-item flex-shrink-0 w-20 h-16 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
                    actualIndex === currentImageIndex 
                      ? 'border-blue-500 ring-2 ring-blue-200 scale-110 shadow-lg' 
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                  title="Click to select, double-click to open gallery"
                >
                  <OptimizedImage
                    src={image}
                    alt={`${productTitle} ${actualIndex + 1}`}
                    size="thumbnail"
                    className="w-full h-full object-cover transition-transform duration-300"
                  />
                </button>
                {/* Gallery open button overlay */}
                <button
                  onClick={() => onImageClick(actualIndex)}
                  className="open-gallery absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black bg-opacity-50 rounded-lg transition-opacity duration-200"
                  title="Open gallery"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
        
        {/* Scroll Right Button */}
        {canScrollRight && (
          <button
            onClick={scrollRight}
            disabled={isAnimating}
            className="hidden thumbnail-slider-nav right absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-all transform hover:scale-110 disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        )}
      </div>
      
      {/* Image Counter */}
      <div className="text-center text-sm text-gray-500 font-inter transition-opacity duration-300">
        {currentImageIndex + 1} of {images.length} images
      </div>
    </div>
  );
}

function getBgImage(product: any): string {
  // Use product-specific background if activated
  if (product?.is_background_image_activated) {
    if (
      typeof window !== 'undefined' &&
      window.innerWidth <= 600 &&
      product.background_image_url_mobile &&
      product.is_background_image_mobile_activated
    )
      return product.background_image_url_mobile;
    if (
      typeof window !== 'undefined' &&
      window.innerWidth <= 1024 &&
      product.background_image_url_tablet &&
      product.is_background_image_tablet_activated
    )
      return product.background_image_url_tablet;
    return product.background_image_url;
  }
  // Default backgrounds (public folder)
  if (typeof window !== 'undefined') {
    if (window.innerWidth <= 768) {
      return '/reel_wheels_background_m.webp';
    }
    if (window.innerWidth <= 1440) {
      return '/reel_wheels_background_t.webp';
    }
  }
  return '/reel_wheels_background_d.webp';
}