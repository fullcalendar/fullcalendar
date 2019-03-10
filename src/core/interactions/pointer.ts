
export interface PointerDragEvent {
  origEvent: UIEvent
  isTouch: boolean
  subjectEl: EventTarget
  pageX: number
  pageY: number
  deltaX: number
  deltaY: number
}
