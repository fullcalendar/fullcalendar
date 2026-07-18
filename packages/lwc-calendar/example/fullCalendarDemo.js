import { LightningElement, api } from 'lwc'

export default class FullCalendarDemo extends LightningElement {
  @api theme = 'forma'
  @api locale = 'en'

  calendarOptions = {
    timeZone: 'UTC',
    initialDate: '2026-07-17',
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek',
    },
    selectable: true,
    editable: true,
    events: [
      {
        title: 'All Day Event',
        start: '2026-07-01',
      },
      {
        title: 'Long Event',
        start: '2026-07-07',
        end: '2026-07-10',
      },
      {
        groupId: '999',
        title: 'Repeating Event',
        start: '2026-07-09T16:00:00+00:00',
      },
      {
        groupId: '999',
        title: 'Repeating Event',
        start: '2026-07-16T16:00:00+00:00',
      },
      {
        title: 'Conference',
        start: '2026-07-16',
        end: '2026-07-18',
      },
      {
        title: 'Meeting',
        start: '2026-07-17T10:30:00+00:00',
        end: '2026-07-17T12:30:00+00:00',
      },
      {
        title: 'Lunch',
        start: '2026-07-17T12:00:00+00:00',
      },
      {
        title: 'Birthday Party',
        start: '2026-07-18T07:00:00+00:00',
      },
      {
        url: 'http://google.com/',
        title: 'Click for Google',
        start: '2026-07-28',
      },
    ],
  }

  handleEventClick(event) {
    window.console.log('FullCalendar eventClick', event.detail)
  }
}
