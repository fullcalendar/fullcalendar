import { Calendar } from 'fullcalendar/public-components'
import { CalendarApi, CalendarOptions, PluginInput } from 'fullcalendar/public-api'

export class FullCalendarElement extends HTMLElement {
  _calendar: Calendar | null = null
  _options: CalendarOptions | null = null
  _forcedPlugins: PluginInput[] | null = null

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })

    if ((globalThis as any).__applyFullCalendarStyles) {
      (globalThis as any).__applyFullCalendarStyles(this.shadowRoot)
    } else {
      throw new Error('FullCalendar styles for Shadow DOM must be included via .styles.js')
    }
  }

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
      if (this._forcedPlugins) {
        options = {
          ...options,
          plugins: [
            ...this._forcedPlugins,
            ...(options.plugins || []),
          ],
        }
      }
      if (this._calendar) {
        this._calendar.resetOptions(options)
      } else {
        const calendarEl = document.createElement('div')
        this.shadowRoot.appendChild(calendarEl)
        const calendar = new Calendar(calendarEl, options)
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
