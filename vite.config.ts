import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 获取仓库名称（如果在GitHub Pages上部署，通常是仓库名称）
// 例如: https://zyyerin.github.io/your-repo-name/
const base = '/portfolio_xqm/'; // 替换为你的GitHub仓库名称

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: base, // 为GitHub Pages部署设置基础路径
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
