export function findFcEvent(){
  return $(".fc-event")
}

export function findScroller(el){
  return el.find('.fc-scroller')
}

export function createCalElement(params){
  return $("<div>", Object.assign(params, {id:"calendar"}))
}