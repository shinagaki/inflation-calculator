import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // チャンク分割でロード時間を最適化
    rollupOptions: {
      output: {
        manualChunks: {
          // React関連を分離
          vendor: ['react', 'react-dom'],
          // ルーティングライブラリを分離
          router: ['wouter'],
          // シェア機能を分離（遅延ロード可能）
          share: ['react-share'],
          // ユーティリティを分離
          utils: ['country-flag-emoji-polyfill']
        }
      }
    },
    // ファイルサイズ警告の閾値を調整
    chunkSizeWarningLimit: 1000,
    // CSS Code Splitting
    cssCodeSplit: true,
    // ソースマップを本番では無効化（軽量化）
    sourcemap: false
  },
  // プリロード最適化
  optimizeDeps: {
    include: ['react', 'react-dom', 'wouter']
  }
})
