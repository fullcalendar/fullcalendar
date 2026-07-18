# FullCalendar LWC

FullCalendar LWC packages the FullCalendar global build as a Salesforce static resource and wraps it in a Lightning Web Component. The release zip includes the programmatic `fullCalendar` component and a `fullCalendarDemo` component that demonstrates a complete Lightning App Builder integration.

## Install

1. Download `fullcalendar-lwc-<version>.zip` from GitHub Releases.
2. Unpack it and copy `force-app/main/default/` into your SFDX project's corresponding package directory.
3. Deploy with `sf project deploy start`.

## Usage

Minimal usage:

```html
<c-full-calendar options={calendarOptions}></c-full-calendar>
```

With an explicit theme, palette, and locale (`theme-palette` is optional; each theme has a default palette):

```html
<c-full-calendar
  options={calendarOptions}
  theme="forma"
  theme-palette="blue"
  locale="en-gb"
></c-full-calendar>
```

Available themes and their palettes (default palette in bold):

- `classic` — single built-in palette (`theme-palette` is ignored)
- `breezy` — amber, emerald, **indigo**, rose
- `forma` — **blue**, green, purple, red
- `monarch` — blue, green, **purple**, red, yellow
- `pulse` — blue, green, purple, **red**

Additional FullCalendar global-plugin scripts (such as the premium Scheduler runtime shipped by the `lwc-scheduler` package) can be supplied as static-resource URLs through `plugin-urls`; the component loads them and applies their plugins during initialization.

With event handling:

```html
<c-full-calendar
  options={calendarOptions}
  oneventclick={handleEventClick}
></c-full-calendar>
```

```js
handleEventClick(event) {
  console.log(event.detail)
}
```

## Reactivity

The wrapper only reacts when the `options` object is reassigned. Mutating the existing object in place will not trigger updates.

```js
this.calendarOptions = {
  ...this.calendarOptions,
  weekends: !this.calendarOptions.weekends,
}
```

After initialization, the wrapper passes reassigned `options` through FullCalendar's `resetOptions` connector API. Changes to the component's top-level `locale` prop load the matching locale global asynchronously before updating the calendar. The special-handling `locale` setting must be supplied through this prop, not through `options`.

## Lightning App Builder Demo

The low-level `fullCalendar` component is intended for programmatic composition and does not appear in Lightning App Builder. The included **FullCalendar Demo** component provides representative toolbar, event, interaction, theme, palette, and locale configuration.

To try it after deployment:

1. In the deployed org, open **Setup** from the gear menu.
2. Use **Quick Find** to open **Lightning App Builder**, then click **New**.
3. Select **App Page**, enter a label such as **FullCalendar Demo**, select the standard **One Region** template, and click **Done**.
4. Under **Custom**, drag **FullCalendar Demo** onto the page and choose its **Theme** and **Locale**.
5. Click **Save** and **Activate**, create the Lightning tab if prompted, and add the page to a Lightning app such as **Sales**.
6. Open that app from the App Launcher and verify the calendar and sample events.

Use `fullCalendarDemo` as reference code for an application-specific wrapper that supplies its own options, data, and callbacks.

## Imperative API

Call `getCalendar()` on the component instance to access the underlying FullCalendar `Calendar` instance:

```js
const calendar = this.template.querySelector('c-full-calendar').getCalendar()
calendar.next()
```

## Known Limitations

- `themePalette` and `pluginUrls` are set once during initial render. Recreate the component to change them. `theme` may be changed at any time; the new theme's assets load asynchronously before it is applied.
- Two components on the same page must not use the same theme with different palettes; palette CSS variables are page-global per theme.
- The wrapper relies on Salesforce static-resource loading and Lightning Web Security allowing the FullCalendar IIFE bundle to attach to `window.FullCalendar`.
- LWC event handlers receive re-dispatched custom events whose payload is available on `event.detail`.

## Repository Directory Name

The `lwc-calendar` directory name is intentional. When this package directory was named exactly `lwc`, Salesforce CLI treated that ancestor as the special LWC metadata directory and incorrectly interpreted its `dist` child as a `LightningComponentBundle` named `dist`. Deployments then failed with `Cannot find Lightning Component Bundle dist`.

Do not rename this repository directory to `lwc` unless the Salesforce CLI path-resolution behavior has been fixed and verified. This workaround affects only the repository directory: the npm package remains `@fullcalendar/lwc`, and the Salesforce component remains `fullCalendar`.

## Build Output

Build the deployable source tree:

```sh
pnpm build
```

This writes `dist/force-app/main/default/...`.

Create the release zip from the built source tree:

```sh
pnpm archive
```

This writes `archives/fullcalendar-lwc-<version>.zip`.

Remove all build and archive output with:

```sh
pnpm clean
```

For local Salesforce smoke testing, build and deploy directly from this package:

```sh
pnpm build
pnpm run smoke:login # only when the fullcalendar-dev alias is unavailable
pnpm run smoke:deploy
```

## Options Reference

Use the main FullCalendar documentation for the complete options surface:

https://fullcalendar.io/docs
