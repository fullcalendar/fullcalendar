import { Calendar } from '@fullcalendar/core'

export default class ViewWrapper {

  protected el: HTMLElement

  constructor(calendar: Calendar, className: string) {
    let viewEl = calendar.el.querySelector('.fc-view') as HTMLElement
    if (!viewEl || !viewEl.classList.contains(className)) {
      throw new Error(`Can't find view with className '${className}' in test model`)
    }
    this.el = viewEl
  }

}
