# FullCalendar Core Types

📖 For many years, this package was the heart of FullCalendar. It played two roles:

1. **The Vanilla JS calendar itself** — if you wrote `import { Calendar } from '@fullcalendar/core'`, this is where it came from.
2. **The shared core** — the essential peer dependency installed alongside every connector (React, Angular, Vue), which instantiated a Vanilla JS calendar under the hood.

**That's no longer how FullCalendar works.** As of v7, the connectors are self-contained and no longer need this package, and the Vanilla JS calendar has moved to its own package. Today `@fullcalendar/core` exists only to share a few small TypeScript type definitions across projects. You generally won't install it directly. If you're moving an existing project forward, see the [**Upgrading from v6** guide](https://fullcalendar.io/docs/upgrading-from-v6).

## ➡️ Using the Vanilla JS calendar? It moved.

The plain-JavaScript build that used to live here is now the bare [**`fullcalendar`**](https://www.npmjs.com/package/fullcalendar) package:

```sh
npm install fullcalendar
```

## 🔌 Using a framework connector? Start here

Pick the package for your framework:

| Framework | Package |
| --- | --- |
| Vanilla JS | [`fullcalendar`](https://www.npmjs.com/package/fullcalendar) |
| React | [`@fullcalendar/react`](https://www.npmjs.com/package/@fullcalendar/react) |
| Preact | [`@fullcalendar/preact`](https://www.npmjs.com/package/@fullcalendar/preact) |
| Vue 3 | [`@fullcalendar/vue3`](https://www.npmjs.com/package/@fullcalendar/vue3) |
| Angular | [`@fullcalendar/angular`](https://www.npmjs.com/package/@fullcalendar/angular) |

For docs, examples, and premium features, visit [fullcalendar.io](https://fullcalendar.io/).
