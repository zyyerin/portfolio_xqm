import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// 用于处理GitHub Pages上的SPA路由
const processGitHubPagesUrl = () => {
  const query = window.location.search;
  const urlParams = new URLSearchParams(query);
  const pathname = urlParams.get('p');
  
  if (pathname) {
    // 从URL参数中移除p参数
    urlParams.delete('p');
    
    const newSearch = urlParams.toString();
    const newUrl = 
      window.location.pathname + 
      (newSearch ? `?${newSearch}` : '') + 
      window.location.hash;
    
    // 使用replaceState更新URL
    window.history.replaceState(null, '', newUrl);
  }
};

// 页面加载时处理GitHub Pages路由
processGitHubPagesUrl();

// 记录环境变量 - 用于调试
console.log('BASE_URL:', import.meta.env.BASE_URL);
console.log('VITE_BASE_URL:', import.meta.env.VITE_BASE_URL);
console.log('NODE_ENV:', import.meta.env.MODE);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
