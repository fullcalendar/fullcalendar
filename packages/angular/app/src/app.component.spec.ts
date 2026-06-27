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
});
