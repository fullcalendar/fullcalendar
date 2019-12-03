import {
  h,
  htmlEscape,
  FgEventRenderer,
  Seg,
  isMultiDayRange,
  BaseFgEventRendererProps,
  ComponentContext,
  createFormatter,
  htmlToElement,
  subrenderer,
  sortEventSegs,
  renderVNodes,
  GotoAnchor
} from '@fullcalendar/core'


export interface ListViewEventsProps extends BaseFgEventRendererProps {
  contentEl: HTMLElement
  dayDates: Date[]
}


export default class ListViewEvents extends FgEventRenderer<ListViewEventsProps> {

  private attachSegs = subrenderer(attachSegs, detachSegs)


  render(props: ListViewEventsProps, context: ComponentContext) {
    let segs = this.renderSegs({
      segs: props.segs,
      mirrorInfo: props.mirrorInfo,
      selectedInstanceId: props.selectedInstanceId,
      hiddenInstances: props.hiddenInstances
    })

    this.attachSegs({
      segs,
      dayDates: props.dayDates,
      contentEl: props.contentEl
    })
  }


  // generates the HTML for a single event row
  renderSegHtml(seg: Seg) {
    let { theme, options } = this.context
    let eventRange = seg.eventRange
    let eventDef = eventRange.def
    let eventInstance = eventRange.instance
    let eventUi = eventRange.ui
    let url = eventDef.url
    let classes = [ 'fc-list-item' ].concat(eventUi.classNames)
    let bgColor = eventUi.backgroundColor
    let timeText
    let timeHtml

    if (eventDef.allDay) {
      timeHtml = options.allDayHtml
      timeText = options.allDayText

    } else if (isMultiDayRange(eventRange.range)) {

      if (seg.isStart) {
        timeText = this._getTimeText(
          eventInstance.range.start,
          seg.end,
          false // allDay
        )

      } else if (seg.isEnd) {
        timeText = this._getTimeText(
          seg.start,
          eventInstance.range.end,
          false // allDay
        )

      } else { // inner segment that lasts the whole day
        timeHtml = options.allDayHtml
        timeText = options.allDayText
      }

    } else {
      // Display the normal time text for the *event's* times
      timeText = this.getTimeText(eventRange)
    }

    if (url) {
      classes.push('fc-has-url')
    }

    if (timeText) {
      timeHtml = htmlEscape(timeText)
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


function attachSegs({ segs, dayDates, contentEl }: { segs, dayDates: Date[], contentEl: HTMLElement }, context: ComponentContext) {
  if (segs.length) {
    renderSegList(segs, dayDates, contentEl, context)
  } else {
    renderEmptyMessage(contentEl, context)
  }

  return contentEl
}


function detachSegs(contentEl: HTMLElement) {
  contentEl.innerHTML = ''
}


function renderEmptyMessage(contentEl: HTMLElement, context: ComponentContext) {
  contentEl.innerHTML =
    '<div class="fc-list-empty-wrap2">' + // TODO: try less wraps
    '<div class="fc-list-empty-wrap1">' +
    '<div class="fc-list-empty">' +
      htmlEscape(context.options.noEventsMessage) +
    '</div>' +
    '</div>' +
    '</div>'
}


function renderSegList(allSegs, dayDates: Date[], contentEl: HTMLElement, context: ComponentContext) {
  let { theme } = context
  let segsByDay = groupSegsByDay(allSegs) // sparse array
  let dayIndex
  let daySegs
  let i
  let tableEl = htmlToElement('<table class="fc-list-table ' + theme.getClass('tableList') + '"><tbody></tbody></table>')
  let tbodyEl = tableEl.querySelector('tbody')

  for (dayIndex = 0; dayIndex < segsByDay.length; dayIndex++) {
    daySegs = segsByDay[dayIndex]

    if (daySegs) { // sparse array, so might be undefined

      // append a day header
      tbodyEl.appendChild(
        buildDayHeaderRow(dayDates[dayIndex], context)
      )

      daySegs = sortEventSegs(daySegs, context.eventOrderSpecs)

      for (i = 0; i < daySegs.length; i++) {
        tbodyEl.appendChild(daySegs[i].el) // append event row
      }
    }
  }

  contentEl.appendChild(tableEl)
}


// generates the HTML for the day headers that live amongst the event rows
function buildDayHeaderRow(dayDate, context: ComponentContext) {
  let { theme, dateEnv, options } = context
  let mainFormat = createFormatter(options.listDayFormat) // TODO: cache
  let altFormat = createFormatter(options.listDayAltFormat) // TODO: cache

  let tr = document.createElement('tr')
  tr.className = 'fc-list-heading'
  tr.setAttribute('data-date', dateEnv.formatIso(dayDate, { omitTime: true }))

  let td = document.createElement('td')
  td.className = theme.getClass('tableListHeading') + ' ' + theme.getClass('widgetHeader')
  td.colSpan = 3
  tr.appendChild(td)

  let inners = []

  if (mainFormat) {
    inners.push(
      ...renderVNodes(
        <GotoAnchor
          navLinks={options.navLinks}
          gotoOptions={dayDate}
          extraAttrs={{ 'class': 'fc-list-heading-main' }}
        >{dateEnv.format(dayDate, mainFormat)}</GotoAnchor>,
        context
      )
    )
  }

  if (altFormat) {
    inners.push(
      ...renderVNodes(
        <GotoAnchor
          navLinks={options.navLinks}
          gotoOptions={dayDate}
          extraAttrs={{ 'class': 'fc-list-heading-alt' }}
        >{dateEnv.format(dayDate, altFormat)}</GotoAnchor>,
        context
      )
    )
  }

  for (let inner of inners) {
    td.appendChild(inner)
  }

  return tr
}


// Returns a sparse array of arrays, segs grouped by their dayIndex
function groupSegsByDay(segs) {
  let segsByDay = [] // sparse array
  let i
  let seg

  for (i = 0; i < segs.length; i++) {
    seg = segs[i];
    (segsByDay[seg.dayIndex] || (segsByDay[seg.dayIndex] = []))
      .push(seg)
  }

  return segsByDay
}
