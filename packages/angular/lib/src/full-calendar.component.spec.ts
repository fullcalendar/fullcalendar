import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FullCalendarModule } from './full-calendar.module';
import { FullCalendarComponent } from './full-calendar.component';

import { CalendarOptions } from '@fullcalendar/angular';
import classicThemePlugin from '@fullcalendar/angular/themes/classic';
import dayGridPlugin from '@fullcalendar/angular/daygrid';
import interactionPlugin from '@fullcalendar/angular/interaction';
import listPlugin from '@fullcalendar/angular/list';

const DEFAULT_OPTIONS = {
  plugins: [classicThemePlugin, dayGridPlugin, interactionPlugin],
  editable: true,
};

describe('FullCalendarComponent', () => {
  let component: FullCalendarComponent;
  let fixture: ComponentFixture<FullCalendarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FullCalendarModule]
    }).compileComponents();

    fixture = TestBed.createComponent(FullCalendarComponent);
    component = fixture.componentInstance;
    component.options = {
      ...DEFAULT_OPTIONS,
      headerToolbarClass: 'my-header-toolbar',
      headerToolbar: {
        start: 'prev,next today',
        end: 'title'
      },
    };
    fixture.detectChanges(); // necessary for initializing change detection system
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.my-header-toolbar')).toBeTruthy()
  });

  it('should unmount and call destroy', () => {
    fixture.destroy();
    expect(fixture.nativeElement.querySelector('.my-header-toolbar')).toBeFalsy()
  });

  it('should expose an API', () => {
    const calendarApi = component.getApi();
    expect(calendarApi).toBeTruthy();

    const newDate = new Date(Date.UTC(2000, 0, 1));
    calendarApi.gotoDate(newDate);
    expect(calendarApi.getDate().valueOf()).toBe(newDate.valueOf());
  });

});

// some tests need a wrapper component

@Component({
  template: `
    <full-calendar [options]="calendarOptions"></full-calendar>
  `
})
class HostComponent {
  calendarOptions: CalendarOptions = {
    ...DEFAULT_OPTIONS,
    headerToolbarClass: 'my-header-toolbar',
    dayCellClass: (info) => {
      const day = info.date.getDay()
      return (day === 0 || day === 6) ? 'my-weekend' : ''
    },
    weekends: true,
    events: [buildEvent()] as any,
    viewDidMount: this.handleViewDidMount.bind(this),
    eventDidMount: this.handleEventDidMount.bind(this)
  };
  viewSkeletonRenderCnt = 0;
  eventRenderCnt = 0;
  something = 999;

  disableWeekends() {
    this.calendarOptions.weekends = false;
  }

  changeSomething() {
    this.something++;
  }

  addEventReset() {
    this.calendarOptions.events = (this.calendarOptions.events as any).concat([ buildEvent() ]);
  }

  setEventFunc(timeout: number) {
    this.calendarOptions.events = function(info: any, successCallback: any) {
      setTimeout(function() {
        successCallback([ buildEvent() ]);
      }, timeout);
    };
  }

  handleViewDidMount() {
    this.viewSkeletonRenderCnt++;
  }

  handleEventDidMount() {
    this.eventRenderCnt++;
  }
}

describe('HostComponent', () => {
  let component: HostComponent;
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FullCalendarModule],
      declarations: [HostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // necessary for initializing change detection system
  });

  it('should handle prop changes', () => {
    expect(fixture.nativeElement.querySelector('.my-weekend')).toBeTruthy();
    component.disableWeekends();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.my-weekend')).toBeFalsy();
  });

  it('should handle prop changes that don\'t rerender any DOM', () => {
    const headerEl = fixture.nativeElement.querySelector('.my-header-toolbar');
    expect(component.viewSkeletonRenderCnt).toBe(1);
    component.changeSomething();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.my-header-toolbar')).toBe(headerEl);
    expect(component.viewSkeletonRenderCnt).toBe(1);
  });

  it('should emit an event', () => {
    expect(component.viewSkeletonRenderCnt).toBeGreaterThan(0);
  });

  it('should render new events with prop change', () => {
    expect(component.eventRenderCnt).toBe(1);
    component.addEventReset();
    fixture.detectChanges();
    expect(component.eventRenderCnt).toBe(3); // +2 (the two events were freshly rendered)
  });

  it('should handle new events async function', (done) => {
    expect(component.eventRenderCnt).toBe(1);
    component.setEventFunc(100);
    fixture.detectChanges();
    setTimeout(function() {
      expect(component.eventRenderCnt).toBe(2); // +1
      done();
    }, 200);
  });

});

