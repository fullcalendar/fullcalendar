import { Calendar } from '@fullcalendar/core'

export class FullCalendarElement extends HTMLElement {
  _calendar: Calendar | null = null // TODO: make truly private

  connectedCallback() {
    this.innerHTML = '<div></div>'
    let calendarEl = this.querySelector('div')
    let calendar = new Calendar(calendarEl, {
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
      },
    })
    calendar.render()
    this._calendar = calendar
  }

  disconnectedCallback() {
    this._calendar.destroy()
    this._calendar = null
  }
}
