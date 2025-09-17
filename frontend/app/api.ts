// TaskForge_AI/frontend/app/api.ts

// This is a custom fetch utility to handle authentication headers
export async function authFetch(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('access_token');
    
    if (token) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  
    const res = await fetch(url, options);
  
    if (res.status === 401) {
      // If the token is invalid or expired, log the user out
      localStorage.removeItem('access_token');
      window.location.href = '/login';
      return; // Don't return the response to prevent further errors
    }
  
    return res;
  }