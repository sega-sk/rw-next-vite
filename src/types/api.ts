export interface Product {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  product_types?: string[];
  movies?: string[];
  genres?: string[];
  keywords?: string[];
  available_rental_periods?: string[];
  images?: string[];
  background_image_url?: string | null;
  is_background_image_activated?: boolean;
  background_image_url_tablet?: string | null;
  is_background_image_tablet_activated?: boolean;
  background_image_url_mobile?: string | null;
  is_background_image_mobile_activated?: boolean;
  is_trending_model?: boolean;
  is_on_homepage_slider?: boolean;
  sale_price?: string | number | null;
  retail_price?: string | number | null;
  rental_price_hourly?: string | number | null;
  rental_price_daily?: string | number | null;
  rental_price_weekly?: string | number | null;
  rental_price_monthly?: string | number | null;
  rental_price_yearly?: string | number | null;
  slug: string;
  memorabilia_ids?: string[];
  merchandise_ids?: string[];
  product_ids?: string[];
  created_at?: string | null;
  updated_at?: string | null;
  // Relations
  products?: LinkedItem[];
  memorabilia?: Memorabilia[];
  merchandises?: Merchandise[];
  // Legacy/compat fields
  price?: number;
  salePrice?: number;
  category?: string;
  status?: 'active' | 'inactive' | 'pending';
}

export interface Memorabilia {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  photos?: string[];
  keywords?: string[];
  slug: string;
  created_at?: string | null;
  updated_at?: string | null;
  products?: LinkedItem[];
  product_ids?: string[];
  // Legacy/compat fields
  connectionTags?: string[];
  searchKeywords?: string[];
  images?: string[];
}

export interface Merchandise {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  price: string | number;
  photos?: string[];
  keywords?: string[];
  slug: string;
  created_at?: string | null;
  updated_at?: string | null;
  products?: LinkedItem[];
  product_ids?: string[];
  // Legacy/compat fields
  salePrice?: number;
  connectionTags?: string[];
  searchKeywords?: string[];
  fabricMeasurements?: string;
  sizeOptions?: string[];
  images?: string[];
}

export interface LinkedItem {
  id: string;
  title: string;
  subtitle?: string | null;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}