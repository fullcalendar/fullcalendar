import { render, createElement } from '@fullcalendar/common'
import { ListenerCounter } from './ListenerCounter'

let standardElListenerCount

export function prepareStandardListeners() {
  if (standardElListenerCount === undefined) {
    standardElListenerCount = _prepareStandardListeners()
  }
  return standardElListenerCount
}

export function _prepareStandardListeners() {
  let el = document.createElement('div')
  document.body.appendChild(el)

  const elListenerCounter = new ListenerCounter(el)
  elListenerCounter.startWatching()

  FullCalendarVDom.flushSync(() => {
    render(createElement('div', {}), el)
  })

  return elListenerCounter.stopWatching()
}
