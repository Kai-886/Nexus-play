import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  /*
   * Random dev-page reloads (owner report): lazy 3D chunks discover
   * deps on first visit -> optimizeDeps re-runs mid-session ->
   * "optimized dependencies changed, reloading". Pre-bundle every
   * dep the lazy chunks use so discovery never triggers a reload,
   * and warm up the heavy entry routes on server start.
   */
  optimizeDeps: {
    include: [
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      '@react-three/postprocessing',
      'postprocessing',
      'maath',
      'gsap',
      'gsap/ScrollTrigger',
      'lenis',
      'axios',
      'lucide-react',
      'react-router-dom',
      'sonner',
    ],
  },
  server: {
    warmup: {
      clientFiles: [
        'src/main.jsx',
        'src/App.jsx',
        'src/pages/LandingPage.jsx',
        'src/components/three/*.jsx',
      ],
    },
  },
})
