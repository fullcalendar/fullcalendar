import { Calendar, CalendarApi, CalendarOptions } from '@fullcalendar/core'

export class FullCalendarElement extends HTMLElement {
  _calendar: Calendar | null = null
  _options: CalendarOptions | null = null

  connectedCallback() {
    this._handleOptionsStr(this.getAttribute('options'))
  }

  disconnectedCallback() {
    this._handleOptionsStr(null)
  }

  attributeChangedCallback(name: string, oldVal: string, newVal: string): void {
    if (
      name === 'options' &&
      this._calendar // initial render happened
    ) {
      this._handleOptionsStr(newVal)
    }
  }

  get options(): CalendarOptions {
    return this._options
  }

  set options(options: CalendarOptions | null) {
    this._handleOptions(options)
  }

  getApi(): CalendarApi | null {
    return this._calendar
  }

  _handleOptionsStr(optionsStr: string | null) {
    this._handleOptions(optionsStr ? JSON.parse(optionsStr) : null)
  }

  _handleOptions(options: CalendarOptions | null): void {
    if (options) {
      if (this._calendar) {
        this._calendar.resetOptions(options)
      } else {
        this.innerHTML = '<div></div>'
        let calendarEl = this.querySelector('div')
        let calendar = new Calendar(calendarEl, options)
        calendar.render()
        this._calendar = calendar
      }
      this._options = options
    } else {
      if (this._calendar) {
        this._calendar.destroy()
        this._calendar = null
      }
      this._options = null
    }
  }

  static get observedAttributes() {
    return ['options']
  }
}
