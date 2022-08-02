import { Calendar, CalendarOptions } from '@fullcalendar/core'

export class FullCalendarElement extends HTMLElement {
  _calendar: Calendar | null = null // TODO: make truly private
  _options: CalendarOptions | null = null // TODO: same

  connectedCallback() {
    const options = this._options || refineOptionsAttr(this.getAttribute('options')) || {}

    this.innerHTML = '<div></div>'
    let calendarEl = this.querySelector('div')

    let calendar = new Calendar(calendarEl, options)
    calendar.render()

    this._calendar = calendar
    this._options = options
  }

  disconnectedCallback() {
    this._calendar.destroy()

    this._calendar = null
    this._options = null
  }

  attributeChangedCallback(name: string, oldVal: string, newVal: string): void {
    if (name === 'options') {
      const options = refineOptionsAttr(newVal)

      if (options) {
        if (this._calendar) {
          this._calendar.resetOptions(options)
        }
        this._options = options
      }
    }
  }

  get options(): CalendarOptions {
    return this._options
  }

  set options(newVal: CalendarOptions) {
    if (this._calendar) {
      this._calendar.resetOptions(newVal)
    }
    this._options = newVal
  }
}

function refineOptionsAttr(optionsAttrStr: string | null): CalendarOptions | null {
  if (optionsAttrStr) {
    return JSON.parse(optionsAttrStr)
  }
  return null
}
