
# FullCalendar Angular Component

The official [Angular](https://angular.io/) Component for [FullCalendar](https://fullcalendar.io)

## Installation

Install the Angular connector, the core package, and any plugins (like [daygrid](https://fullcalendar.io/docs/month-view)):

```sh
npm install @fullcalendar/angular fullcalendar temporal-polyfill
```

## Usage

First, connect `FullCalendarModule` to your app module:

```js
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FullCalendarModule // register FullCalendar with your app
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

Then, use the `full-calendar` component, supplying an [options](https://fullcalendar.io/docs#toc) object:

```js
import { Component } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/angular/daygrid';

@Component({
  selector: 'app-root',
  templateUrl: `
    <div>
      <h1>Demo App</h1>
      <full-calendar [options]="calendarOptions"></full-calendar>
    </div>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth',
    weekends: false,
    events: [
      { title: 'Meeting', start: new Date() }
    ]
  };
}
```

You can even supply nested templates:

```html
<full-calendar [options]="calendarOptions">
  <ng-template #eventContent let-arg>
    <b>{{arg.timeText}}</b>
    <i>{{arg.event.title}}</i>
  </ng-template>
</full-calendar>
```

## Supported Angular Versions

`@fullcalendar/angular` version 7 supports Angular 16 - 22

## Links

- [Documentation](https://fullcalendar.io/docs/angular)
- [Example Project](https://github.com/fullcalendar/fullcalendar-examples/tree/main/angular15)

## History

This project is built and maintained by [irustm](https://github.com/irustm) in partnership with the maintainers of FullCalendar. The project was originally called `ng-fullcalendar` which can still be [found on NPM](https://www.npmjs.com/package/ng-fullcalendar).

## Development

You must install this repo with [PNPM](https://pnpm.io/):

```
pnpm install
```

Available scripts (via `pnpm run <script>`):

- `build` - build production-ready dist files
- `watch` - build & watch development dist files
- `start` - run a simple example application
- `test` - test headlessly
- `test:dev` - test interactively
- `clean`