// uses the separate `events` input

@Component({
  template: `
    <full-calendar
      [options]="calendarOptions"
      [events]="events"
    ></full-calendar>
  `
})
class HostComponentWithEventAttr {
  calendarOptions: CalendarOptions = {
    ...DEFAULT_OPTIONS,
    eventDidMount: this.handleEventDidMount.bind(this)
  };
  events = [buildEvent()];
  eventRenderCnt = 0;

  handleEventDidMount() {
    this.eventRenderCnt++;
  }

  addEventReset() {
    this.events = this.events.concat([buildEvent()]);
  }
}

describe('HostComponentWithEventAttr', () => {
  let component: HostComponentWithEventAttr;
  let fixture: ComponentFixture<HostComponentWithEventAttr>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FullCalendarModule],
      declarations: [HostComponentWithEventAttr]
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponentWithEventAttr);
    component = fixture.componentInstance;
    fixture.detectChanges(); // necessary for initializing change detection system
  });

  it('should render events', () => {
    expect(component.eventRenderCnt).toBe(1);
    component.addEventReset();
    fixture.detectChanges();
    expect(component.eventRenderCnt).toBe(3); // +2 (the two events were freshly rendered)
  });
})

// has content-injection template

@Component({
  template: `
    <full-calendar #calendar [options]="calendarOptions">
      <ng-template #eventContent let-arg>
        <b *ngIf="isBold">{{ arg.event.title }}</b>
        <i *ngIf="!isBold">{{ arg.event.title }}</i>
      </ng-template>
    </full-calendar>
  `
})
class HostComponentWithTemplate {
  calendarOptions: CalendarOptions = {
    ...DEFAULT_OPTIONS,
    eventClass: 'my-event',
    listItemEventClass: 'my-list-item-event',
    events: [buildEvent()]
  };
  isBold = false;

  @ViewChild('calendar') calendarComponent?: FullCalendarComponent;

  turnBold() {
    this.isBold = true;
  }
}

describe('HostComponentWithTemplate', () => {
  let component: HostComponentWithTemplate;
  let fixture: ComponentFixture<HostComponentWithTemplate>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FullCalendarModule],
      declarations: [HostComponentWithTemplate]
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponentWithTemplate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render event with custom template', () => {
    const eventEl = fixture.nativeElement.querySelector('.my-event');
    expect(eventEl.querySelectorAll('i').length).toBe(1);
    expect(eventEl.querySelectorAll('b').length).toBe(0);

    component.turnBold();
    fixture.detectChanges();

    expect(eventEl).toBe(fixture.nativeElement.querySelector('.my-event'));
    expect(eventEl.querySelectorAll('i').length).toBe(0);
    expect(eventEl.querySelectorAll('b').length).toBe(1);
  });

  it('should custom-render going forward-back', () => {
    const calendar = component.calendarComponent!.getApi();

    let eventEl = fixture.nativeElement.querySelector('.my-event');
    expect(eventEl.querySelectorAll('i').length).toBe(1);
    expect(eventEl.querySelectorAll('b').length).toBe(0);

    calendar.next();
    calendar.prev();

    eventEl = fixture.nativeElement.querySelector('.my-event');
    expect(eventEl.querySelectorAll('i').length).toBe(1);
    expect(eventEl.querySelectorAll('b').length).toBe(0);
  });

  it('should custom-render DnD-able daygrid list-like event', () => {
    let eventEl = fixture.nativeElement.querySelector('.my-event');
    expect(eventEl).toHaveClass('my-list-item-event');
  })
})

