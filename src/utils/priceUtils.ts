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

export const formatPriceWithSale = (
  retailPrice: string | number | null | undefined,
  salePrice?: string | number | null | undefined
): { 
  displayPrice: string;
  originalPrice?: string;
  isOnSale: boolean;
  isCallForPrice: boolean;
} => {
  const hasRetailPrice = retailPrice && !isNaN(parseFloat(retailPrice.toString()));
  const hasSalePrice = salePrice && !isNaN(parseFloat(salePrice.toString()));
  
  if (!hasRetailPrice && !hasSalePrice) {
    return {
      displayPrice: 'Call for Price',
      isOnSale: false,
      isCallForPrice: true
    };
  }
  
  if (hasSalePrice && hasRetailPrice) {
    const saleNum = parseFloat(salePrice.toString());
    const retailNum = parseFloat(retailPrice.toString());
    
    if (saleNum < retailNum) {
      return {
        displayPrice: formatPrice(salePrice),
        originalPrice: formatPrice(retailPrice),
        isOnSale: true,
        isCallForPrice: false
      };
    }
  }
  
  const priceToUse = hasSalePrice ? salePrice : retailPrice;
  return {
    displayPrice: formatPrice(priceToUse),
    isOnSale: false,
    isCallForPrice: shouldShowCallForPrice(priceToUse)
  };
};

export const shouldShowSaleBadge = (retailPrice: string | number | null | undefined, salePrice?: string | number | null | undefined): boolean => {
  if (!retailPrice || !salePrice) return false;
  
  const retailNum = parseFloat(retailPrice.toString());
  const saleNum = parseFloat(salePrice.toString());
  
  return !isNaN(retailNum) && !isNaN(saleNum) && saleNum < retailNum;
};