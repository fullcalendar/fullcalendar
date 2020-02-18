
export default class ToolbarWrapper {

  constructor(private el: HTMLElement) {
  }

  getButtonEnabled(name) {
    let buttonEl = this.el.querySelector('.fc-' + name + '-button') as HTMLButtonElement
    return buttonEl && !buttonEl.disabled
  }

  getTitleText() {
    return this.el.querySelector('h2').innerText.trim()
  }

}
