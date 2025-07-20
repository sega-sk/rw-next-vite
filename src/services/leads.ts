import { authService } from './auth';

interface LeadAppendices {
  product_id?: string;
  rental_period?: string;
  start_date?: string;
  duration?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  comments?: string;
}

interface Lead {
  id: string;
  status: string;
  reports: Record<string, any>;
  form_slug: 'rent_a_product' | 'contact_us';
  appendices: LeadAppendices;
  created_at?: string;
  updated_at?: string;
}

interface LeadCreate {
  form_slug: 'rent_a_product' | 'contact_us';
  appendices: LeadAppendices;
}

interface LeadsListResponse {
  limit: number;
  offset: number;
  search?: string;
  sort?: string;
  total: number;
  rows: Lead[];
  available_filters?: Array<{
    label: string;
    name: string;
    values: Array<{
      label: string;
      value: string;
      count: number;
    }>;
  }>;
}

class LeadsService {
  private readonly API_BASE_URL = 'https://reel-wheel-api-x92jj.ondigitalocean.app';
  private readonly API_KEY = 'ff8c5b7d42cd8988d73b10098a50b0e6c94afb83c4dc1e4d30a6f5b88b2b4f47';

  // Submit a new lead directly to API (public endpoint with API key)
  async submitLead(data: LeadCreate): Promise<Lead> {
    try {
      console.log('Submitting lead data:', data);
      
      const response = await fetch(`${this.API_BASE_URL}/v1/leads/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this.API_KEY,
          // Add additional security headers
          'Accept': 'application/json',
          'User-Agent': 'ReelWheels-Web/1.0',
        },
        body: JSON.stringify(data),
      });

      console.log('API Response Status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Network error' }));
        console.error('API Error Response:', errorData);
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Lead submitted successfully:', result.id);
      return result;
    } catch (error) {
      console.error('Failed to submit lead:', error);
      
      // Provide user-friendly error messages
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network connection failed. Please check your internet connection and try again.');
      }
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('An unexpected error occurred. Please try again later.');
    }
  }

  private async makeAuthenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.API_BASE_URL}${endpoint}`;
    
    try {
      let response = await fetch(url, {
        ...options,
        headers: {
          ...authService.getAuthHeaders(),
          'Accept': 'application/json',
          'User-Agent': 'ReelWheels-Admin/1.0',
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
              'Accept': 'application/json',
              'User-Agent': 'ReelWheels-Admin/1.0',
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
      console.warn(`Leads API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Get all leads (Admin only)
  async getLeads(params: {
    limit?: number;
    offset?: number;
    search?: string;
    sort?: string;
  } = {}): Promise<LeadsListResponse> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    return this.makeAuthenticatedRequest(`/v1/leads/?${searchParams.toString()}`);
  }

  // Get a specific lead (Admin only)
  async getLead(leadId: string): Promise<Lead> {
    return this.makeAuthenticatedRequest(`/v1/leads/${leadId}`);
  }

  // Update lead status (Admin only)
  async updateLeadStatus(leadId: string, status: string): Promise<Lead> {
    return this.makeAuthenticatedRequest(`/v1/leads/${leadId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }
}

export const leadsService = new LeadsService();
export type { Lead, LeadCreate, LeadAppendices, LeadsListResponse };