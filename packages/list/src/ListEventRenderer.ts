import {
  htmlEscape,
  FgEventRenderer,
  Seg,
  isMultiDayRange,
  getAllDayHtml
} from '@fullcalendar/core'
import ListView from './ListView'


export default class ListEventRenderer extends FgEventRenderer {

  listView: ListView


  constructor(listView: ListView) {
    super(listView.context)

    this.listView = listView
  }


  attachSegs(segs: Seg[]) {
    if (!segs.length) {
      this.listView.renderEmptyMessage()
    } else {
      this.listView.renderSegList(segs)
    }
  }


  detachSegs() {
  }


  // generates the HTML for a single event row
  renderSegHtml(seg: Seg) {
    let { view, theme } = this.context
    let eventRange = seg.eventRange
    let eventDef = eventRange.def
    let eventInstance = eventRange.instance
    let eventUi = eventRange.ui
    let url = eventDef.url
    let classes = [ 'fc-list-item' ].concat(eventUi.classNames)
    let bgColor = eventUi.backgroundColor
    let timeHtml

    if (eventDef.allDay) {
      timeHtml = getAllDayHtml(view)
    } else if (isMultiDayRange(eventRange.range)) {
      if (seg.isStart) {
        timeHtml = htmlEscape(this._getTimeText(
          eventInstance.range.start,
          seg.end,
          false // allDay
        ))
      } else if (seg.isEnd) {
        timeHtml = htmlEscape(this._getTimeText(
          seg.start,
          eventInstance.range.end,
          false // allDay
        ))
      } else { // inner segment that lasts the whole day
        timeHtml = getAllDayHtml(view)
      }
    } else {
      // Display the normal time text for the *event's* times
      timeHtml = htmlEscape(this.getTimeText(eventRange))
    }

    if (url) {
      classes.push('fc-has-url')
    }

    return '<tr class="' + classes.join(' ') + '">' +
      (this.displayEventTime ?
        '<td class="fc-list-item-time ' + theme.getClass('widgetContent') + '">' +
          (timeHtml || '') +
        '</td>' :
        '') +
      '<td class="fc-list-item-marker ' + theme.getClass('widgetContent') + '">' +
        '<span class="fc-event-dot"' +
        (bgColor ?
          ' style="background-color:' + bgColor + '"' :
          '') +
        '></span>' +
      '</td>' +
      '<td class="fc-list-item-title ' + theme.getClass('widgetContent') + '">' +
        '<a' + (url ? ' href="' + htmlEscape(url) + '"' : '') + '>' +
          htmlEscape(eventDef.title || '') +
        '</a>' +
      '</td>' +
    '</tr>'
  }


  // like "4:00am"
  computeEventTimeFormat() {
    return {
      hour: 'numeric',
      minute: '2-digit',
      meridiem: 'short'
    }
  }

}
