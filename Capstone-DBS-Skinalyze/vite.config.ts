import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
// The 'profile' import from 'node:console' was unused, so I've removed it for cleanliness.

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        skin_check: resolve(__dirname, 'skin-check.html'),
        artikel: resolve(__dirname, 'artikel.html'),
        faq: resolve(__dirname, 'faq.html'),
        hasil: resolve(__dirname, 'hasil.html'),
        login: resolve(__dirname, 'loginPage.html'),
        register: resolve(__dirname, 'sign-up.html'),
        profile: resolve(__dirname, 'profile.html'),
        about: resolve(__dirname, 'about.html'),
      }
    }
  },
})