// Optimized Image component with fallback support and loading states

import React, { useState, useEffect } from 'react';
import encryptedLoader, { IMAGE_SIZES } from '../../utils/imageOptimization';

interface OptimizedImageProps {
  src: string;
  alt: string;
  size?: keyof typeof IMAGE_SIZES;
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
  const [optimizedSrc, setOptimizedSrc] = useState<string>(src);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadOptimizedImage = async () => {
      try {
        if (!src) return;
        
        // Get the size configuration
        const sizeConfig = IMAGE_SIZES[size];
        
        // Use the encrypted loader for optimization
        const optimized = await encryptedLoader({ 
          src, 
          width: sizeConfig.width, 
          quality: sizeConfig.quality 
        });
        
        if (isMounted) {
          setOptimizedSrc(optimized);
        }
      } catch (error) {
        console.warn('Image optimization failed for', src, error);
        if (isMounted) {
          setOptimizedSrc(src); // Fallback to original
        }
      }
    };

    loadOptimizedImage();

    return () => {
      isMounted = false;
    };
  }, [src, size, retryCount]); // Add retryCount to dependencies

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
    
    // Retry logic with different fallbacks
    if (retryCount === 0 && optimizedSrc !== src) {
      // First retry: use original source
      setOptimizedSrc(src);
      setRetryCount(1);
    } else if (retryCount === 1) {
      // Second retry: use default fallback
      setOptimizedSrc('/vdp hero (2).webp');
      setRetryCount(2);
    }
    // After 2 retries, stop trying
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      <img
        src={optimizedSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${onClick ? 'cursor-pointer' : ''}`}
        onLoad={handleLoad}
        onError={handleError}
        onClick={onClick}
        loading={priority ? 'eager' : loading}
        decoding="async"
        key={`${optimizedSrc}-${retryCount}`} // Force re-render on retry
      />
      
      {hasError && retryCount >= 2 && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-500 text-sm">Image unavailable</span>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;