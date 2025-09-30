import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle token refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refreshToken
                    });

                    const { token } = response.data.data;
                    localStorage.setItem('token', token);

                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return apiClient(originalRequest);
                } catch (refreshError) {
                    // Refresh failed, redirect to login
                    authService.clearAuthData();
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }
        }

        return Promise.reject(error);
    }
);

const authService = {
    // Register user
    register: async (userData) => {
        try {
            const response = await apiClient.post('/auth/register', userData);

            if (response.data.success) {
                const { token, user } = response.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                return { success: true, user, token, message: response.data.message };
            }

            return { success: false, error: response.data.message };
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Registration failed'
            };
        }
    },

    // Login user
    login: async (credentials) => {
        try {
            const response = await apiClient.post('/auth/login', credentials);

            if (response.data.success) {
                const { token, user } = response.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                return { success: true, user, token, message: response.data.message };
            }

            return { success: false, error: response.data.message };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Login failed'
            };
        }
    },

    // Logout user
    logout: async () => {
        try {
            await apiClient.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            authService.clearAuthData();
        }
    },

    // Get current user profile
    getProfile: async () => {
        try {
            const response = await apiClient.get('/auth/me');

            if (response.data.success) {
                const user = response.data.data;
                localStorage.setItem('user', JSON.stringify(user));
                return { success: true, data: user };
            }

            return { success: false, error: response.data.message };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to get profile'
            };
        }
    },

    // Update user profile
    updateProfile: async (profileData) => {
        try {
            const response = await apiClient.put('/auth/profile', profileData);

            if (response.data.success) {
                const user = response.data.data;
                localStorage.setItem('user', JSON.stringify(user));
                return { success: true, data: user };
            }

            return { success: false, error: response.data.message };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to update profile'
            };
        }
    },

    // Change password
    changePassword: async (passwordData) => {
        try {
            const response = await apiClient.put('/auth/change-password', passwordData);

            if (response.data.success) {
                return { success: true, message: response.data.message };
            }

            return { success: false, error: response.data.message };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to change password'
            };
        }
    },

    // Forgot password
    forgotPassword: async (email) => {
        try {
            const response = await apiClient.post('/auth/forgot-password', { email });

            if (response.data.success) {
                return { success: true, message: response.data.message };
            }

            return { success: false, error: response.data.message };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to send reset email'
            };
        }
    },

    // Reset password
    resetPassword: async (token, newPassword) => {
        try {
            const response = await apiClient.post(`/auth/reset-password/${token}`, {
                password: newPassword
            });

            if (response.data.success) {
                return { success: true, message: response.data.message };
            }

            return { success: false, error: response.data.message };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to reset password'
            };
        }
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        return !!(token && user);
    },

    // Get current user from localStorage
    getCurrentUser: () => {
        try {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    },

    // Get auth token
    getToken: () => {
        return localStorage.getItem('token');
    },

    // Clear auth data
    clearAuthData: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    }
};

export default authService;
