import { Duration, createDuration } from './datelib/duration'
import { ReducerContext } from './reducers/ReducerContext'
import { __assign } from 'tslib'


export interface ScrollRequest {
  time?: Duration
  [otherProp: string]: any
}

export type ScrollRequestHandler = (request: ScrollRequest) => boolean


export class ScrollResponder {

  queuedRequest: ScrollRequest


  constructor(
    public execFunc: ScrollRequestHandler,
    private context: ReducerContext
  ) {
    context.emitter.on('_scrollRequest', this.handleScrollRequest)
    this.fireInitialScroll()
  }


  detach() {
    this.context.emitter.off('_scrollRequest', this.handleScrollRequest)
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
      time: createDuration(this.context.options.scrollTime)
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
