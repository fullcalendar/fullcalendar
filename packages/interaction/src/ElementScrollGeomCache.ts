import { computeInnerRect, ElementScrollController } from '@fullcalendar/core/internal'
import { ScrollGeomCache } from './ScrollGeomCache.js'

export class ElementScrollGeomCache extends ScrollGeomCache {
  constructor(el: HTMLElement, doesListening: boolean) {
    super(new ElementScrollController(el), doesListening)
  }

  getEventTarget(): EventTarget {
    return (this.scrollController as ElementScrollController).el
  }

  computeClientRect() {
    return computeInnerRect((this.scrollController as ElementScrollController).el)
  }
}