// Regression test for an Angular-rendered event spanning adjacent view ranges.
// https://github.com/fullcalendar/fullcalendar/issues/8085

@Component({
  template: `
    <full-calendar #calendar [options]="calendarOptions">
      <ng-template #eventContent let-arg>
        <b>{{ arg.timeText }}</b>
        <i>{{ arg.event.title }}</i>
      </ng-template>
    </full-calendar>
  `
})
class DayGridWeekCrossRangeEventHostComponent {
  calendarOptions: CalendarOptions = {
    plugins: [classicThemePlugin, dayGridPlugin],
    initialView: 'dayGridWeek',
    initialDate: '2024-06-10',
    firstDay: 1,
    events: [
      {
        id: 'before',
        title: 'Starts before visible range',
        start: '2024-06-09T20:00:00',
        end: '2024-06-10T05:00:00',
      },
    ],
    eventClass: 'cross-range-event',
  };

  @ViewChild('calendar') calendarComponent?: FullCalendarComponent;
}

describe('with dayGridWeek event spanning adjacent view ranges', () => {
  let component: DayGridWeekCrossRangeEventHostComponent;
  let fixture: ComponentFixture<DayGridWeekCrossRangeEventHostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FullCalendarModule],
      declarations: [DayGridWeekCrossRangeEventHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DayGridWeekCrossRangeEventHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('custom-renders after navigating to the previous range and back', () => {
    const calendar = component.calendarComponent!.getApi();

    expect(fixture.nativeElement.querySelector('.cross-range-event b')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.cross-range-event i').textContent)
      .toBe('Starts before visible range');

    calendar.prev();
    expect(fixture.nativeElement.querySelector('.cross-range-event i')).toBeTruthy();

    calendar.next();
    expect(fixture.nativeElement.querySelector('.cross-range-event b')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.cross-range-event i').textContent)
      .toBe('Starts before visible range');
  });
})

// some tests need a wrapper component with DEEP COMPARISON

@Component({
  template: `
    <full-calendar
      deepChangeDetection="true"
      [options]="calendarOptions"
    ></full-calendar>
  `
})
class DeepHostComponent {

  calendarOptions: CalendarOptions = {
    ...DEFAULT_OPTIONS,
    events: [buildEvent()] as any,
    eventTitleClass: 'my-event-title',
    eventDidMount: this.handleEventDidMount.bind(this)
  };
  eventRenderCnt = 0;

  addEventAppend() {
    (this.calendarOptions.events as any).push(buildEvent());
  }

  updateEventTitle(title: string) {
    (this.calendarOptions.events as any)[0].title = title;
  }

  setEventFunc(timeout: number) {
    this.calendarOptions.events = function(info: any, successCallback: any) {
      setTimeout(function() {
        successCallback([ buildEvent() ]);
      }, timeout);
    };
  }

  handleEventDidMount() {
    this.eventRenderCnt++;
  }
}

describe('DeepHostComponent', () => {
  let component: DeepHostComponent;
  let fixture: ComponentFixture<DeepHostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FullCalendarModule],
      declarations: [DeepHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DeepHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // necessary for initializing change detection system
  });

  it('should render new appended event', () => {
    expect(component.eventRenderCnt).toBe(1);
    component.addEventAppend();
    fixture.detectChanges();
    expect(component.eventRenderCnt).toBe(3); // +2 (the two events were freshly rendered)
  });

  it('should render event mutation', async () => {
    expect(component.eventRenderCnt).toBe(1);

    component.updateEventTitle('another title');
    fixture.detectChanges();

    await new Promise(resolve => setTimeout(resolve, 100)); // wait for event positioning
    expect(fixture.nativeElement.querySelector('.my-event-title').innerText).toBe('another title');
    expect(component.eventRenderCnt).toBe(2); // +1

    component.updateEventTitle('another title');
    fixture.detectChanges();

    await new Promise(resolve => setTimeout(resolve, 100)); // wait for event positioning
    expect(fixture.nativeElement.querySelector('.my-event-title').innerText).toBe('another title');
    expect(component.eventRenderCnt).toBe(2); // +0 (didn't rerender anything)
  });

  it('should handle new events async function', (done) => {
    expect(component.eventRenderCnt).toBe(1);
    component.setEventFunc(100);
    fixture.detectChanges();
    setTimeout(function() {
      expect(component.eventRenderCnt).toBe(2); // +1
      done();
    }, 200);
  });

});

