import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    // Bundle analyzer (only in production)
    mode === 'production' && visualizer({
      filename: 'dist/bundle-analysis.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize bundle size
    target: 'esnext',
    minify: 'terser',
    cssMinify: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        // Manual chunking for better code splitting
        manualChunks: (id) => {
          // Create vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) {
              return 'form-vendor';
            }
            if (id.includes('@tanstack') || id.includes('@supabase')) {
              return 'data-vendor';
            }
            if (id.includes('recharts')) {
              return 'chart-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'icons-vendor';
            }
            if (id.includes('@huggingface/transformers')) {
              return 'ai-vendor';
            }
            return 'vendor';
          }
        },
        // Optimize chunk naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? 
            chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '') : 'chunk';
          return `assets/[name]-[hash].js`;
        },
      },
    },
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Enable CSS code splitting
    cssCodeSplit: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
    ],
    exclude: [
      '@huggingface/transformers', // Exclude heavy ML library from pre-bundling
    ],
  },
}));
