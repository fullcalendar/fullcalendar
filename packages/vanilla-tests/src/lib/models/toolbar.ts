import { userEvent } from 'vitest/browser'
import { waitForSettle } from '../settle'
import { queryPart, queryParts } from './events'
import { getParts } from '../parts'

export type ToolbarItem =
  | { type: 'title' }
  | { type: 'button', label: string }
  | { type: 'buttonGroup', children: ToolbarItem[] }

/*
The header or footer toolbar. Buttons are found by their accessible name (aria-label), which is
how FullCalendar labels them: ex: "Next Month", "This Week" (the today button), "Week view".
*/
export class ToolbarModel {
  constructor(public el: HTMLElement) {
  }

  static header(root: ParentNode): ToolbarModel | null {
    const el = queryPart(root, 'headerToolbar')
    return el ? new ToolbarModel(el) : null
  }

  static footer(root: ParentNode): ToolbarModel | null {
    const el = queryPart(root, 'footerToolbar')
    return el ? new ToolbarModel(el) : null
  }

  getTitleText(): string {
    return queryPart(this.el, 'toolbarTitle')!.textContent!.trim()
  }

  getButtons(): HTMLButtonElement[] {
    return queryParts(this.el, 'button') as HTMLButtonElement[]
  }

  /*
  The single button whose aria-label matches. Strings match exactly.
  */
  getButton(label: string | RegExp): HTMLButtonElement {
    const matches = this.getButtons().filter((el) => {
      const elLabel = getButtonLabel(el)
      return typeof label === 'string' ? elLabel === label : label.test(elLabel)
    })

    if (matches.length !== 1) {
      const labels = this.getButtons().map(getButtonLabel)
      throw new Error(`Expected one button labeled ${label}, found ${matches.length} among ${JSON.stringify(labels)}`)
    }
    return matches[0]
  }

  async clickButton(label: string | RegExp): Promise<void> {
    await userEvent.click(this.getButton(label))
    await waitForSettle()
  }

  /*
  The contents of each section (start, center, end), in DOM order.
  */
  getSectionItems(): ToolbarItem[][] {
    return queryParts(this.el, 'toolbarSection').map(getChildItems)
  }

  /*
  The section contents, ordered by their position on screen from left to right.
  */
  getSectionItemsByLeft(): ToolbarItem[][] {
    return queryParts(this.el, 'toolbarSection')
      .map((el) => ({ left: el.getBoundingClientRect().left, items: getChildItems(el) }))
      .sort((a, b) => a.left - b.left)
      .map((section) => section.items)
  }
}

export function getButtonLabel(el: HTMLElement): string {
  return el.getAttribute('aria-label') ?? el.textContent!.trim()
}

function getChildItems(parentEl: HTMLElement): ToolbarItem[] {
  return Array.from(parentEl.children).map((childEl): ToolbarItem => {
    const parts = getParts(childEl)

    if (parts.includes('toolbarTitle')) {
      return { type: 'title' }
    }
    if (parts.includes('button')) {
      return { type: 'button', label: getButtonLabel(childEl as HTMLElement) }
    }
    if (parts.includes('buttonGroup')) {
      return { type: 'buttonGroup', children: getChildItems(childEl as HTMLElement) }
    }
    throw new Error(`Unknown toolbar item <${childEl.tagName.toLowerCase()}>`)
  })
}
