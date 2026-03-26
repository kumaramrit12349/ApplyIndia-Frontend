// src/config.ts
console.log("ENV-1:", import.meta.env.VITE_ENV);
console.log("API-1:", import.meta.env.VITE_API_BASE_URL);
export const CONFIG = {
    
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  ENV: import.meta.env.VITE_ENV,
};