// Integration test
// https://github.com/fullcalendar/fullcalendar/issues/7058

@Component({
  template: `
    <full-calendar #calendar [options]="calendarOptions">
      <ng-template #eventContent let-arg>
        <b>{{ arg.event.title }}</b>
      </ng-template>
    </full-calendar>
  `
})
class CrapComponent {
  private defaultHeaderToolbar = {
    left: '',
    center: 'title',
    right: '',
  }

  @ViewChild('calendar') calendarComponent?: FullCalendarComponent;

  calendarOptions: CalendarOptions = {
    plugins: [classicThemePlugin, listPlugin],
    headerToolbar: this.defaultHeaderToolbar,
    initialView: 'listWeek',
    events: [buildEvent()] as any,
    datesSet: this.onDatesSet.bind(this)
  };

  onDatesSet() {
    this.calendarComponent!.getApi().setOption('headerToolbar', this.defaultHeaderToolbar)
  }
}

describe('with list-view, customContent, and state mutation in datesSet', () => {
  let component: CrapComponent;
  let fixture: ComponentFixture<CrapComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FullCalendarModule],
      declarations: [CrapComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CrapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // necessary for initializing change detection system
  });

  it('doesn\'t throw any errors', () => {
    expect(Boolean(fixture)).toBe(true)
  })
})

// Supplying content-injection as a function for dayCellTopContent
// https://github.com/fullcalendar/fullcalendar/issues/7187

@Component({
  template: `
    <full-calendar #calendar [options]="calendarOptions"></full-calendar>
  `
})
class MonthComponent {
  calendarOptions: CalendarOptions = {
    plugins: [classicThemePlugin, dayGridPlugin],
    initialView: 'dayGridMonth',
    dayCellTopClass: 'my-day-cell-top',
    dayCellTopContent(info) {
      return { html: `<b>${info.text}</b>` }
    },
  };
}

describe('with month view and dayCellTopContent as a function', () => {
  let component: MonthComponent;
  let fixture: ComponentFixture<MonthComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FullCalendarModule],
      declarations: [MonthComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MonthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // necessary for initializing change detection system
  });

  it('should render custom content', () => {
    const dayCellTop = fixture.nativeElement.querySelector('.my-day-cell-top');
    expect(dayCellTop.querySelectorAll('b').length).toBe(1);
  });
});

