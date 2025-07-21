// Price formatting utilities with "Call for Price" support

export const formatPrice = (price: string | number | null | undefined): string => {
  // Handle null, undefined, or empty values
  if (price === null || price === undefined || price === '') {
    //return 'Call for Price';
    return '';
  }

  // Convert to number
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  // Handle NaN or 0 values
  if (isNaN(numPrice) || numPrice === 0) {
    return 'Call for Price';
  }

  // Format as currency
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numPrice);
};

export const shouldShowCallForPrice = (price: string | number | null | undefined): boolean => {
  if (price === null || price === undefined || price === '') {
    return true;
  }
  
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return isNaN(numPrice) || numPrice === 0;
};

export const hasValidPrice = (price: string | number | null | undefined): boolean => {
  if (price === null || price === undefined || price === '') {
    return false;
  }
  
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return !isNaN(numPrice) && numPrice > 0;
};

export const shouldShowSaleBadge = (
  retailPrice: string | number | null | undefined,
  salePrice: string | number | null | undefined
): boolean => {
  // Both prices must be valid and sale price must be lower than retail
  const hasValidRetail = hasValidPrice(retailPrice);
  const hasValidSale = hasValidPrice(salePrice);
  
  if (!hasValidRetail || !hasValidSale) {
    return false;
  }
  
  const retail = typeof retailPrice === 'string' ? parseFloat(retailPrice) : retailPrice!;
  const sale = typeof salePrice === 'string' ? parseFloat(salePrice) : salePrice!;
  
  return sale < retail && sale > 0;
};

export const formatPriceWithSale = (
  retailPrice: string | number | null | undefined,
  salePrice?: string | number | null | undefined
): { 
  displayPrice: string;
  originalPrice?: string;
  isOnSale: boolean;
  isCallForPrice: boolean;
  shouldUseSmallFont?: boolean;
} => {
  const isRetailCallForPrice = shouldShowCallForPrice(retailPrice);
  const isSaleCallForPrice = shouldShowCallForPrice(salePrice);
  
  // If we have a valid sale price that's lower than retail
  if (shouldShowSaleBadge(retailPrice, salePrice)) {
    return {
      displayPrice: formatPrice(salePrice),
      originalPrice: formatPrice(retailPrice),
      isOnSale: true,
      isCallForPrice: false,
      shouldUseSmallFont: false
    };
  }
  
  // If retail price is call for price
  if (isRetailCallForPrice) {
    return {
      displayPrice: false ? 'Call for Price' : '',
      isOnSale: false,
      isCallForPrice: true,
      shouldUseSmallFont: true
    };
  }
  
  // Regular retail price
  return {
    displayPrice: formatPrice(retailPrice),
    isOnSale: false,
    isCallForPrice: false,
    shouldUseSmallFont: false
  };
};