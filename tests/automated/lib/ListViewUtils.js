const LIST_ITEM_CLASS = 'fc-list-item'
const LIST_ITEM_TITLE_CLASS = 'fc-list-item-title'
const LIST_ITEM_TIME_CLASS = 'fc-list-item-time'
const LIST_HEADING_CLASS = 'fc-list-heading'
const LIST_HEADING_MAIN_CLASS = 'fc-list-heading-main'
const LIST_HEADING_ALT_CLASS = 'fc-list-heading-alt'
const EMPTY_MESSAGE_CLASS = 'fc-list-empty'


export function getListEventEls() {
  return $(`.${LIST_ITEM_CLASS}`)
}

export function getListEventElsCount() {
  return getListEventEls().length
}

export function getListEventElTitleEl(el) {
  return el.find(`.${LIST_ITEM_TITLE_CLASS}`)
}

export function getListEventElTimeEl(el) {
  return el.find(`.${LIST_ITEM_TIME_CLASS}`)
}

export function getListEventElTitle(el) {
  return getListEventElTitleEl(el).text()
}

export function getListEventElTimeText(el) {
  return getListEventElTimeEl(el).text()
}

export function getListHeadingEls() {
  return $(`.${LIST_HEADING_CLASS}`)
}

export function getListHeadingElMainEl(el) {
  return el.find(`.${LIST_HEADING_MAIN_CLASS}`)
}

export function getListHeadingElAltEl(el) {
  return el.find(`.${LIST_HEADING_ALT_CLASS}`)
}

export function getListHeadingElMainElText(el) {
  return getListHeadingElMainEl(el).text()
}

export function getListHeadingElAltElText(el) {
  return getListHeadingElAltEl(el).text()
}

export function getEmptyMessageEls() {
  return $(`.${EMPTY_MESSAGE_CLASS}`)
}

export function getEmptyMessageElsCount() {
  return getEmptyMessageEls().length
}