// https://github.com/fullcalendar/fullcalendar/issues/7191
describe('dayGridMonth view dot-event elements, custom content, and eventDidMount', () => {
  let eventDidMountCnt: number | undefined
  let dotEventEl: HTMLElement | undefined

  @Component({
    template: `
      <full-calendar #calendar [options]="calendarOptions">
        <ng-template #eventContent let-arg>
          <b>{{ arg.timeText }}</b>
          <i>{{ arg.event.title }}</i>
        </ng-template>
      </full-calendar>
    `
  })
  class MonthComponent2 {
    calendarOptions: CalendarOptions = {
      plugins: [classicThemePlugin, dayGridPlugin],
      initialDate: '2023-03-20',
      events: [
        { start: '2023-03-20T00:12:00', allDay: false }
      ],
      initialView: 'dayGridMonth',
      eventDidMount(info) {
        dotEventEl = info.el
        eventDidMountCnt!++
      },
    };
  }

  let component: MonthComponent2;
  let fixture: ComponentFixture<MonthComponent2>;

  beforeEach(() => {
    eventDidMountCnt = 0
    dotEventEl = undefined

    TestBed.configureTestingModule({
      imports: [FullCalendarModule],
      declarations: [MonthComponent2]
    }).compileComponents();

    fixture = TestBed.createComponent(MonthComponent2);
    component = fixture.componentInstance;
    fixture.detectChanges(); // necessary for initializing change detection system
  });

  it('has elements visible in DOM', (done) => {
    setTimeout(() => {
      expect(eventDidMountCnt).toBe(1)
      expect(dotEventEl).toBeTruthy()
      expect(dotEventEl!.offsetWidth).toBeGreaterThan(0)
      expect(dotEventEl!.offsetHeight).toBeGreaterThan(0)
      done()
    }, 100)
  });
});

describe(`during foreground custom event rendering`, async () => {
  let didMountCalled: boolean | undefined;
  let component: MonthComponent3;
  let fixture: ComponentFixture<MonthComponent3>;

  @Component({
    template: `
      <full-calendar #calendar [options]="calendarOptions">
        <ng-template #eventContent let-arg>
          <i>{{ arg.event.title }}</i>
        </ng-template>
      </full-calendar>
    `
  })
  class MonthComponent3 {
    calendarOptions: CalendarOptions = {
      plugins: [classicThemePlugin, dayGridPlugin],
      initialDate: '2023-03-20',
      events: [
        {
          start: '2023-03-20',
        }
      ],
      initialView: 'dayGridMonth',
      eventDidMount(eventInfo) {
        expect(eventInfo.el).toBeTruthy()
        didMountCalled = true
      },
    };
  }

  beforeEach(() => {
    didMountCalled = false

    TestBed.configureTestingModule({
      imports: [FullCalendarModule],
      declarations: [MonthComponent3]
    }).compileComponents();

    fixture = TestBed.createComponent(MonthComponent3);
    component = fixture.componentInstance;
    fixture.detectChanges(); // necessary for initializing change detection system
  });

  it('receives el', (done) => {
    setTimeout(() => {
      expect(didMountCalled).toBe(true)
      done()
    }, 100)
  })
});

describe(`during background custom event rendering`, async () => {
  let didMountCalled: boolean | undefined;
  let component: MonthComponent3;
  let fixture: ComponentFixture<MonthComponent3>;

  @Component({
    template: `
      <full-calendar #calendar [options]="calendarOptions">
        <ng-template #eventContent let-arg>
          <i>{{ arg.event.title }}</i>
        </ng-template>
      </full-calendar>
    `
  })
  class MonthComponent3 {
    calendarOptions: CalendarOptions = {
      plugins: [classicThemePlugin, dayGridPlugin],
      initialDate: '2023-03-20',
      events: [
        {
          start: '2023-03-20',
          display: 'background',
        }
      ],
      initialView: 'dayGridMonth',
      backgroundEventDidMount(eventInfo) {
        expect(eventInfo.el).toBeTruthy()
        didMountCalled = true
      },
    };
  }

  beforeEach(() => {
    didMountCalled = false

    TestBed.configureTestingModule({
      imports: [FullCalendarModule],
      declarations: [MonthComponent3]
    }).compileComponents();

    fixture = TestBed.createComponent(MonthComponent3);
    component = fixture.componentInstance;
    fixture.detectChanges(); // necessary for initializing change detection system
  });

  it('receives el', (done) => {
    setTimeout(() => {
      expect(didMountCalled).toBe(true)
      done()
    }, 100)
  })
});

// FullCalendar data utils

function buildEvent() {
  return  {
    title: 'event',
    start: new Date(),
    end: new Date(Date.now() + 1) // guarantee only within single day
   };
}
