import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    include: ['tests/**/*.test.ts'],

    // We could NOT use js-dom or happy-dom because there was a bug where refs wouldn't correctly
    // populate onMount... recreate an file a bug with Vitest or someone?
    browser: {
      provider: playwright(),
      enabled: true,
      // at least one instance is required
      instances: [
        { browser: 'chromium' },
      ],
    },
  },
})
