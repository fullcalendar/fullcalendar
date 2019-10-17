const VIEW_CONTAINER_CLASS = 'fc-view-container'


export function getViewContainerEl() {
  return $(`.${VIEW_CONTAINER_CLASS}`)
}


export function getFirstDateEl() { // returns a DOM element
  return document.querySelector('.fc [data-date]')
}
