import { authService } from './auth';
import { invalidateProductCache, invalidateMemorabiliaCache, invalidateMerchandiseCache } from './cache';

interface ApiResponse<T> {
  data?: T;
  detail?: string;
  message?: string;
}

interface ListResponse<T> {
  limit?: number;
  offset: number;
  search?: string;
  sort?: string;
  total: number;
  rows: T[];
  available_filters?: AvailableFilter[];
  error?: string;
}

interface AvailableFilter {
  label: string;
  name: string;
  values: AvailableFilterValue[];
}

interface AvailableFilterValue {
  label: string;
  value: string;
  count: number;
}

export interface Product {
  id: string;
  title: string;
  subtitle?: string;
  description_title?: string; // Add description_title field
  description?: string;
  images: string[];
  product_types: string[];
  movies: string[];
  genres: string[];
  keywords: string[];
  available_rental_periods: RentalPeriod[];
  background_image_url?: string;
  is_background_image_activated?: boolean;
  is_trending_model?: boolean;
  is_on_homepage_slider?: boolean;
  sale_price?: string;
  retail_price?: string;
  rental_price_hourly?: string;
  rental_price_daily?: string;
  rental_price_weekly?: string;
  rental_price_monthly?: string;
  rental_price_yearly?: string;
  slug: string;
  created_at?: string;
  updated_at?: string;
  memorabilia_ids?: string[];
  merchandise_ids?: string[];
  product_ids?: string[];
  video_url?: string;
  // Related data
  memorabilia?: Memorabilia[];
  merchandise?: Merchandise[];
  products?: Product[];
}

export interface ProductCreate {
  title: string;
  subtitle?: string;
  description_title?: string; // Add description_title field
  description?: string;
  images: string[];
  product_types: string[];
  movies: string[];
  genres: string[];
  keywords: string[];
  available_rental_periods: RentalPeriod[];
  background_image_url?: string;
  is_background_image_activated?: boolean;
  is_trending_model?: boolean;
  is_on_homepage_slider?: boolean;
  sale_price?: number;
  retail_price?: number;
  rental_price_hourly?: number;
  rental_price_daily?: number;
  rental_price_weekly?: number;
  rental_price_monthly?: number;
  rental_price_yearly?: number;
  slug?: string;
  memorabilia_ids?: string[];
  merchandise_ids?: string[];
  product_ids?: string[];
  video_url?: string;
}

export interface ProductUpdate extends Partial<ProductCreate> {}

interface Memorabilia {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  photos: string[];
  keywords: string[];
  slug: string;
  created_at?: string;
  updated_at?: string;
  products?: Product[];
  product_ids?: string[];
}

interface MemorabiliaCreate {
  title: string;
  subtitle?: string;
  description?: string;
  photos?: string[];
  keywords?: string[];
  product_ids?: string[];
  slug?: string;
}

interface MemorabiliaUpdate extends Partial<MemorabiliaCreate> {}

interface Merchandise {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  price: number;
  sale_price?: number;
  retail_price?: number;
  photos: string[];
  keywords: string[];
  slug: string;
  created_at?: string;
  updated_at?: string;
  products?: Product[];
  product_ids?: string[];
  fabric_measurements?: string;
  size_options?: string[];
}

interface MerchandiseCreate {
  title: string;
  subtitle?: string;
  description?: string;
  price: number;
  sale_price?: number;
  retail_price?: number;
  photos?: string[];
  keywords?: string[];
  product_ids?: string[];
  slug?: string;
  fabric_measurements?: string;
  size_options?: string[];
}

interface MerchandiseUpdate extends Partial<MerchandiseCreate> {}

interface LinkedItem {
  id: string;
  title: string;
  subtitle?: string;
}

interface FileUpload {
  id: string;
  url: string;
}

interface User {
  id: string;
  email: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

interface UserCreate {
  email: string;
  password: string;
  role?: string;
}

interface UserUpdate extends Partial<UserCreate> {}

type RentalPeriod = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';

class ApiService {
  private readonly API_BASE_URL = 'https://reel-wheel-api-x92jj.ondigitalocean.app';

