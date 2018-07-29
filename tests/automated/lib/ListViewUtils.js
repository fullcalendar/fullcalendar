const LIST_ITEM_CLASS = 'fc-list-item'
const LIST_ITEM_TITLE_CLASS = 'fc-list-item-title'
const LIST_ITEM_TIME_CLASS = 'fc-list-item-time'
const LIST_HEADING_CLASS = 'fc-list-heading'
const LIST_HEADING_MAIN_CLASS = 'fc-list-heading-main'
const LIST_HEADING_ALT_CLASS = 'fc-list-heading-alt'
const EMPTY_MESSAGE_CLASS = 'fc-list-empty'


export function getListItemEls(){
  return $(`.${LIST_ITEM_CLASS}`)
}

export function getListItemElsCount(){
  return getListItemEls().length
}

export function getListItemElTitleEl(el){
  return el.find(`.${LIST_ITEM_TITLE_CLASS}`)
}

export function getListItemElTimeEl(el){
  return el.find(`.${LIST_ITEM_TIME_CLASS}`)
}

export function getListItemElTitleElText(el) {
  return getListItemElTitleEl(el).text()
}

export function getListItemElTimeElText(el){
  return getListItemElTimeEl(el).text()
}

export function getListHeadingEls() {
  return $(`.${LIST_HEADING_CLASS}`)
}

export function getListHeadingElMainEl(el){
  return el.find(`.${LIST_HEADING_MAIN_CLASS}`)
}

export function getListHeadingElAltEl(el){
  return el.find(`.${LIST_HEADING_ALT_CLASS}`)
}

export function getListHeadingElMainElText(el) {
  return getListHeadingElMainEl(el).text()
}

export function getListHeadingElAltElText(el) {
  return getListHeadingElAltEl(el).text()
}

export function getEmptyMessageEls(){
  return $(`.${EMPTY_MESSAGE_CLASS}`)
}

export function getEmptyMessageElsCount(){
  return getEmptyMessageEls().length
}
