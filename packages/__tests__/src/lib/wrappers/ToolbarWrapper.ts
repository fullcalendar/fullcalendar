export class ToolbarWrapper {
  constructor(private el: HTMLElement) {
  }

  getButtonEnabled(name) {
    let buttonEl = this.el.querySelector('.fc-' + name + '-button') as HTMLButtonElement
    return buttonEl && !buttonEl.disabled
  }

  getButtonInfo(name, iconPrefix = 'fc-icon') { // prefix doesnt have dash
    let el = this.getButtonEl(name)

    if (el) {
      let iconEl = el.querySelector(`.${iconPrefix}`)
      let iconNameMatch = iconEl && iconEl.className.match(new RegExp(`${iconPrefix}-([^ ]+)`))

      return {
        text: $(el).text(),
        iconEl,
        iconName: iconNameMatch ? iconNameMatch[1] : '',
      }
    }

    return null
  }

  getButtonEl(name) { // for custom or standard buttons
    return this.el.querySelector(`.fc-${name}-button`)
  }

  getTitleText() {
    return (this.el.querySelector('.fc-toolbar-title') as HTMLElement).innerText.trim()
  }

  getSectionContent(index) { // 0=start, 1=center, 2=end
    return processSectionItems(
      this.el.querySelectorAll('.fc-toolbar-chunk')[index] as HTMLElement,
    )
  }
}

function processSectionItems(sectionEl: HTMLElement) {
  let children = Array.prototype.slice.call(sectionEl.children) as HTMLElement[]

  return children.map((childEl) => {
    if (childEl.classList.contains('fc-button')) {
      return {
        type: 'button',
        name: childEl.className.match(/fc-(\w+)-button/)[1],
      }
    }
    if (childEl.classList.contains('fc-button-group')) {
      return {
        type: 'button-group',
        children: processSectionItems(childEl),
      }
    }
    if (childEl.nodeName === 'H2') {
      return {
        type: 'title',
      }
    }
    throw new Error('Unknown type of content in toolbar')
  })
}
