import { ScrollerInterface } from "./ScrollerInterface";

export interface ScrollerSyncerClass {
  new(horizontal?: boolean): ScrollerSyncerInterface
}

export interface ScrollerSyncerInterface extends ScrollerInterface {
  handleChildren(scrollers: ScrollerInterface[]): void
  destroy(): void
  addScrollStartListener(handler: (isDevice: boolean) => void): void
  removeScrollStartListener(handler: (isDevice: boolean) => void): void
  addScrollListener(handler: (isDevice: boolean, scroll: number) => void): void
  removeScrollListener(handler: (isDevice: boolean, scroll: number) => void): void
}
