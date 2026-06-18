
export interface ScrollerInterface {
  x: number
  y: number
  scrollTo(options: { x?: number, y?: number }): void
  addScrollStartListener(handler: () => void): void
  removeScrollStartListener(handler: () => void): void
  addScrollEndListener(handler: (isDevice: boolean) => void): void
  removeScrollEndListener(handler: (isDevice: boolean) => void): void
}
