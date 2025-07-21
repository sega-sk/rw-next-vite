import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Filter, Heart, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatPriceWithSale, shouldShowSaleBadge } from '../../utils/priceUtils';
import { apiService } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import SearchModal from '../../components/Website/SearchModal';
import { useFavorites } from '../../contexts/FavoritesContext';
import WebsiteHeader from '../../components/Website/WebsiteHeader';
import WebsiteFooter from '../../components/Website/WebsiteFooter';
import SEOHead from '../../components/UI/SEOHead';
import Tooltip from '../../components/UI/Tooltip';
import OptimizedImage from '../../components/UI/OptimizedImage';

// Product Card Component with Image Slider - Fix TypeScript types
interface ProductCardProps {
  product: any; // You can create a proper Product interface later
  onProductClick: (product: any) => void;
  onFavoriteToggle: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
}

function ProductCard({ product, onProductClick, onFavoriteToggle, isFavorite }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Use product images or fallback to demo images
  const images = product.images?.length > 0 ? product.images : [
    product.images?.[0] || '/vdp hero (2).webp',
    'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2',
    'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2',
    'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2'
  ];

  // Ensure keywords is always an array
  const keywords = Array.isArray(product.keywords) ? product.keywords : [];

  // Get price information using utility
  const priceInfo = formatPriceWithSale(product.retail_price, product.sale_price);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };


  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
      <div className="relative overflow-hidden rounded-lg product-image-container">
        {product.video_url && currentImageIndex === 0 ? (
          <div className="relative">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-48 md:h-64 object-cover"
              poster={images[0]}
            >
              <source src={product.video_url} type="video/mp4" />
              <img 
                src={images[0]} 
                alt={product.title}
                className="w-full h-48 md:h-64 object-cover"
              />
            </video>
          </div>
        ) : (
          <OptimizedImage
            src={images[currentImageIndex]}
            alt={product.title}
            size="card"
            className="no-transform-here w-full h-48 md:h-64 object-cover group-hover:scale-105 transition-transform duration-300"
            onClick={() => onProductClick(product)}
          />
        )}
        
        {/* Image Dots */}
        {images.length > 1 && (
          <div className="image-dots absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Show SALE badge only when there's a valid sale */}
        {shouldShowSaleBadge(product.retail_price, product.sale_price) && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
            SALE
          </div>
        )}
        
        <button 
          className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle(product.id);
          }}
        >
          <Heart 
            className={`h-4 w-4 transition-colors ${
              isFavorite(product.id) ? 'text-red-500 fill-current' : 'text-gray-600'
            }`}
          />
        </button>
  
      </div>
      <div className="p-4 md:p-6" onClick={() => onProductClick(product)}>
        <h3 className="text-lg font-normal mb-2 font-inter" style={{ color: '#636363' }}>{product.title}</h3>
        <p className="text-sm mb-4 font-inter" style={{ color: '#636363' }}>{product.subtitle}</p>
        
        {/* Price Display */}
        <div className="mb-4">
          {priceInfo.isCallForPrice ? (
            <div className="call-for-price text-center">
              {false ? 'Call for Price' : ''}
            </div>
          ) : (
            <div className="text-center">
              <div className={`font-bold ${priceInfo.isOnSale ? 'text-red-600' : 'text-gray-900'}`}>
                {priceInfo.displayPrice}
              </div>
              {priceInfo.originalPrice && (
                <div className="text-sm text-gray-500 line-through">
                  {priceInfo.originalPrice}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div /> {/* keep layout spacing */}
          <div className="flex items-center space-x-1">
            {keywords.length > 0 ? (
              <>
                {keywords.slice(0, 2).map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded font-inter">
                    {tag}
                  </span>
                ))}
                {keywords.length > 2 && (
                  <Tooltip 
                    content={
                      <div className="max-w-xs">
                        <div className="font-medium mb-2">Additional Tags:</div>
                        <div className="flex flex-wrap gap-1">
                          {keywords.slice(2).map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    }
                    position="top"
                  >
                    <span className="text-xs text-gray-500 font-inter cursor-help hover:text-gray-700 transition-colors">
                      +{keywords.length - 2}
                    </span>
                  </Tooltip>
                )}
              </>
            ) : (
              <span className="text-xs text-gray-400 font-inter">No tags</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  const { productType } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    productType: productType || 'Any',
    movie: 'Any',
    genre: 'Any',
  });
  const [sortBy, setSortBy] = useState('Featured');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const { toggleFavorite, isFavorite } = useFavorites();

  // Fetch products with filters - Fix the API call
  const { data: productsData, loading, execute: refetchProducts } = useApi(
    () => {
      // Build the API call parameters
      const apiParams: any = {
        limit: 100
      };

      // Add search term if present
      if (searchTerm.trim()) {
        apiParams.q = searchTerm.trim();
      }

      // Add product type filter
      if (selectedFilters.productType && selectedFilters.productType !== 'Any') {
        apiParams.product_types = [selectedFilters.productType];
      }

      // Add movie filter
      if (selectedFilters.movie && selectedFilters.movie !== 'Any') {
        apiParams.movies = [selectedFilters.movie];
      }

      // Add genre filter
      if (selectedFilters.genre && selectedFilters.genre !== 'Any') {
        apiParams.genres = [selectedFilters.genre];
      }

      // Add sorting
      if (sortBy !== 'Featured') {
        apiParams.sort = sortBy.toLowerCase().replace(/\s+/g, '_');
      }

      console.log('API call parameters:', apiParams); // Debug log

      // Use search API if there's a search term, otherwise use regular products API
      if (searchTerm.trim()) {
        return apiService.searchProducts(apiParams);
      } else {
        return apiService.getProducts(apiParams);
      }
    },
    { 
      immediate: true,
      // Remove caching for debugging
      skipCache: true
    }
  );

  // Debug logs
  console.log('Products data:', productsData);
  console.log('Loading state:', loading);
  console.log('Search term:', searchTerm);
  console.log('Selected filters:', selectedFilters);

  // Use API data if available, with better fallback handling
  const allProducts = React.useMemo(() => {
    if (productsData?.rows && Array.isArray(productsData.rows)) {
      return productsData.rows;
    }
    
    // Fallback to demo data for testing
    console.log('Using fallback demo data');
    return [
      {
        id: 'demo-1',
        title: 'Demo Batmobile',
        subtitle: 'The Dark Knight Returns',
        images: ['/vdp hero (2).webp'],
        product_types: ['vehicle'],
        movies: ['Batman'],
        genres: ['Action', 'Superhero'],
        keywords: ['batmobile', 'batman', 'movie car'],
        sale_price: '250000',
        retail_price: '300000',
        created_at: new Date().toISOString(),
        slug: 'demo-batmobile',
      },
      {
        id: 'demo-2',
        title: 'DeLorean Time Machine',
        subtitle: 'Back to the Future',
        images: ['/vdp hero (2).webp'],
        product_types: ['vehicle'],
        movies: ['Back to the Future'],
        genres: ['Sci-Fi', 'Adventure'],
        keywords: ['delorean', 'time machine', 'movie car'],
        sale_price: '180000',
        retail_price: '220000',
        created_at: new Date().toISOString(),
        slug: 'demo-delorean',
      }
    ];
  }, [productsData]);

  // Error fallback: show maintenance message if API fails
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (productsData === undefined && !loading && searchTerm === '') {
      console.log('Setting error state - no data and not loading');
      setHasError(true);
    } else {
      setHasError(false);
    }
  }, [productsData, loading, searchTerm]);

  // Apply client-side filtering for additional refinement
  const filteredProducts = allProducts.filter(product => {
    const matchesSearch = !searchTerm || 
      product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.subtitle?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedFilters.productType === 'Any' || 
      (product.product_types && product.product_types.includes(selectedFilters.productType));
    
    const matchesMovie = selectedFilters.movie === 'Any' || 
      (product.movies && product.movies.includes(selectedFilters.movie));
    
    const matchesGenre = selectedFilters.genre === 'Any' || 
      (product.genres && product.genres.includes(selectedFilters.genre));

    return matchesSearch && matchesType && matchesMovie && matchesGenre;
  });

  // Apply sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'Featured':
        return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
      case 'Sale Price: Low to High':
        return (
          parseFloat(a.sale_price || a.retail_price || '0') -
          parseFloat(b.sale_price || b.retail_price || '0')
        );
      case 'Sale Price: High to Low':
        return (
          parseFloat(b.sale_price || a.retail_price || '0') -
          parseFloat(a.sale_price || a.retail_price || '0')
        );
      case 'Newest':
        return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
      case 'A-Z':
        return (a.title || '').localeCompare(b.title || '');
      case 'Z-A':
        return (b.title || '').localeCompare(a.title || '');
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = sortedProducts.slice(startIndex, endIndex);

  // Refetch when filters change - with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log('Refetching products due to filter change');
      refetchProducts();
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedFilters, sortBy]);

  // Debug render
  console.log('Rendering catalog page with:', {
    allProductsCount: allProducts.length,
    filteredProductsCount: filteredProducts.length,
    sortedProductsCount: sortedProducts.length,
    currentProductsCount: currentProducts.length,
    loading,
    hasError
  });

  const handleProductClick = (product: any) => {
    const type = product.product_types?.[0] || 'vehicle';
    navigate(`/catalog/${type}/${product.slug}`);
  };


  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title={`${productType ? `${productType.charAt(0).toUpperCase() + productType.slice(1)} ` : ''}Catalog - Reel Wheels Experience`}
        description={`Browse our ${productType ? productType + ' ' : ''}collection of authentic movie vehicles and memorabilia. Find the perfect piece for your event or collection.`}
        keywords={`movie ${productType || 'vehicles'}, film cars, movie memorabilia, ${productType || 'vehicle'} rental, Hollywood cars`}
        url={`https://reelwheelsexperience.com/catalog${productType ? `/${productType}` : ''}`}
      />
      
      <WebsiteHeader 
        onSearchClick={() => setShowSearchModal(true)}
        variant="dark"
        className="catalog-header"
      />

      <div className="catalog-page-header bg-gray-50 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
          <h1 className="text-5xl font-bebas text-gray-900 mb-4" style={{ fontSize: '48px' }}>The Collection</h1>
          <p className="text-gray-600 font-inter">View Our Collection of products</p>
        </div>
      </div>

      <div className="catalog-filters-search max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search Here"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full border border-gray-300 bg-white py-4 pl-12 pr-6 text-base focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200 font-inter transition-all shadow-sm"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white p-2 rounded-full hover:bg-gray-800 transition-colors">
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="hidden md:flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <select
                value={selectedFilters.productType}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, productType: e.target.value }))}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 min-w-[140px] font-inter shadow-sm"
              >
                <option value="Any">Any</option>
                <option value="vehicle">Vehicle</option>
                <option value="prop">Prop</option>
                <option value="costume">Costume</option>
              </select>
              <span className="absolute left-4 -top-2 bg-white px-1 text-xs text-gray-500 font-inter">Product Type</span>
              <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={selectedFilters.movie}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, movie: e.target.value }))}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 min-w-[140px] font-inter shadow-sm"
              >
                <option value="Any">Any</option>
                <option value="Batman">Batman</option>
                <option value="Back to the Future">Back to the Future</option>
                <option value="Ghostbusters">Ghostbusters</option>
                <option value="Knight Rider">Knight Rider</option>
                <option value="The Dukes of Hazzard">The Dukes of Hazzard</option>
              </select>
              <span className="absolute left-4 -top-2 bg-white px-1 text-xs text-gray-500 font-inter">Movie</span>
              <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={selectedFilters.genre}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, genre: e.target.value }))}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 min-w-[140px] font-inter shadow-sm"
              >
                <option value="Any">Any</option>
                <option value="Action">Action</option>
                <option value="Comedy">Comedy</option>
                <option value="Sci-Fi">Sci-Fi</option>
                <option value="Superhero">Superhero</option>
                <option value="Adventure">Adventure</option>
              </select>
              <span className="absolute left-4 -top-2 bg-white px-1 text-xs text-gray-500 font-inter">Genre</span>
              <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 font-inter">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 font-inter shadow-sm bg-white"
            >
              <option value="Featured">Featured</option>
              <option value="Sale Price: Low to High">Sale Price: Low to High</option>
              <option value="Sale Price: High to Low">Sale Price: High to Low</option>
              <option value="Retail Price: Low to High">Retail Price: Low to High</option>
              <option value="Retail Price: High to Low">Retail Price: High to Low</option>
              <option value="Rental Price Hourly: Low to High">Rental Price Hourly: Low to High</option>
              <option value="Rental Price Hourly: High to Low">Rental Price Hourly: High to Low</option>
              <option value="Rental Price Daily: Low to High">Rental Price Daily: Low to High</option>
              <option value="Rental Price Daily: High to Low">Rental Price Daily: High to Low</option>
              <option value="Rental Price Weekly: Low to High">Rental Price Weekly: Low to High</option>
              <option value="Rental Price Weekly: High to Low">Rental Price Weekly: High to Low</option>
              <option value="Rental Price Monthly: Low to High">Rental Price Monthly: Low to High</option>
              <option value="Rental Price Monthly: High to Low">Rental Price Monthly: High to Low</option>
              <option value="Rental Price Yearly: Low to High">Rental Price Yearly: Low to High</option>
              <option value="Rental Price Yearly: High to Low">Rental Price Yearly: High to Low</option>
              <option value="Newest">Newest</option>
              <option value="A-Z">A-Z</option>
              <option value="Z-A">Z-A</option>
            </select>
          </div>
        </div>

        <div className="md:hidden mb-8">
          <div className="flex items-center justify-between gap-4">
            <div className="text-lg font-medium text-gray-900">
              {sortedProducts.length} results
            </div>
            <div className="flex items-center gap-3">
              {/* Mobile Sort Dropdown */}
              <div className="relative">
                <button
                  className="flex items-center gap-2 bg-blue-400 text-white px-4 py-2 rounded-full font-medium text-sm"
                  onClick={() => {
                    const dropdown = document.getElementById('mobile-sort-dropdown');
                    if (dropdown) dropdown.classList.toggle('hidden');
                  }}
                  type="button"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                  SORT: <span className="ml-1">{sortBy}</span>
                </button>
                <div
                  id="mobile-sort-dropdown"
                  className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 hidden"
                >
                  <ul className="py-2">
                    {[
                      'Featured',
                      'Sale Price: Low to High',
                      'Sale Price: High to Low',
                      'Retail Price: Low to High',
                      'Retail Price: High to Low',
                      'Rental Price Hourly: Low to High',
                      'Rental Price Hourly: High to Low',
                      'Rental Price Daily: Low to High',
                      'Rental Price Daily: High to Low',
                      'Rental Price Weekly: Low to High',
                      'Rental Price Weekly: High to Low',
                      'Rental Price Monthly: Low to High',
                      'Rental Price Monthly: High to Low',
                      'Rental Price Yearly: Low to High',
                      'Rental Price Yearly: High to Low',
                      'Newest',
                      'A-Z',
                      'Z-A'
                    ].map(option => (
                      <li key={option}>
                        <button
                          type="button"
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 ${
                            sortBy === option ? 'font-bold text-blue-600' : 'text-gray-700'
                          }`}
                          onClick={() => {
                            setSortBy(option);
                            const dropdown = document.getElementById('mobile-sort-dropdown');
                            if (dropdown) dropdown.classList.add('hidden');
                          }}
                        >
                          {option}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {/* ...existing code for FILTERS button... */}
              <button 
                className="flex items-center gap-2 bg-blue-400 text-white px-4 py-2 rounded-full font-medium text-sm relative"
                onClick={() => {
                  const filtersSection = document.querySelector('.mobile-filters-dropdown');
                  if (filtersSection) {
                    filtersSection.classList.toggle('hidden');
                  }
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                FILTERS
                {(selectedFilters.productType !== 'Any' || selectedFilters.movie !== 'Any' || selectedFilters.genre !== 'Any') && (
                  <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    1
                  </span>
                )}
              </button>
            </div>
          </div>
          {/* ...existing code for mobile filters dropdown... */}
        </div>
        {/* ...existing code... */}
      </div>

      {/* Products Grid Section - Add this missing section */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-12">
        {/* Results count and view toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-600">
            {loading ? 'Loading...' : `${sortedProducts.length} products found`}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {hasError && !loading && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load products</h3>
            <p className="text-gray-600 mb-4">We're having trouble connecting to our catalog. Please try again.</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !hasError && (
          <>
            {currentProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 catalog-products-grid">
                {currentProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onProductClick={handleProductClick}
                    onFavoriteToggle={toggleFavorite}
                    isFavorite={isFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedFilters.productType !== 'Any' || selectedFilters.movie !== 'Any' || selectedFilters.genre !== 'Any'
                    ? 'Try adjusting your search criteria or filters.'
                    : 'No products are available at the moment.'}
                </p>
                {(searchTerm || selectedFilters.productType !== 'Any' || selectedFilters.movie !== 'Any' || selectedFilters.genre !== 'Any') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedFilters({ productType: 'Any', movie: 'Any', genre: 'Any' });
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && currentProducts.length > 0 && (
              <div className="mt-12 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  
                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 rounded-md transition-colors ${
                        page === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>

      <SearchModal 
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />

      <WebsiteFooter className="catalog-footer mt-12 md:mt-16" />
    </div>
  );
}