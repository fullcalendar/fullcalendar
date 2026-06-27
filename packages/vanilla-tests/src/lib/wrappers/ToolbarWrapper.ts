import { findElements } from '../dom-misc'

export class ToolbarWrapper {
  constructor(private el: HTMLElement) {
  }

  getButtonEnabled(name) {
    let buttonEl = this.el.querySelector('.fc-' + name + '-button') as HTMLButtonElement
    return buttonEl && !buttonEl.disabled
  }

  getButtonInfo(name) {
    let el = this.getButtonEl(name)

    if (el) {
      return {
        text: $(el).text(),
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
      this.el.querySelectorAll('.fc-toolbar-section')[index] as HTMLElement,
    )
  }

  getSectionContentsByLeft() {
    const sectionInfos = []

    for (const sectionEl of findElements(this.el, '.fc-toolbar-section')) {
      const items = processSectionItems(sectionEl)
      const sectionInfo = { items, left: sectionEl.getBoundingClientRect().left }
      sectionInfos.push(sectionInfo)
    }

    sectionInfos.sort((a, b) => a.left - b.left)

    return sectionInfos.map((sectionInfo) => sectionInfo.items)
  }
}

function processSectionItems(sectionEl: HTMLElement) {
  let children = Array.prototype.slice.call(sectionEl.children) as HTMLElement[]

  return children.map((childEl) => {
    if (childEl.classList.contains('fc-button')) {
      return {
        type: 'button',
        name: extractButtonName(childEl.className),
      }
    }
    if (childEl.classList.contains('fc-button-group')) {
      return {
        type: 'button-group',
        children: processSectionItems(childEl),
      }
    }
    if (childEl.classList.contains('fc-toolbar-title')) {
      return {
        type: 'title',
      }
    }
    throw new Error('Unknown type of content in toolbar')
  })
}

function extractButtonName(className: string): string {
  const classNames = className.split(' ')

  for (const classNamePart of classNames) {
    const match = classNamePart.match(/^fc-(\w+)-button$/)
    if (match) {
      return match[1]
    }
  }

  throw new Error(`Unknown button class name: ${className}`)
}
