import { Calendar } from '@fullcalendar/core'

export function waitEventDrag(calendar: Calendar, dragging: Promise<any>) {
  return new Promise<any>((resolve) => {
    let modifiedEvent: any = false

    calendar.on('eventDrop', (arg) => {
      modifiedEvent = arg.event
    })

    calendar.on('_noEventDrop', () => {
      resolve(false)
    })

    dragging.then(() => {
      setTimeout(() => { // wait for eventDrop to fire
        resolve(modifiedEvent)
      })
    })
  })
}

export function waitEventDrag2(calendar: Calendar, dragging: Promise<any>) {
  return new Promise<any>((resolve) => {
    let theArg: any = false

    calendar.on('eventDrop', (arg) => {
      theArg = arg
    })

    calendar.on('_noEventDrop', () => {
      resolve(false)
    })

    dragging.then(() => {
      setTimeout(() => { // wait for eventDrop to fire
        resolve(theArg)
      })
    })
  })
}

export function waitEventResize(calendar: Calendar, dragging: Promise<any>) {
  return new Promise<any>((resolve) => {
    let modifiedEvent: any = false

    calendar.on('eventResize', (arg) => {
      modifiedEvent = arg.event
    })

    dragging.then(() => {
      setTimeout(() => { // wait for eventResize to fire
        resolve(modifiedEvent)
      })
    })
  })
}

export function waitEventResize2(calendar: Calendar, dragging: Promise<any>) {
  return new Promise<any>((resolve) => {
    let theArg: any = false

    calendar.on('eventResize', (arg) => {
      theArg = arg
    })

    dragging.then(() => {
      setTimeout(() => { // wait for eventResize to fire
        resolve(theArg)
      })
    })
  })
}

export function waitDateSelect(calendar: Calendar, dragging: Promise<any>) {
  return new Promise<any>((resolve) => {
    let selectInfo = null

    calendar.on('select', (arg) => {
      selectInfo = arg
    })

    dragging.then(() => {
      setTimeout(() => { // wait for select to fire
        resolve(selectInfo)
      })
    })
  })
}

export function waitDateClick(calendar: Calendar, dragging: Promise<any>) {
  return new Promise<any>((resolve) => {
    let dateClickArg = null

    calendar.on('dateClick', (arg) => {
      dateClickArg = arg
    })

    dragging.then(() => {
      setTimeout(() => { // wait for dateClick to fire
        resolve(dateClickArg)
      })
    })
  })
}
