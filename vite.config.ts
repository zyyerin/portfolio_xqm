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
  build: {
    outDir: 'dist',
    sourcemap: true,
    // 确保生成正确的资源路径
    assetsInlineLimit: 4096, // 小于4kb的资源内联为base64
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // 添加其他依赖包分块
          ui: ['framer-motion']
        },
      },
    },
  },
  // 确保环境变量在构建中可用
  define: {
    'process.env.BASE_URL': JSON.stringify(base)
  },
});
