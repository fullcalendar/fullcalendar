import { describe, expect, it, vi } from 'vitest'
import { initCalendar, appendTestElement } from '../lib/calendar'
import { queryPart } from '../lib/models/events'
import { ToolbarModel } from '../lib/models/toolbar'
import { waitForSettle } from '../lib/settle'

describe('headerToolbar rendering', () => {
  const options = {
    initialView: 'dayGridMonth',
    initialDate: '2014-06-04',
  }

  it('renders the test default headerToolbar', async () => {
    const calendar = initCalendar(options) // the test plugin's start:'title', end:'today prev,next'
    await waitForSettle()

    expect(ToolbarModel.header(calendar.el)!.getSectionItems()).toEqual([
      [{ type: 'title' }],
      [],
      [
        { type: 'button', label: 'This Month' },
        {
          type: 'buttonGroup',
          children: [
            { type: 'button', label: 'Previous Month' },
            { type: 'button', label: 'Next Month' },
          ],
        },
      ],
    ])
  })

  it('renders a given headerToolbar', async () => {
    const calendar = initCalendar({
      ...options,
      headerToolbar: {
        left: 'next,prev',
        center: 'prevYear today nextYear timeGridDay,timeGridWeek',
        right: 'title',
      },
    })
    await waitForSettle()

    expect(ToolbarModel.header(calendar.el)!.getSectionItems()).toEqual([
      [
        {
          type: 'buttonGroup',
          children: [
            { type: 'button', label: 'Next Month' },
            { type: 'button', label: 'Previous Month' },
          ],
        },
      ],
      [
        { type: 'button', label: 'Previous Year' },
        { type: 'button', label: 'This Month' },
        { type: 'button', label: 'Next Year' },
        {
          type: 'buttonGroup',
          children: [
            { type: 'button', label: 'Day view' },
            { type: 'button', label: 'Week view' },
          ],
        },
      ],
      [{ type: 'title' }],
    ])
  })

  it.each(['ltr', 'rtl'] as const)('renders left and right literally (%s)', async (direction) => {
    const calendar = initCalendar({
      ...options,
      direction,
      headerToolbar: { left: 'prev', center: 'today', right: 'next' },
    })
    await waitForSettle()

    expect(ToolbarModel.header(calendar.el)!.getSectionItemsByLeft()).toEqual([
      [{ type: 'button', label: 'Previous Month' }],
      [{ type: 'button', label: 'This Month' }],
      [{ type: 'button', label: 'Next Month' }],
    ])
  })

  it.each([
    ['an object', {}, true],
    ['false', { headerToolbar: false as const }, false],
  ])('when %s, renders a toolbar that labels the view: %s', async (_desc, extraOptions, hasToolbar) => {
    const calendar = initCalendar({ ...options, ...extraOptions })
    await waitForSettle()

    const toolbar = ToolbarModel.header(calendar.el)
    const viewEl = queryPart(calendar.el, 'view')!
    expect(Boolean(toolbar)).toBe(hasToolbar)

    if (hasToolbar) {
      const titleEl = queryPart(toolbar!.el, 'toolbarTitle')!
      expect(viewEl.getAttribute('aria-labelledby')).toBe(titleEl.id)
    } else {
      expect(viewEl.hasAttribute('aria-labelledby')).toBe(false)
    }
  })

  it('can be removed and restored with setOption', async () => {
    const calendar = initCalendar(options)
    await waitForSettle()
    expect(ToolbarModel.header(calendar.el)).toBeTruthy()

    calendar.setOption('headerToolbar', false)
    await waitForSettle()
    expect(ToolbarModel.header(calendar.el)).toBe(null)

    calendar.setOption('headerToolbar', { left: 'next' })
    await waitForSettle()
    expect(ToolbarModel.header(calendar.el)!.getSectionItems()).toEqual([
      [{ type: 'button', label: 'Next Month' }],
      [],
      [],
    ])
  })

  it('renders buttons with type="button"', async () => {
    const calendar = initCalendar({
      ...options,
      headerToolbar: { left: 'today', center: 'title', right: 'prev,next' },
    })
    await waitForSettle()

    const buttons = ToolbarModel.header(calendar.el)!.getButtons()
    expect(buttons).toHaveLength(3)
    for (const buttonEl of buttons) {
      expect(buttonEl.getAttribute('type')).toBe('button')
    }
  })

  it('doesn\'t submit an enclosing form when a button is clicked', async () => {
    const formEl = appendTestElement(document.createElement('form'))
    const calendarEl = formEl.appendChild(document.createElement('div'))
    const onSubmit = vi.fn((ev: Event) => ev.preventDefault())
    formEl.addEventListener('submit', onSubmit)

    const calendar = initCalendar({
      ...options,
      headerToolbar: { left: 'prev,next', right: 'title' },
    }, calendarEl)
    await waitForSettle()

    await ToolbarModel.header(calendar.el)!.clickButton('Next Month')

    expect(calendar.getDate().toISOString()).toBe('2014-07-01T00:00:00.000Z') // the click went through
    expect(onSubmit).not.toHaveBeenCalled()
  })
})

