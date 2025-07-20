import { apiClient } from './api-client';

const ACCESS_TOKEN_KEY = 'reel_wheel_access_token';
const REFRESH_TOKEN_KEY = 'reel_wheel_refresh_token';

export class AuthManager {
  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  static setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    apiClient.setTokens(accessToken, refreshToken);
  }

  static clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    apiClient.clearTokens();
  }

  static async initializeTokens(): Promise<void> {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    if (accessToken && refreshToken) {
      apiClient.setTokens(accessToken, refreshToken);
    }
  }

  static async refreshTokensIfNeeded(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await apiClient.refreshTokens({ refresh_token: refreshToken });
      this.setTokens(response.access_token, response.refresh_token);
      return true;
    } catch (error) {
      this.clearTokens();
      return false;
    }
  }

  static isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

// Initialize tokens when the module loads
if (typeof window !== 'undefined') {
  AuthManager.initializeTokens();
}
