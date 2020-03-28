
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
      let iconNameMatch = iconEl && iconEl.className.match(new RegExp(`${iconPrefix}-([^ ]+)`))

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
    return (this.el.querySelector('.fc-toolbar-title') as HTMLElement).innerText.trim()
  }


  getSectionContent(sectionName) { // sectionName like left/center/right
    let sectionEl = this.el.querySelector(`.fc-${sectionName}`) as HTMLElement

    return processSectionItems(sectionEl)
  }

}


function processSectionItems(sectionEl: HTMLElement) {
  let children = Array.prototype.slice.call(sectionEl.children) as HTMLElement[]

  return children.map((childEl) => {
    if (childEl.classList.contains('fc-button')) {
      return {
        type: 'button',
        name: childEl.className.match(/fc-(\w+)-button/)[1]
      }
    } else if (childEl.classList.contains('fc-button-group')) {
      return {
        type: 'button-group',
        children: processSectionItems(childEl)
      }
    } else if (childEl.nodeName === 'H2') {
      return {
        type: 'title'
      }
    } else {
      throw new Error('Unknown type of content in header')
    }
  })
}
