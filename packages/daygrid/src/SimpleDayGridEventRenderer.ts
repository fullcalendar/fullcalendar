import {
  htmlEscape, cssToStr,
  FgEventRenderer,
  Seg,
  computeEventDraggable, computeEventStartResizable, computeEventEndResizable
} from '@fullcalendar/core'


/* Event-rendering methods for the DayGrid class
----------------------------------------------------------------------------------------------------------------------*/

// "Simple" is bad a name. has nothing to do with SimpleDayGrid
export default abstract class SimpleDayGridEventRenderer extends FgEventRenderer {


  // Builds the HTML to be used for the default element for an individual segment
  renderSegHtml(seg: Seg, mirrorInfo) {
    let { context } = this
    let eventRange = seg.eventRange
    let eventDef = eventRange.def
    let eventUi = eventRange.ui
    let allDay = eventDef.allDay
    let isDraggable = computeEventDraggable(context, eventDef, eventUi)
    let isResizableFromStart = allDay && seg.isStart && computeEventStartResizable(context, eventDef, eventUi)
    let isResizableFromEnd = allDay && seg.isEnd && computeEventEndResizable(context, eventDef, eventUi)
    let classes = this.getSegClasses(seg, isDraggable, isResizableFromStart || isResizableFromEnd, mirrorInfo)
    let skinCss = cssToStr(this.getSkinCss(eventUi))
    let timeHtml = ''
    let timeText
    let titleHtml

    classes.unshift('fc-day-grid-event', 'fc-h-event')

    // Only display a timed events time if it is the starting segment
    if (seg.isStart) {
      timeText = this.getTimeText(eventRange)
      if (timeText) {
        timeHtml = '<span class="fc-time">' + htmlEscape(timeText) + '</span>'
      }
    }

    titleHtml =
      '<span class="fc-title">' +
        (htmlEscape(eventDef.title || '') || '&nbsp;') + // we always want one line of height
      '</span>'

    return '<a class="' + classes.join(' ') + '"' +
        (eventDef.url ?
          ' href="' + htmlEscape(eventDef.url) + '"' :
          ''
          ) +
        (skinCss ?
          ' style="' + skinCss + '"' :
          ''
          ) +
      '>' +
        '<div class="fc-content">' +
          (context.options.dir === 'rtl' ?
            titleHtml + ' ' + timeHtml : // put a natural space in between
            timeHtml + ' ' + titleHtml   //
            ) +
        '</div>' +
        (isResizableFromStart ?
          '<div class="fc-resizer fc-start-resizer"></div>' :
          ''
          ) +
        (isResizableFromEnd ?
          '<div class="fc-resizer fc-end-resizer"></div>' :
          ''
          ) +
      '</a>'
  }


  // Computes a default event time formatting string if `eventTimeFormat` is not explicitly defined
  computeEventTimeFormat() {
    return {
      hour: 'numeric',
      minute: '2-digit',
      omitZeroMinute: true,
      meridiem: 'narrow'
    }
  }


  computeDisplayEventEnd() {
    return false // TODO: somehow consider the originating DayGrid's column count
  }

}
