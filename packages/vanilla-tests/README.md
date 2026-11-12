# @fullcalendar-tests/standard

Tests for the `fullcalendar` packages, run with Vitest. Most run in headless Chromium (browser mode, with real input through Playwright); `*.unit.ts` files run in Node. They test the built packages, so build first (or keep `pnpm dev` running).

```sh
pnpm test                         # everything
pnpm test:dev                     # watch mode
pnpm exec vitest run src/event-drag -t "timed"
FORCE_REACT=1 pnpm test           # against the React-rendering builds
```

- `src/<feature>/`: tests, one folder per feature
- `src/lib/`: shared helpers, also used by the premium test package
  - `calendar.ts`: `initCalendar()` and teardown
  - `settle.ts`: `waitForSettle()`, for waiting on the calendar instead of sleeping
  - `pointer.ts`: real mouse and touch input
  - `models/`: finding parts of views (by `data-fc-part`) and acting on them, ex: `DayGridModel`
