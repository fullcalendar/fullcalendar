
export function getTimeGridScroller() { // returns DOM node
  return document.querySelector('.scrollgrid .fc-body:last-child .fc-scroller')
}

export function allDaySlotDisplayed() {
  return Boolean($('.fc-timeGrid-view .fc-day-grid').length)
}


// about DAYGRID???...

const DAY_GRID_CLASS = 'fc-day-grid'

export function getDayGridSlotEls() {
  return $(`.${DAY_GRID_CLASS}`)
}

export function getDayGridSlotElsCount() {
  return getDayGridSlotEls().length
}