describe('footerToolbar rendering', () => {
  const options = {
    initialView: 'timeGridWeek',
    initialDate: '2014-06-04',
  }

  it('renders when given', async () => {
    const calendar = initCalendar({
      ...options,
      footerToolbar: {
        left: 'next,prev',
        center: 'prevYear today nextYear timeGridDay,timeGridWeek',
        right: 'title',
      },
    })
    await waitForSettle()

    expect(ToolbarModel.footer(calendar.el)!.getSectionItems()).toEqual([
      [
        {
          type: 'buttonGroup',
          children: [
            { type: 'button', label: 'Next Week' },
            { type: 'button', label: 'Previous Week' },
          ],
        },
      ],
      [
        { type: 'button', label: 'Previous Year' },
        { type: 'button', label: 'This Week' },
        { type: 'button', label: 'Next Year' },
        {
          type: 'buttonGroup',
          children: [
            { type: 'button', label: 'Day view' },
            { type: 'button', label: 'Week view' },
          ],
        },
      ],
      [{ type: 'title' }],
    ])

    // the footer comes after the view
    const viewEl = queryPart(calendar.el, 'view')!
    const footerEl = ToolbarModel.footer(calendar.el)!.el
    expect(viewEl.compareDocumentPosition(footerEl) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('isn\'t rendered when false', async () => {
    const calendar = initCalendar({ ...options, footerToolbar: false })
    await waitForSettle()

    expect(ToolbarModel.header(calendar.el)).toBeTruthy()
    expect(ToolbarModel.footer(calendar.el)).toBe(null)
  })

  it('can be removed with setOption', async () => {
    const calendar = initCalendar({ ...options, footerToolbar: { left: 'next,prev' } })
    await waitForSettle()
    expect(ToolbarModel.footer(calendar.el)).toBeTruthy()

    calendar.setOption('footerToolbar', false)
    await waitForSettle()
    expect(ToolbarModel.footer(calendar.el)).toBe(null)
  })
})

describe('custom buttons', () => {
  it('render their text and call their click handler', async () => {
    const click = vi.fn()
    const calendar = initCalendar({
      initialView: 'dayGridMonth',
      initialDate: '2014-06-04',
      buttons: {
        mybutton: { text: 'asdf', click },
      },
      headerToolbar: { left: 'mybutton', center: '', right: '' },
    })
    await waitForSettle()

    const toolbar = ToolbarModel.header(calendar.el)!
    const buttonEl = toolbar.getButton('asdf') // labeled by its text when it has no hint
    expect(buttonEl.textContent).toBe('asdf')

    await toolbar.clickButton('asdf')
    expect(click).toHaveBeenCalledTimes(1)
  })

  it('can be labeled with a hint', async () => {
    const calendar = initCalendar({
      initialView: 'dayGridMonth',
      buttons: {
        mybutton: { text: 'asdf', hint: 'My button' },
      },
      headerToolbar: { left: 'mybutton', center: '', right: '' },
    })
    await waitForSettle()

    expect(ToolbarModel.header(calendar.el)!.getButton('My button').textContent).toBe('asdf')
  })
})
