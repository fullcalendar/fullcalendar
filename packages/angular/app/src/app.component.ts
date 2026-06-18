import { Component, OnInit, ViewChild } from '@angular/core';
import { FullCalendarComponent, CalendarOptions, DateClickInfo, EventClickInfo } from '@fullcalendar/angular';
import classicThemePlugin from '@fullcalendar/angular/themes/classic';
import dayGridPlugin from '@fullcalendar/angular/daygrid';
import interactionPlugin, { EventDragStopInfo } from '@fullcalendar/angular/interaction';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  calendarOptions?: CalendarOptions;
  eventsModel: any;
  @ViewChild('fullcalendar') fullcalendar?: FullCalendarComponent;

  ngOnInit() {
    this.calendarOptions = {
      plugins: [classicThemePlugin, dayGridPlugin, interactionPlugin],
      editable: true,
      buttons: {
        myCustomButton: {
          text: 'custom!',
          click: function () {
            alert('clicked the custom button!');
          }
        }
      },
      headerToolbar: {
        left: 'prev,next today myCustomButton',
        center: 'title',
        right: 'dayGridMonth'
      },
      dateClick: this.handleDateClick.bind(this),
      eventClick: this.handleEventClick.bind(this),
      eventDragStop: this.handleEventDragStop.bind(this)
    };
  }

  handleDateClick(info: DateClickInfo) {
    console.log(info);
  }

  handleEventClick(info: EventClickInfo) {
    console.log(info);
  }

  handleEventDragStop(info: EventDragStopInfo) {
    console.log(info);
  }

  updateHeader() {
    this.calendarOptions!.headerToolbar = {
      left: 'prev,next myCustomButton',
      center: 'title',
      right: ''
    };
  }

  updateEvents() {
    const nowDate = new Date();
    const yearMonth = nowDate.getUTCFullYear() + '-' + (nowDate.getUTCMonth() + 1);

    this.calendarOptions!.events = [{
      title: 'Updated Event',
      start: yearMonth + '-08',
      end: yearMonth + '-10'
    }];
  }

}
