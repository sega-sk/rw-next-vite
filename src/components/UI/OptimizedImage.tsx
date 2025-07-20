// Optimized Image component with fallback support and loading states

import React, { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  size?: 'thumbnail' | 'small' | 'medium' | 'large' | 'main' | 'card' | 'gallery';
  className?: string;
  onClick?: () => void;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src, 
  alt, 
  size = 'medium', 
  className = '', 
  onClick,
  priority = false,
  loading = 'lazy'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Size mappings for responsive images
  const sizeConfigs = {
    thumbnail: { width: 80, height: 80, quality: 75 },
    small: { width: 200, height: 200, quality: 80 },
    medium: { width: 400, height: 300, quality: 85 },
    card: { width: 600, height: 400, quality: 85 },
    large: { width: 800, height: 600, quality: 90 },
    main: { width: 1200, height: 800, quality: 95 },
    gallery: { width: 1600, height: 1200, quality: 95 }
  };

  const config = sizeConfigs[size];

  // Generate optimized image URL
  const getOptimizedUrl = (originalSrc: string): string => {
    // If it's already an external optimized URL, use as-is
    if (originalSrc.includes('images.pexels.com') || originalSrc.includes('cdn.') || originalSrc.includes('cloudinary.com')) {
      if (originalSrc.includes('pexels.com')) {
        return `${originalSrc}?auto=compress&cs=tinysrgb&w=${config.width}&h=${config.height}&dpr=2`;
      }
      return originalSrc;
    }

    // For local images, return as-is (they're already optimized)
    return originalSrc;
  };

  const optimizedSrc = getOptimizedUrl(src);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  // Fallback image
  const fallbackSrc = '/vdp hero (2).webp';

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      <img
        src={hasError ? fallbackSrc : optimizedSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${onClick ? 'cursor-pointer' : ''}`}
        onLoad={handleLoad}
        onError={handleError}
        onClick={onClick}
        loading={priority ? 'eager' : loading}
        decoding="async"
      />
    </div>
  );
};

export default OptimizedImage;