// Environment configuration
export const config = {
  // Check if we're in development mode
  isDevelopment: () => {
    // Server-side check
    if (typeof window === 'undefined') {
      return process.env.NODE_ENV === 'development';
    }
    
    // Client-side check - also check hostname for extra safety
    const isDev = process.env.NODE_ENV === 'development';
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1';
    
    return isDev || isLocalhost;
  },
  
  // API URL
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api',
};

export default config;
