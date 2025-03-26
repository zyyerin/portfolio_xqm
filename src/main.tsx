import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// For handling SPA routing on GitHub Pages
const processGitHubPagesUrl = () => {
  const query = window.location.search;
  const urlParams = new URLSearchParams(query);
  const pathname = urlParams.get('p');
  
  if (pathname) {
    // Remove p parameter from URL
    urlParams.delete('p');
    
    const newSearch = urlParams.toString();
    const newUrl = 
      window.location.pathname + 
      (newSearch ? `?${newSearch}` : '') + 
      window.location.hash;
    
    // Update URL using replaceState
    window.history.replaceState(null, '', newUrl);
  }
};

// Process GitHub Pages routing on page load
processGitHubPagesUrl();

// Log environment variables - for debugging
console.log('BASE_URL:', import.meta.env.BASE_URL);
console.log('VITE_BASE_URL:', import.meta.env.VITE_BASE_URL);
console.log('NODE_ENV:', import.meta.env.MODE);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
