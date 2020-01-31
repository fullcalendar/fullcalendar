import { Duration, createDuration } from './datelib/duration'
import Calendar from './Calendar'
import { __assign } from 'tslib'


export interface ScrollRequest {
  time?: Duration
  [otherProp: string]: any
}

export type ScrollRequestHandler = (request: ScrollRequest) => boolean


export default class ScrollResponder {

  queuedRequest: ScrollRequest


  constructor(public calendar: Calendar, public execFunc: ScrollRequestHandler) {
    calendar.on('scrollRequest', this.handleScrollRequest)
    this.fireInitialScroll()
  }


  detach() {
    this.calendar.off('scrollRequest', this.handleScrollRequest)
  }


  update(isDatesNew: boolean) {
    if (isDatesNew) {
      this.fireInitialScroll() // will drain
    } else {
      this.drain()
    }
  }


  private fireInitialScroll() {
    this.handleScrollRequest({
      time: createDuration(this.calendar.viewOpt('scrollTime'))
    })
  }


  private handleScrollRequest = (request: ScrollRequest) => {
    this.queuedRequest = __assign({}, this.queuedRequest || {}, request)
    this.drain()
  }


  private drain() {
    if (this.queuedRequest && this.execFunc(this.queuedRequest)) {
      this.queuedRequest = null
    }
  }

}
