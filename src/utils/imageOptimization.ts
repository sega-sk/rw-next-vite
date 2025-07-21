// Image optimization utility with enhanced caching and CDN integration

export interface EncryptObjectParams {
  width?: number;
  url: string | string[];
  quality?: number;
  cache?: number;
}

/**
 * Encrypted object { width, src, height? } to URL-safe Base64 string
 * using AES-256-CTR.
 */
export async function encryptObject(object: EncryptObjectParams, keyStr: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(object));

  // Derive a 256-bit key from the secret key using SHA-256.
  const keyHash = await crypto.subtle.digest('SHA-256', encoder.encode(keyStr));

  // Import the key for AES-CTR usage.
  const cryptoKey = await crypto.subtle.importKey('raw', keyHash, { name: 'AES-CTR' }, false, ['encrypt', 'decrypt']);

  // Create a fixed 16-byte counter (IV) filled with zeros.
  const iv = new Uint8Array(16);

  // Encrypt the data.
  const encryptedBuffer = await crypto.subtle.encrypt({ name: 'AES-CTR', counter: iv, length: 64 }, cryptoKey, data);

  // Convert the encrypted ArrayBuffer to a binary string.
  const encryptedArray = new Uint8Array(encryptedBuffer);
  let binary = '';
  for (let i = 0; i < encryptedArray.byteLength; i++) {
    binary += String.fromCharCode(encryptedArray[i]);
  }

  // Convert binary string to Base64.
  const base64 = btoa(binary);
  // Convert to URL-safe Base64.
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

interface OptimizedImageOptions {
  src: string;
  width?: number;
  quality?: number;
  cache?: number;
}

// Cache for optimized images with timestamp for cache busting
const imageCache = new Map<string, { url: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const IMAGE_SIZES = {
  thumbnail: { width: 150, height: 150, quality: 80 },
  small: { width: 300, height: 300, quality: 85 },
  card: { width: 400, height: 300, quality: 85 },
  medium: { width: 600, height: 400, quality: 90 },
  large: { width: 800, height: 600, quality: 90 },
  main: { width: 1200, height: 800, quality: 95 },
  gallery: { width: 1600, height: 1200, quality: 95 },
} as const;

function getCacheKey(params: OptimizedImageOptions): string {
  return `${params.src}_${params.width}_${params.height || 'auto'}_${params.quality || 85}`;
}

function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_DURATION;
}

export default async function encryptedLoader({ src, width, quality = 80, cache = 1 }: OptimizedImageOptions): Promise<string> {
  const cacheKey = getCacheKey({ src, width, quality, cache });
  const cached = imageCache.get(cacheKey);
  
  // Return cached version if valid
  if (cached && isCacheValid(cached.timestamp)) {
    return cached.url;
  }

  try {
    // Skip optimization for local development images or already optimized images
    if (!src || src.startsWith('/') || src.includes('dealertower.app/image/') || src.includes('localhost') || src.includes('pexels.com')) {
      const result = src;
      imageCache.set(cacheKey, { url: result, timestamp: Date.now() });
      return result;
    }

    const params = { url: src, width, quality, cache };
    const key = import.meta.env.VITE_IMG_KEY || '5defa113-13f3-4287-bc0d-7d4b58e8b832-e1370585-f700-46d2-a780-4d27abc83f41';
    const encrypted = await encryptObject(params, key);
    const optimizedUrl = `https://dealertower.app/image/${encrypted}.avif`;
    imageCache.set(cacheKey, { url: optimizedUrl, timestamp: Date.now() });
    return optimizedUrl;
  } catch (error) {
    console.warn('Image optimization failed for', src, '- using original URL:', error);
    // Fallback to original URL
    const fallback = src;
    imageCache.set(cacheKey, { url: fallback, timestamp: Date.now() });
    return fallback;
  }
}

// Clear cache function for manual cache invalidation
export function clearImageCache(): void {
  imageCache.clear();
}

// Get cache size for debugging
export function getCacheInfo(): { size: number; keys: string[] } {
  return {
    size: imageCache.size,
    keys: Array.from(imageCache.keys())
  };
}

// Helper function to get optimized image URL with predefined sizes
export async function getOptimizedImageUrl(src: string, size: keyof typeof IMAGE_SIZES): Promise<string> {
  const options = IMAGE_SIZES[size];
  return encryptedLoader({ src, ...options });
}

// Batch optimize multiple images
export async function optimizeImages(images: string[], size: keyof typeof IMAGE_SIZES): Promise<string[]> {
  const promises = images.map(src => getOptimizedImageUrl(src, size));
  return Promise.all(promises);
}