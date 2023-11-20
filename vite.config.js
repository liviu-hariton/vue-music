import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'Vue Music App',
        short_name: 'Vue Music App',
        theme_color: '#ff5e3a',
        icons: [
          {
            src: 'assets/image/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ],
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        scope: '/',
        description: 'Vue Music App',
        lang: 'en-US',
        dir: 'ltr',
        orientation: 'any',
        prefer_related_applications: false
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,jpg,svg,ico,json}']
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