  private async makeAuthenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T | ListResponse<any>> {
    const url = `${this.API_BASE_URL}${endpoint}`;
    
    try {
      let response = await fetch(url, {
        ...options,
        headers: {
          ...authService.getAuthHeaders(),
          // Remove any hardcoded X-API-Key from here
          ...options.headers,
        },
      });

      // If access token is expired, try to refresh
      if (response.status === 401 && authService.isAuthenticated()) {
        try {
          await authService.refreshAccessToken();
          // Retry the request with new token
          response = await fetch(url, {
            ...options,
            headers: {
              ...authService.getAuthHeaders(),
              ...options.headers,
            },
          });
        } catch (refreshError) {
          authService.logout();
          throw new Error('Session expired. Please login again.');
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      console.warn(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Products API
  async getProducts(params: {
    limit?: number;
    offset?: number;
    q?: string;
    sort?: string;
    product_types?: string[];
    movies?: string[];
    genres?: string[];
    is_trending_model?: boolean;
    is_on_homepage_slider?: boolean;
  } = {}): Promise<ListResponse<Product>> {
    const searchParams = new URLSearchParams();
    
    // Add basic parameters
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());
    if (params.q) searchParams.append('q', params.q);
    if (params.sort) searchParams.append('sort', params.sort);
    if (params.is_trending_model !== undefined) {
      searchParams.append('is_trending_model', params.is_trending_model.toString());
    }
    if (params.is_on_homepage_slider !== undefined) {
      searchParams.append('is_on_homepage_slider', params.is_on_homepage_slider.toString());
    }
    
    // Add array parameters
    if (params.product_types?.length) {
      params.product_types.forEach(type => searchParams.append('product_types', type));
    }
    if (params.movies?.length) {
      params.movies.forEach(movie => searchParams.append('movies', movie));
    }
    if (params.genres?.length) {
      params.genres.forEach(genre => searchParams.append('genres', genre));
    }

    console.log('API request URL:', `/v1/products/?${searchParams.toString()}`); // Debug log

    try {
      const result = await this.makePublicRequest(`/v1/products/?${searchParams.toString()}`) as Promise<ListResponse<Product>>;
      console.log('API response:', result); // Debug log
      return result;
    } catch (error) {
      console.error('API request failed:', error);
      // Return empty result instead of throwing
      return { 
        rows: [], 
        total: 0, 
        offset: 0, 
        error: error instanceof Error ? error.message : 'API request failed' 
      } as ListResponse<Product>;
    }
  }

  // Get single product by slug
  async getProduct(slug: string): Promise<Product> {
    console.log('Fetching product:', slug); // Debug log
    try {
      const result = await this.makePublicRequest(`/v1/products/${slug}`) as Promise<Product>;
      console.log('Product response:', result); // Debug log
      return result;
    } catch (error) {
      console.error('Get product failed:', error);
      throw error;
    }
  }

  // Dedicated search endpoint for better performance
  async searchProducts(params: {
    q: string;
    limit?: number;
    product_types?: string[];
    movies?: string[];
    genres?: string[];
  } = { q: '' }): Promise<ListResponse<Product>> {
    const searchParams = new URLSearchParams();
    
    // Only include search term and essential filters
    if (params.q.trim()) {
      searchParams.append('q', params.q.trim());
    }
    if (params.limit) {
      searchParams.append('limit', params.limit.toString());
    }
    if (params.product_types?.length) {
      params.product_types.forEach(type => searchParams.append('product_types', type));
    }
    if (params.movies?.length) {
      params.movies.forEach(movie => searchParams.append('movies', movie));
    }
    if (params.genres?.length) {
      params.genres.forEach(genre => searchParams.append('genres', genre));
    }

    console.log('Search API request URL:', `/v1/products/?${searchParams.toString()}`); // Debug log

    try {
      const result = await this.makePublicRequest(`/v1/products/?${searchParams.toString()}`) as Promise<ListResponse<Product>>;
      console.log('Search API response:', result); // Debug log
      return result;
    } catch (error) {
      console.warn('Search failed:', error);
      return { 
        rows: [], 
        total: 0, 
        offset: 0, 
        error: error instanceof Error ? error.message : 'Search failed' 
      } as ListResponse<Product>;
    }
  }

  async createProduct(data: ProductCreate): Promise<Product> {
    try {
      const result = await this.makeAuthenticatedRequest('/v1/products/', {
        method: 'POST',
        body: JSON.stringify(data),
      }) as Product;
      
      // Invalidate product cache after creation
      invalidateProductCache();
      
      return result;
    } catch (error) {
      console.error('Failed to create product:', error);
      throw error;
    }
  }

  async updateProduct(id: string, data: ProductUpdate): Promise<Product> {
    try {
      const result = await this.makeAuthenticatedRequest(`/v1/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }) as Product;
      
      // Invalidate product cache after update
      invalidateProductCache();
      
      return result;
    } catch (error) {
      console.error('Failed to update product:', error);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    await this.makeAuthenticatedRequest(`/v1/products/${id}`, {
      method: 'DELETE',
    });
    
    // Invalidate product cache after deletion
    invalidateProductCache();
  }

  // Memorabilia API
  async getMemorabilia(params: {
    limit?: number;
    offset?: number;
    q?: string;
    id?: string;
  } = {}): Promise<ListResponse<Memorabilia>> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    // If fetching a single item by ID, use the specific endpoint
    if (params.id) {
      try {
        const singleItem = await this.makeAuthenticatedRequest(`/v1/memorabilia/${params.id}`) as Promise<Memorabilia>;
        return { rows: [singleItem], total: 1, offset: 0 } as ListResponse<Memorabilia>;
      } catch (error) {
        console.warn('Failed to fetch single memorabilia item:', error);
        return { rows: [], total: 0, offset: 0 } as ListResponse<Memorabilia>;
      }
    }

    return this.makeAuthenticatedRequest(`/v1/memorabilia/?${searchParams.toString()}`) as Promise<ListResponse<Memorabilia>>;
  }

  async createMemorabilia(data: MemorabiliaCreate): Promise<Memorabilia> {
    const result = await this.makeAuthenticatedRequest('/v1/memorabilia/', {
      method: 'POST',
      body: JSON.stringify(data),
    }) as Memorabilia;
    
    // Invalidate memorabilia cache after creation
    invalidateMemorabiliaCache();
    
    return result;
  }

  async updateMemorabilia(id: string, data: MemorabiliaUpdate): Promise<Memorabilia> {
    const result = await this.makeAuthenticatedRequest(`/v1/memorabilia/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }) as Memorabilia;
    
    // Invalidate memorabilia cache after update
    invalidateMemorabiliaCache();
    
    return result;
  }

  async deleteMemorabilia(id: string): Promise<void> {
    await this.makeAuthenticatedRequest(`/v1/memorabilia/${id}`, {
      method: 'DELETE',
    });
    
    // Invalidate memorabilia cache after deletion
    invalidateMemorabiliaCache();
  }

  // Merchandise API
  async getMerchandise(params: {
    limit?: number;
    offset?: number;
    q?: string;
    id?: string;
  } = {}): Promise<ListResponse<Merchandise>> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    // If fetching a single item by ID, use the specific endpoint
    if (params.id) {
      try {
        const singleItem = await this.makeAuthenticatedRequest(`/v1/merchandises/${params.id}`) as Promise<Merchandise>;
        return { rows: [singleItem], total: 1, offset: 0 } as ListResponse<Merchandise>;
      } catch (error) {
        console.warn('Failed to fetch single merchandise item:', error);
        return { rows: [], total: 0, offset: 0 } as ListResponse<Merchandise>;
      }
    }

    return this.makeAuthenticatedRequest(`/v1/merchandises/?${searchParams.toString()}`) as Promise<ListResponse<Merchandise>>;
  }

  async createMerchandise(data: MerchandiseCreate): Promise<Merchandise> {
    // FIX: endpoint should be /v1/merchandises/
    const result = await this.makeAuthenticatedRequest('/v1/merchandises/', {
      method: 'POST',
      body: JSON.stringify(data),
    }) as Merchandise;
    return result;
  }

  async updateMerchandise(id: string, data: MerchandiseUpdate): Promise<Merchandise> {
    // FIX: endpoint should be /v1/merchandises/
    const result = await this.makeAuthenticatedRequest(`/v1/merchandises/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }) as Merchandise;
    return result;
  }

  async deleteMerchandise(id: string): Promise<void> {
    // FIX: endpoint should be /v1/merchandises/
    await this.makeAuthenticatedRequest(`/v1/merchandises/${id}`, {
      method: 'DELETE',
    });
  }

  // File Upload API
  async uploadFile(file: File): Promise<FileUpload> {
    const formData = new FormData();
    formData.append('file', file);

    const token = authService.getAccessToken();
    if (!token) {
      throw new Error('Authentication required for file upload');
    }
    
    const response = await fetch(`${this.API_BASE_URL}/v1/uploads/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        authService.logout();
        throw new Error('Authentication expired. Please login again.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Upload failed');
    }

    return response.json();
  }

  async deleteFile(url: string): Promise<void> {
    if (!authService.isAuthenticated()) {
      throw new Error('Authentication required');
    }
    
    const searchParams = new URLSearchParams({ url });
    await this.makeAuthenticatedRequest(`/v1/uploads/?${searchParams.toString()}`, {
      method: 'DELETE',
    });
  }

  async importProducts(csvUrl: string): Promise<any> {
    const searchParams = new URLSearchParams({ url: csvUrl });
    const result = await this.makeAuthenticatedRequest(`/v1/imports/products?${searchParams.toString()}`, {
      method: 'POST',
    });
    
    // Invalidate product cache after import
    invalidateProductCache();
    
    return result;
  }
}

export const apiService = new ApiService();
export type {
  Product,
  ProductCreate,
  ProductUpdate,
  Memorabilia,
  MemorabiliaCreate,
  MemorabiliaUpdate,
  Merchandise,
  MerchandiseCreate,
  MerchandiseUpdate,
  User,
  UserCreate,
  UserUpdate,
  ListResponse,
  FileUpload,
  RentalPeriod,
};