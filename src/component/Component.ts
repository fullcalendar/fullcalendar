import { removeElement } from '../util/dom-manip'


// a force flag of `true` means rerender everything
export type RenderForceFlags = true | { [entity: string]: boolean }


export default abstract class Component {

  el: HTMLElement


  setElement(el: HTMLElement) {
    this.el = el
    this.bindGlobalHandlers()
  }


  removeElement() {
    this.unbindGlobalHandlers()

    removeElement(this.el)
    // NOTE: don't null-out this.el in case the View was destroyed within an API callback.
    // We don't null-out the View's other element references upon destroy,
    //  so we shouldn't kill this.el either.
  }


  bindGlobalHandlers() {
  }


  unbindGlobalHandlers() {
  }


  abstract render(state: any, forceFlags: RenderForceFlags)

}
