import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { apiService } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import OptimizedImage from '../UI/OptimizedImage';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Use API for search with minimal caching for real-time results
  const { data: searchResults, loading, execute: searchProducts } = useApi(
    () => searchTerm.trim() 
      ? apiService.searchProducts({ q: searchTerm, limit: 30 })
      : Promise.resolve({ rows: [], total: 0, offset: 0 }),
    { 
      immediate: false,
      keepPreviousData: false, // <-- ensure old data is cleared on new search
    }
  );

  // --- Enhanced local filtering for all fields ---
  const filteredResults = useMemo(() => {
    if (!searchResults?.rows) return [];
    const q = searchTerm.trim().toLowerCase();
    if (!q) return searchResults.rows;

    return searchResults.rows.filter((item: any) => {
      // Product fields
      const fields = [
        item.title,
        item.subtitle,
        ...(item.keywords || []),
        ...(item.movies || []),
        ...(item.product_types || []),
        ...(item.genres || []),
      ];
      return fields.some(field =>
        typeof field === 'string' && field.toLowerCase().includes(q)
      );
    });
  }, [searchResults, searchTerm]);

  useEffect(() => {
    if (searchTerm.trim()) {
      // Clear previous results immediately before loading new data
      // This will cause loading state to show without old data flicker
      searchResults && (searchResults.rows.length = 0);
      const timeoutId = setTimeout(() => {
        searchProducts().catch(() => {
          // Fallback handled by the API service
        });
      }, 200);
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm]);
  
  const handleProductClick = (product: any) => {
    const type = product.product_types?.[0] || 'vehicle';
    navigate(`/catalog/${type}/${product.slug}`);
    onClose();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(searchTerm)}`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="search-modal-overlay fixed inset-0 bg-black bg-opacity-75 z-50 flex items-start justify-center pt-20"
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-modal-title"
    >
      <div className="search-modal-content bg-black-900 rounded-lg shadow-2xl w-full max-w-2xl mx-4 border border-gray-700">
        <div className="search-modal-header p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 id="search-modal-title" className="text-lg font-semibold text-white font-inter">Search Products</h3>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded"
              aria-label="Close search modal"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search for vehicles, props, costumes, movies, genres, keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search products"
                className="w-full rounded-lg border border-gray-600 bg-gray-800 text-white py-3 pl-10 pr-4 text-sm focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 placeholder-gray-400 font-inter"
                autoFocus
              />
            </div>
          </form>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading && searchTerm.trim() ? (
            <div className="search-modal-results p-8 text-center bg-gray-900">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500 mx-auto mb-2" role="status" aria-label="Searching"></div>
              <p className="text-gray-400 font-inter">Searching...</p>
            </div>
          ) : !loading && filteredResults.length > 0 ? (
            <div className="search-modal-results p-4 space-y-3 bg-gray-900" role="list">
              {filteredResults.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="flex items-center space-x-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex-shrink-0">
                    <OptimizedImage
                      src={product.images?.[0] || '/vdp hero (2).webp'}
                      alt={product.title}
                      size="thumbnail"
                      className="w-16 h-12 object-cover rounded"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {product.title}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {product.subtitle}
                    </p>
                    {product.product_types?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.product_types.slice(0, 2).map((type, idx) => (
                          <span key={idx} className="px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded">
                            {type}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : !loading && searchTerm.trim() && filteredResults.length === 0 ? (
            <div className="search-modal-results p-8 text-center text-gray-400 bg-gray-900">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-600" aria-hidden="true" />
              <p className="font-inter">No products found for "{searchTerm}"</p>
            </div>
          ) : !loading && !searchTerm.trim() ? (
            <div className="search-modal-results p-8 text-center text-gray-400 bg-gray-900">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-600" aria-hidden="true" />
              <p className="font-inter">Start typing to search for products...</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}