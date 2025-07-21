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
  }, [src, size]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
    // Try fallback image
    if (optimizedSrc !== src) {
      setOptimizedSrc(src);
    } else {
      setOptimizedSrc('/vdp hero (2).webp');
    }
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
      />
    </div>
  );
};

export default OptimizedImage;