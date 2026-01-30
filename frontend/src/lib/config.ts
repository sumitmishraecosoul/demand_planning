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
  
  // API URL with smart detection (prioritizes .env for production)
  apiUrl: (() => {
    // PRIORITY 1: Use .env if set (production/domain)
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }

    // PRIORITY 2: Auto-detect for development
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      
      // Domain detected (e.g., demandplanning.thrivebrands.ai)
      if (hostname.includes('.') && !hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
        return `${window.location.protocol}//${hostname}/api`;
      }
      
      // Network IP detected (192.168.x.x)
      if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return `http://${hostname}:5002/api`;
      }
    }
    
    // PRIORITY 3: Default localhost
    return 'http://localhost:5002/api';
  })(),
};

export default config;
