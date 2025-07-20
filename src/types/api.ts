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

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type?: string;
}

export interface ErrorResponse {
  detail: string;
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail?: ValidationError[];
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface LoginRequest {
  grant_type?: string;
  username: string;
  password: string;
  scope?: string;
  client_id?: string;
  client_secret?: string;
}

// User types
export interface UserRead {
  email: string;
  role: string;
  id: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserCreate {
  email: string;
  role?: string;
  password: string;
}

export interface UserUpdate {
  email?: string;
  password?: string;
  role?: string;
}

// Product types
export type RentalPeriod = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface LinkedItem {
  id: string;
  title: string;
  subtitle?: string;
}

export interface ProductRead {
  title: string;
  subtitle?: string;
  description_title?: string;
  description?: string;
  product_types: string[];
  movies: string[];
  genres: string[];
  keywords: string[];
  available_rental_periods: RentalPeriod[];
  images: string[];
  background_image_url?: string;
  is_background_image_activated: boolean;
  background_image_url_tablet?: string;
  is_background_image_tablet_activated: boolean;
  background_image_url_mobile?: string;
  is_background_image_mobile_activated: boolean;
  is_trending_model: boolean;
  is_on_homepage_slider: boolean;
  sale_price?: string;
  retail_price?: string;
  rental_price_hourly?: string;
  rental_price_daily?: string;
  rental_price_weekly?: string;
  rental_price_monthly?: string;
  rental_price_yearly?: string;
  id: string;
  slug: string;
  created_at?: string;
  updated_at?: string;
  products: LinkedItem[];
}

export interface ProductDetail extends ProductRead {
  memorabilia: MemorabiliaRead[];
  merchandises: MerchandiseRead[];
}

export interface ProductCreate {
  title: string;
  subtitle?: string;
  description_title?: string;
  description?: string;
  product_types?: string[];
  movies?: string[];
  genres?: string[];
  keywords?: string[];
  available_rental_periods?: RentalPeriod[];
  images?: string[];
  background_image_url?: string;
  is_background_image_activated?: boolean;
  background_image_url_tablet?: string;
  is_background_image_tablet_activated?: boolean;
  background_image_url_mobile?: string;
  is_background_image_mobile_activated?: boolean;
  is_trending_model?: boolean;
  is_on_homepage_slider?: boolean;
  sale_price?: number | string;
  retail_price?: number | string;
  rental_price_hourly?: number | string;
  rental_price_daily?: number | string;
  rental_price_weekly?: number | string;
  rental_price_monthly?: number | string;
  rental_price_yearly?: number | string;
  slug?: string;
  memorabilia_ids?: string[];
  merchandise_ids?: string[];
  product_ids?: string[];
}

export interface ProductUpdate {
  title?: string;
  subtitle?: string;
  description_title?: string;
  description?: string;
  product_types?: string[];
  movies?: string[];
  genres?: string[];
  keywords?: string[];
  available_rental_periods?: RentalPeriod[];
  images?: string[];
  background_image_url?: string;
  is_background_image_activated?: boolean;
  background_image_url_tablet?: string;
  is_background_image_tablet_activated?: boolean;
  background_image_url_mobile?: string;
  is_background_image_mobile_activated?: boolean;
  is_trending_model?: boolean;
  is_on_homepage_slider?: boolean;
  sale_price?: number | string;
  retail_price?: number | string;
  rental_price_hourly?: number | string;
  rental_price_daily?: number | string;
  rental_price_weekly?: number | string;
  rental_price_monthly?: number | string;
  rental_price_yearly?: number | string;
  memorabilia_ids?: string[];
  merchandise_ids?: string[];
  product_ids?: string[];
  slug?: string;
}

// Memorabilia types
export interface MemorabiliaRead {
  title: string;
  subtitle?: string;
  description?: string;
  photos: string[];
  keywords: string[];
  id: string;
  slug: string;
  created_at?: string;
  updated_at?: string;
  products: LinkedItem[];
}

export interface MemorabiliaDetail extends MemorabiliaRead {
  products: ProductRead[];
}

export interface MemorabiliaCreate {
  title: string;
  subtitle?: string;
  description?: string;
  photos?: string[];
  keywords?: string[];
  slug?: string;
  product_ids?: string[];
}

export interface MemorabiliaUpdate {
  title?: string;
  subtitle?: string;
  description?: string;
  photos?: string[];
  keywords?: string[];
  product_ids?: string[];
  slug?: string;
}

// Merchandise types
export interface MerchandiseRead {
  title: string;
  subtitle?: string;
  description?: string;
  price: string;
  photos: string[];
  keywords: string[];
  id: string;
  slug: string;
  created_at?: string;
  updated_at?: string;
  products: LinkedItem[];
}

export interface MerchandiseDetail extends MerchandiseRead {
  products: ProductRead[];
}

export interface MerchandiseCreate {
  title: string;
  subtitle?: string;
  description?: string;
  price: number | string;
  photos?: string[];
  keywords?: string[];
  slug?: string;
  product_ids?: string[];
}

export interface MerchandiseUpdate {
  title?: string;
  subtitle?: string;
  description?: string;
  price?: number | string;
  photos?: string[];
  keywords?: string[];
  product_ids?: string[];
  slug?: string;
}

// File upload types
export interface FileRead {
  id: string;
  url: string;
}

// Lead types
export interface RentAProductAppendices {
  product_id: string;
  rental_period: string;
  start_date: string;
  duration: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  comments: string;
}

export interface RentAProductCreate {
  form_slug: 'rent_a_product';
  appendices: RentAProductAppendices;
}

export interface RentAProductRead {
  id: string;
  status: string;
  reports: Record<string, any>;
  form_slug: 'rent_a_product';
  appendices: RentAProductAppendices;
}

export interface ContactUsAppendices {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  comments: string;
}

export interface ContactUsCreate {
  form_slug: 'contact_us';
  appendices: ContactUsAppendices;
}

export interface ContactUsRead {
  id: string;
  status: string;
  reports: Record<string, any>;
  form_slug: 'contact_us';
  appendices: ContactUsAppendices;
}

export type LeadCreate = RentAProductCreate | ContactUsCreate;
export type LeadRead = RentAProductRead | ContactUsRead;

// List response types
export interface AvailableFilterValue {
  label: string;
  value: string;
  count: number;
}

export interface AvailableFilter {
  label: string;
  name: string;
  values?: AvailableFilterValue[];
}

export interface ListResponse<T> {
  limit?: number;
  offset: number;
  search?: string;
  sort?: string;
  total: number;
  rows: T[];
  available_filters?: AvailableFilter[];
}

export type ProductListResponse = ListResponse<ProductRead>;
export type MemorabiliaListResponse = ListResponse<MemorabiliaRead>;
export type MerchandiseListResponse = ListResponse<MerchandiseRead>;
export type UserListResponse = ListResponse<UserRead>;
export type LeadListResponse = ListResponse<LeadRead>;

// Query parameters
export interface ListQueryParams {
  limit?: number;
  offset?: number;
  q?: string;
  sort?: string;
}

export interface ProductQueryParams extends ListQueryParams {
  product_types?: string[];
  movies?: string[];
  genres?: string[];
  is_trending_model?: boolean[];
  is_on_homepage_slider?: boolean[];
}

export interface LeadQueryParams extends ListQueryParams {
  form_slug?: string;
  status?: string;
}