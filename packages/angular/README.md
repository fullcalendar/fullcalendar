
# FullCalendar Angular Component

FullCalendar Angular package for rendering a calendar

## Installation

```sh
npm install @fullcalendar/angular fullcalendar temporal-polyfill
```

## Coming from v6?

In v7, plugins like dayGrid and timeGrid are part of this package, imported from subpaths like `@fullcalendar/angular/daygrid`. The separate `@fullcalendar/core`, `@fullcalendar/daygrid`, `@fullcalendar/interaction` (etc.) packages are FullCalendar v6. Don't install them with v7, and don't downgrade to v6: uninstall them and import plugins from `@fullcalendar/angular/daygrid`. See the [upgrade guide](https://fullcalendar.io/docs/upgrading-from-v6).

## Usage

In one of your app's component files:

```ts
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterOutlet } from "@angular/router";
import { FullCalendarModule, CalendarOptions } from "@fullcalendar/angular";
import themePlugin from "@fullcalendar/angular/themes/monarch"; // YOUR THEME
import dayGridPlugin from "@fullcalendar/angular/daygrid";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, FullCalendarModule],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  calendarOptions: CalendarOptions = {
    initialView: "dayGridMonth",
    plugins: [themePlugin, dayGridPlugin],
  };
}
```

Then, add the following stylesheets to your `angular.json`:

```diff
  {
    "projects": {        // ...
      "my-project": {    // ...
        "architect": {   // ...
          "build": {     // ...
            "options": { // ...
              "styles": [
+               "@fullcalendar/angular/skeleton.css", // ALWAYS NEED SKELETON
+               "@fullcalendar/angular/themes/monarch/theme.css", // YOUR THEME
+               "@fullcalendar/angular/themes/monarch/palettes/purple.css", // YOUR THEME'S PALETTE
                "src/styles.css"
              ]
```

Then, in your component's template file, you have access to the `<full-calendar>` tag. You must pass your options into this declaration!

```html
<full-calendar [options]="calendarOptions"></full-calendar>
```

You can even supply nested templates:

```html
<full-calendar [options]="calendarOptions">
  <ng-template #eventContent let-arg>
    <b>{{ arg.timeText }}</b>
    <i>{{ arg.event.title }}</i>
  </ng-template>
</full-calendar>
```

## Plugins

| Import                              | Provides                                     |
| ----------------------------------- | -------------------------------------------- |
| `@fullcalendar/angular/daygrid`     | `dayGridDay`/`Week`/`Month`/`Year` views     |
| `@fullcalendar/angular/timegrid`    | `timeGridDay`/`Week` views                   |
| `@fullcalendar/angular/list`        | `listDay`/`Week`/`Month`/`Year` views        |
| `@fullcalendar/angular/multimonth`  | `multiMonthYear` view                        |
| `@fullcalendar/angular/interaction` | dragging, resizing, and date/event selection |

Themes are plugins too. `@fullcalendar/angular/themes/classic`, `/monarch`, `/breezy`, `/forma`, and `/pulse` are available, each paired with a `theme.css` and a palette stylesheet.

## Links

- [Angular Documentation](https://fullcalendar.io/docs/angular)
- [Angular Scheduler Documentation](https://fullcalendar.io/docs/angular#fullcalendar-premium)
- [Angular Example Project](https://github.com/fullcalendar/fullcalendar-examples/tree/main/angular22)
- [Options Reference](https://fullcalendar.io/docs/all)

## History

This project is built and maintained by [irustm](https://github.com/irustm) in partnership with the maintainers of FullCalendar. The project was originally called `ng-fullcalendar` which can still be [found on NPM](https://www.npmjs.com/package/ng-fullcalendar).
