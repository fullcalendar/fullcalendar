import { removeElement } from '../util/dom-manip'
import Model from '../common/Model'

export default class Component extends Model {

  el: HTMLElement


  setElement(el: HTMLElement) {
    this.el = el
    this.bindGlobalHandlers()
    this.renderSkeleton()
    this.set('isInDom', true)
  }


  removeElement() {
    this.unset('isInDom')
    this.unrenderSkeleton()
    this.unbindGlobalHandlers()

    removeElement(this.el)
    // NOTE: don't null-out this.el in case the View was destroyed within an API callback.
    // We don't null-out the View's other element references upon destroy,
    //  so we shouldn't kill this.el either.
  }


  bindGlobalHandlers() {
    // subclasses can override
  }


  unbindGlobalHandlers() {
    // subclasses can override
  }


  /*
  NOTE: Can't have a `render` method. Read the deprecation notice in View::executeDateRender
  */


  // Renders the basic structure of the view before any content is rendered
  renderSkeleton() {
    // subclasses should implement
  }


  // Unrenders the basic structure of the view
  unrenderSkeleton() {
    // subclasses should implement
  }

}
