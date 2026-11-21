import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { FullCalendarModule } from '@fullcalendar/angular';

describe('AppComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    declarations: [AppComponent],
    imports: [FullCalendarModule]
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should replace calendarOptions object when updating header and events', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges(); // runs ngOnInit
    const app = fixture.componentInstance;

    const beforeHeader = app.calendarOptions;
    app.updateHeader();
    expect(app.calendarOptions).not.toBe(beforeHeader);
    expect(app.calendarOptions!.headerToolbar).toEqual({
      left: 'prev,next myCustomButton',
      center: 'title',
      right: ''
    });

    const beforeEvents = app.calendarOptions;
    app.updateEvents();
    expect(app.calendarOptions).not.toBe(beforeEvents);
    expect((app.calendarOptions!.events as any[])[0].title).toBe('Updated Event');
  });
});
