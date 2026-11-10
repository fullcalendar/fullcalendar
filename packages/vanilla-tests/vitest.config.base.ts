import { defineConfig, type TestProjectInlineConfiguration, type ViteUserConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'
import { fileURLToPath } from 'node:url'
import * as commands from './vitest.commands'

/*
Shared by this package's vitest.config.ts and the premium test package's.
*/

// Some tests need the tall window.
// The Playwright context and Vitest's iframe get the same size so the iframe is never scaled,
// which keeps page.mouse coordinates equal to getBoundingClientRect coordinates.
export const VIEWPORT = { width: 1280, height: 1696 }

// Matches CI's TZ. Tests that use the `local` time zone depend on it.
export const TIME_ZONE = 'America/New_York'

process.env.TZ = TIME_ZONE // for the Node project's workers, which inherit it

/*
With FORCE_REACT set, the vanilla packages are swapped for their React-rendering builds, which have
the same API. Order matters: the first match wins.
*/
const FORCE_REACT_ALIASES = [
  { find: /^fullcalendar\/preact$/, replacement: 'fullcalendar-w-react/react' },
  { find: /^fullcalendar(\/.*)?$/, replacement: 'fullcalendar-w-react$1' },
  { find: /^fullcalendar-scheduler(\/.*)?$/, replacement: 'fullcalendar-scheduler-w-react$1' },
]

/*
The monorepo's root, where pnpm installs every package (node_modules/.pnpm). Vite only serves files
under the nearest workspace root, which in a fresh checkout is standard/ (its pnpm-workspace.yaml,
which `meta:hide` hides locally). Scripts loaded from the root's node_modules, like jQuery, would be
refused without this.
*/
const REPO_ROOT = fileURLToPath(new URL('../../..', import.meta.url))

export function createTestConfig(options: {
  setupFile: string
  // deps that tests import lazily. pre-bundling them avoids a Vite reload mid-run on cold starts
  optimizeDepsInclude?: string[]
}): ViteUserConfig {
  return defineConfig({
    optimizeDeps: {
      include: options.optimizeDepsInclude || [],
    },
    server: {
      fs: {
        allow: [REPO_ROOT],
      },
    },
    resolve: {
      alias: process.env.FORCE_REACT ? FORCE_REACT_ALIASES : [],
    },
    define: {
      __FORCE_REACT__: JSON.stringify(Boolean(process.env.FORCE_REACT)), // see src/lib/env.ts
    },
    test: {
      onConsoleLog(log) {
        // expected and harmless. unlike Karma, Vitest doesn't fail tests on them
        if (log.includes('ResizeObserver loop completed with undelivered notifications')) {
          return false
        }
      },
      projects: [
        {
          extends: true,
          test: {
            name: 'unit',
            environment: 'node',
            include: ['src/**/*.unit.ts'],
          },
        },
        // with scrollbars, as on most desktops
        createBrowserProject('browser', ['src/**/*.ts'], options.setupFile, false),
        // without them, as with overlay scrollbars (macOS): only the layout tests
        createBrowserProject('browser-no-scrollbars', ['src/sizing/**/*.ts'], options.setupFile, true),
      ],
    },
  })
}

/*
A project of browser tests. Scrollbars are explicitly shown or hidden, so runs are the same in every
environment. Tests read the setting with `areScrollbarsHidden` (src/lib/env.ts).
*/
function createBrowserProject(
  name: string,
  include: string[],
  setupFile: string,
  hideScrollbars: boolean,
): TestProjectInlineConfiguration {
  return {
    extends: true,
    test: {
      name,
      include,
      exclude: ['src/**/*.unit.ts', 'src/lib/**'],
      setupFiles: [setupFile],
      provide: { hideScrollbars },
      testTimeout: 10000,
      browser: {
        enabled: true,
        headless: true,
        provider: playwright({
          // Playwright passes --hide-scrollbars by default. Pass it explicitly anyway, or drop it.
          // (ignoreDefaultArgs would drop it from `args` too, so only one of them is set)
          launchOptions: hideScrollbars
            ? { args: ['--hide-scrollbars'] }
            : { ignoreDefaultArgs: ['--hide-scrollbars'] },
          contextOptions: {
            viewport: VIEWPORT,
            timezoneId: TIME_ZONE,
          },
        }),
        viewport: VIEWPORT,
        commands,
        instances: [
          { browser: 'chromium' },
        ],
      },
    },
  }
}

export function resolvePath(relPath: string, baseUrl: string): string {
  return fileURLToPath(new URL(relPath, baseUrl))
}
