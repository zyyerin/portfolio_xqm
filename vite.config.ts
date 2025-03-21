import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 部署到自定义域名，base应该为'/'
const base = '/';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: base, // 设置为根路径，适用于自定义域名
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
