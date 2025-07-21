import type {
  TokenResponse,
  ErrorResponse,
  RefreshRequest,
  LoginRequest,
  UserRead,
  UserCreate,
  UserUpdate,
  UserListResponse,
  ProductRead,
  ProductDetail,
  ProductCreate,
  ProductUpdate,
  ProductListResponse,
  ProductQueryParams,
  MemorabiliaRead,
  MemorabiliaDetail,
  MemorabiliaCreate,
  MemorabiliaUpdate,
  MemorabiliaListResponse,
  MerchandiseRead,
  MerchandiseDetail,
  MerchandiseCreate,
  MerchandiseUpdate,
  MerchandiseListResponse,
  FileRead,
  LeadCreate,
  LeadRead,
  LeadListResponse,
  LeadQueryParams,
  ListQueryParams,
} from '@/types/api';

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: any
  ) {
    super(`API Error ${status}: ${statusText}`);
    this.name = 'ApiError';
  }
}

export class ReelWheelApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(baseUrl: string = 'https://reel-wheel-api-x92jj.ondigitalocean.app') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  // Auth methods
  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: response.statusText };
      }
      throw new ApiError(response.status, response.statusText, errorData);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  private buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, String(item)));
        } else {
          searchParams.set(key, String(value));
        }
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<TokenResponse> {
    const formData = new URLSearchParams();
    Object.entries(credentials).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value);
      }
    });

    const response = await this.request<TokenResponse>('/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    this.setTokens(response.access_token, response.refresh_token);
    return response;
  }

  async refreshTokens(refreshRequest: RefreshRequest): Promise<TokenResponse> {
    const response = await this.request<TokenResponse>('/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify(refreshRequest),
    });

    this.setTokens(response.access_token, response.refresh_token);
    return response;
  }

  // User endpoints
  async listUsers(params: ListQueryParams = {}): Promise<UserListResponse> {
    const queryString = this.buildQueryString(params);
    return this.request<UserListResponse>(`/v1/users/${queryString}`);
  }

  async createUser(user: UserCreate): Promise<UserRead> {
    return this.request<UserRead>('/v1/users/', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  async getUser(userId: string): Promise<UserRead> {
    return this.request<UserRead>(`/v1/users/${userId}`);
  }

  async updateUser(userId: string, updates: UserUpdate): Promise<UserRead> {
    return this.request<UserRead>(`/v1/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteUser(userId: string): Promise<void> {
    await this.request<void>(`/v1/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Product endpoints
  async listProducts(params: ProductQueryParams = {}): Promise<ProductListResponse> {
    const queryString = this.buildQueryString(params);
    return this.request<ProductListResponse>(`/v1/products/${queryString}`);
  }

  async createProduct(product: ProductCreate): Promise<ProductRead> {
    return this.request<ProductRead>('/v1/products/', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async getProduct(idOrSlug: string): Promise<ProductDetail> {
    return this.request<ProductDetail>(`/v1/products/${idOrSlug}`);
  }

  async updateProduct(productId: string, updates: ProductUpdate): Promise<ProductRead> {
    return this.request<ProductRead>(`/v1/products/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteProduct(productId: string): Promise<void> {
    await this.request<void>(`/v1/products/${productId}`, {
      method: 'DELETE',
    });
  }

  async clearProductBackground(productId: string): Promise<ProductRead> {
    // Ensure we have authentication
    if (!this.accessToken) {
      throw new ApiError(401, 'Unauthorized', { detail: 'Authentication required' });
    }

    return this.request<ProductRead>(`/v1/products/${productId}/clear-background`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // Memorabilia endpoints
  async listMemorabilia(params: ListQueryParams = {}): Promise<MemorabiliaListResponse> {
    const queryString = this.buildQueryString(params);
    return this.request<MemorabiliaListResponse>(`/v1/memorabilia/${queryString}`);
  }

  async createMemorabilia(memorabilia: MemorabiliaCreate): Promise<MemorabiliaRead> {
    return this.request<MemorabiliaRead>('/v1/memorabilia/', {
      method: 'POST',
      body: JSON.stringify(memorabilia),
    });
  }

  async getMemorabilia(idOrSlug: string): Promise<MemorabiliaDetail> {
    return this.request<MemorabiliaDetail>(`/v1/memorabilia/${idOrSlug}`);
  }

  async updateMemorabilia(memorabiliaId: string, updates: MemorabiliaUpdate): Promise<MemorabiliaRead> {
    return this.request<MemorabiliaRead>(`/v1/memorabilia/${memorabiliaId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteMemorabilia(memorabiliaId: string): Promise<void> {
    await this.request<void>(`/v1/memorabilia/${memorabiliaId}`, {
      method: 'DELETE',
    });
  }

  // Merchandise endpoints
  async listMerchandise(params: ListQueryParams = {}): Promise<MerchandiseListResponse> {
    const queryString = this.buildQueryString(params);
    return this.request<MerchandiseListResponse>(`/v1/merchandises/${queryString}`);
  }

  async createMerchandise(merchandise: MerchandiseCreate): Promise<MerchandiseRead> {
    return this.request<MerchandiseRead>('/v1/merchandises/', {
      method: 'POST',
      body: JSON.stringify(merchandise),
    });
  }

  async getMerchandise(idOrSlug: string): Promise<MerchandiseDetail> {
    return this.request<MerchandiseDetail>(`/v1/merchandises/${idOrSlug}`);
  }

  async updateMerchandise(merchandiseId: string, updates: MerchandiseUpdate): Promise<MerchandiseRead> {
    return this.request<MerchandiseRead>(`/v1/merchandises/${merchandiseId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteMerchandise(merchandiseId: string): Promise<void> {
    await this.request<void>(`/v1/merchandises/${merchandiseId}`, {
      method: 'DELETE',
    });
  }

  // Upload endpoints
  async uploadFile(file: File): Promise<FileRead> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<FileRead>('/v1/uploads/', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });
  }

  async deleteFile(url: string): Promise<void> {
    const encodedUrl = encodeURIComponent(url);
    await this.request<void>(`/v1/uploads/?url=${encodedUrl}`, {
      method: 'DELETE',
    });
  }

  // Import endpoints
  async importProducts(url?: string): Promise<Record<string, number>> {
    const queryString = url ? `?url=${encodeURIComponent(url)}` : '';
    return this.request<Record<string, number>>(`/v1/imports/products${queryString}`, {
      method: 'POST',
    });
  }

  // Lead endpoints
  async submitLead(lead: LeadCreate): Promise<LeadRead> {
    // Always use the proxy endpoint for lead submissions to keep API key secure
    const response = await fetch('/api/submit-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lead),
    });

    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: response.statusText };
      }
      throw new ApiError(response.status, response.statusText, errorData);
    }

    return response.json();
  }

  async listLeads(params: LeadQueryParams = {}): Promise<LeadListResponse> {
    const queryString = this.buildQueryString(params);
    return this.request<LeadListResponse>(`/v1/leads/${queryString}`);
  }

  async getLead(leadId: string): Promise<LeadRead> {
    return this.request<LeadRead>(`/v1/leads/${leadId}`);
  }
}

// Export a default instance
export const apiClient = new ReelWheelApiClient();
