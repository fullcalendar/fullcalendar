
export default class Interaction {

  view: any
  component: any


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
