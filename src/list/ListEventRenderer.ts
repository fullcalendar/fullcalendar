import { htmlEscape } from '../util'
import EventRenderer from '../component/renderers/EventRenderer'

export default class ListEventRenderer extends EventRenderer {

  renderFgSegs(segs) {
    if (!segs.length) {
      this.component.renderEmptyMessage()
    } else {
      this.component.renderSegList(segs)
    }
  }

  // generates the HTML for a single event row
  fgSegHtml(seg) {
    let view = this.view
    let calendar = view.calendar
    let theme = calendar.theme
    let eventFootprint = seg.footprint
    let eventDef = eventFootprint.eventDef
    let componentFootprint = eventFootprint.componentFootprint
    let url = eventDef.url
    let classes = [ 'fc-list-item' ].concat(this.getClasses(eventDef))
    let bgColor = this.getBgColor(eventDef)
    let timeHtml

    if (componentFootprint.isAllDay) {
      timeHtml = view.getAllDayHtml()
    } else if (view.isMultiDayRange(componentFootprint.unzonedRange)) {
      if (seg.isStart || seg.isEnd) { // outer segment that probably lasts part of the day
        timeHtml = htmlEscape(this._getTimeText(
          calendar.msToMoment(seg.startMs),
          calendar.msToMoment(seg.endMs),
          componentFootprint.isAllDay
        ))
      } else { // inner segment that lasts the whole day
        timeHtml = view.getAllDayHtml()
      }
    } else {
      // Display the normal time text for the *event's* times
      timeHtml = htmlEscape(this.getTimeText(eventFootprint))
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
    return this.opt('mediumTimeFormat')
  }

}
