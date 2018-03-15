import InteractiveDateComponent from '../InteractiveDateComponent'

export default class Interaction {

  view: any
  component: InteractiveDateComponent


  constructor(component) {
    this.view = component._getView()
    this.component = component
  }


  opt(name) {
    return this.view.opt(name)
  }


  end() {
    // subclasses can implement
  }

}
