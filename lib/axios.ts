import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'react-toastify';

// Cache configuration
const CACHE_DURATION = 1 * 60 * 1000; // 5 minutes in milliseconds
const cache = new Map<string, { data: any ; timestamp: number }>();

export const API_URL = process.env.NEXT_PUBLIC_API_URL! 


// Retry configuration
const MAX_RETRIES = {
    auth: 3, // For authentication requests
    default: 2, // For other requests
};

const RETRY_DELAY = 1000; 

// Create axios instance with default config
export const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
});

// Request interceptor for adding auth token
axiosInstance.interceptors.request.use(
      //@ts-expect-error error
    (config: AxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${token}`,
            };
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling retries and caching
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        // Cache successful GET requests
        if (response.config.method?.toLowerCase() === 'get') {
            const cacheKey = `${response.config.url}${JSON.stringify(response.config.params || {})}`;
            cache.set(cacheKey, {
                data: response.data,
                timestamp: Date.now(),
            });
        }
        return response;
    },
    async (error: AxiosError) => {
        const config = error.config as AxiosRequestConfig & { _retryCount?: number };

        // Initialize retry count if not set
        config._retryCount = config._retryCount || 0;

        // Determine max retries based on endpoint
        const isAuthEndpoint = config.url?.includes('/member/login') ||
            config.url?.includes('/member/two-factor') ||
            config.url?.includes('/member/reset-password');
        const maxRetries = isAuthEndpoint ? MAX_RETRIES.auth : MAX_RETRIES.default;

        // Check if we should retry (don't retry on 401, 403, 404, etc.)
        if (
            (error.response?.status === 408 || // Request timeout
                error.response?.status === 429 || // Too many requests
                error.response?.status === 500 || // Server error
                error.response?.status === 502 || // Bad gateway
                error.response?.status === 503 || // Service unavailable
                error.response?.status === 504 || // Gateway timeout
                !error.response) && // Network error
            config._retryCount < maxRetries
        ) {
            config._retryCount += 1;

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * config._retryCount!));

            // Retry the request
            return axiosInstance(config);
        }

        // Handle specific error cases
        if (error.response?.status === 401) {
            // Don't redirect on login endpoints
            const isLoginEndpoint = config.url?.includes('/member/login') ||
                config.url?.includes('/member/two-factor') ||
                config.url?.includes('/member/reset-password');
            
            if (!isLoginEndpoint) {
                localStorage.removeItem('ffa-admin');
                window.location.href = '/login';
                toast.error('Session expired. Please login again.');
            }

        } else if (error.response?.status === 403) {
            toast.error('You do not have permission to perform this action.');
        } else if (!error.response) {
            toast.error('Network error. Please check your connection.');
        }

        return Promise.reject(error);
    }
);

// Helper function to get cached data or fetch new data
export const fetchWithCache = async <T>(
    url: string,
    config?: AxiosRequestConfig
): Promise<T> => {
    const cacheKey = `${url}${JSON.stringify(config?.params || {})}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
        return cachedData.data as T;
    }

    const response = await axiosInstance.get<T>(url, config);
    return response.data;
};

// Helper function for retry logic
export const fetchWithRetry = async <T>(
    requestFn: () => Promise<AxiosResponse<T>>
): Promise<AxiosResponse<T>> => {
    try {
        return await requestFn();
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // Don't retry on authentication errors (401, 403) or client errors (4xx)
            if (error.response?.status && error.response.status >= 400 && error.response.status < 500) {
                throw error;
            }
            
            const config = error.config as AxiosRequestConfig & { _retryCount?: number };
            config._retryCount = config._retryCount || 0;

            const isAuthEndpoint = config.url?.includes('/member/login') ||
                config.url?.includes('/member/two-factor') ||
                config.url?.includes('/member/reset-password');
            const maxRetries = isAuthEndpoint ? MAX_RETRIES.auth : MAX_RETRIES.default;

            if (config._retryCount < maxRetries) {
                config._retryCount += 1;
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * config._retryCount!));
                return fetchWithRetry(requestFn);
            }
        }
        throw error;
    }
};

export default axiosInstance; 