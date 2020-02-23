
export default class ToolbarWrapper {

  constructor(private el: HTMLElement) {
  }


  getButtonEnabled(name) {
    let buttonEl = this.el.querySelector('.fc-' + name + '-button') as HTMLButtonElement
    return buttonEl && !buttonEl.disabled
  }


  getButtonInfo(name, iconPrefix='fc-icon') { // prefix doesnt have dash
    let el = this.getButtonEl(name)

    if (el) {
      let iconEl = el.querySelector(`.${iconPrefix}`)
      let iconNameMatch = iconEl && iconEl.className.match(new RegExp(`${iconPrefix}-(\\w+)`))

      return {
        text: $(el).text(),
        iconEl,
        iconName: iconNameMatch ? iconNameMatch[1] : ''
      }
    }
  }


  getButtonEl(name) { // for custom or standard buttons
    return this.el.querySelector(`.fc-${name}-button`)
  }


  getTitleText() {
    return this.el.querySelector('h2').innerText.trim()
  }

}
