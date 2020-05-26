import { createPlugin } from './plugin-system'
import { findElements } from './util/dom-manip'
import { flushToDom } from './vdom'
import { CalendarContext } from './CalendarContext'
import { removeExact } from './util/array'


let contexts: CalendarContext[] = []
let undoFuncs: (() => void)[]

export const adaptivePlugin = createPlugin({
  contextInit(context) {
    if (!contexts.length) {
      attachGlobalHandlers()
    }
    contexts.push(context)
    context.calendarApi.on('_unmount', () => {
      removeExact(contexts, context)
      if (!contexts.length) {
        removeGlobalHandlers()
      }
    })
  }
})


function attachGlobalHandlers() {
  window.addEventListener('beforeprint', handleBeforePrint)
  window.addEventListener('afterprint', handleAfterPrint)

  // // for testing
  // let forPrint = false
  // document.addEventListener('keypress', (ev) => {
  //   if (ev.key === 'p') {
  //     forPrint = !forPrint
  //     if (forPrint) {
  //       handleBeforePrint()
  //     } else {
  //       handleAfterPrint()
  //     }
  //   }
  // })
}


function removeGlobalHandlers() {
  window.removeEventListener('beforeprint', handleBeforePrint)
  window.removeEventListener('afterprint', handleAfterPrint)
}


function handleBeforePrint() {
  for (let context of contexts) {
    context.emitter.trigger('_beforeprint')
  }

  flushToDom() // because printing grabs DOM immediately after

  undoFuncs = [
    freezeScrollgridWidths(),
    freezeHScrolls()
  ]
}


function handleAfterPrint() {
  for (let context of contexts) {
    context.emitter.trigger('_afterprint')
  }

  while (undoFuncs.length) {
    undoFuncs.shift()()
  }
}


// scrollgrid widths

function freezeScrollgridWidths() {
  let els = findElements(document.body, '.fc-scrollgrid')
  els.forEach(freezeScrollGridWidth)
  return () => els.forEach(unfreezeScrollGridWidth)
}

function freezeScrollGridWidth(el: HTMLElement) {
  el.style.width = el.getBoundingClientRect().width + 'px'
}

function unfreezeScrollGridWidth(el) {
  el.style.width = ''
}


// horizontal scrolling
// TODO: use scroll normalization!? yes

function freezeHScrolls() {
  let allEls = findElements(document.body, '.fc-scroller-harness > .fc-scroller')
  let scrollInfos = []

  for (let el of allEls) {
    let computedStyle = window.getComputedStyle(el)

    if (computedStyle.overflowX === 'scroll') {
      let { scrollLeft } = el

      scrollInfos.push({
        el,
        scrollLeft,
        overflowY: computedStyle.overflowY,
        marginBottom: computedStyle.marginBottom
      })

      el.style.overflowX = 'visible' // need to clear X/Y to get true overflow
      el.style.overflowY = 'visible' // need to clear X/Y to get true overflow
      el.style.left = -scrollLeft + 'px' // simulate scrollLeft!
      el.style.marginBottom = ''
    }
  }

  return () => {
    for (let info of scrollInfos) {
      let { el } = info
      el.style.overflowX = 'scroll'
      el.style.overflowY = info.overflowY
      el.style.marginBottom = info.marginBottom
      el.style.left = ''
      el.scrollLeft = info.scrollLeft
    }
  }
}
