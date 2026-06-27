import { Emitter } from './common/Emitter'
import classNames from './styles.module.css'
import { CalendarListeners, CalendarOptions } from './options'
import { Component, type ReactElement } from 'react'
import { flushSync } from 'react-dom'
import { joinClassNames } from './util/html'
import { generateClassName } from './content-inject/ContentContainer'

export interface CalendarDisplayInfo {
  borderlessX: boolean
  borderlessTop: boolean
  borderlessBottom: boolean
}

export interface CalendarMediaRootProps {
  emitter: Emitter<Required<CalendarListeners>>
  children?: (forPrint: boolean) => ReactElement
}

interface CalendarMediaRootState {
  forPrint: boolean
}

export class CalendarMediaRoot extends Component<CalendarMediaRootProps, CalendarMediaRootState> {
  state: CalendarMediaRootState = {
    forPrint: false,
  }

  render() {
    return this.props?.children(this.state.forPrint)
  }

  componentDidMount() {
    const { props } = this
    const { emitter } = props

    emitter.on('_beforeprint', this.handleBeforePrint)
    emitter.on('_afterprint', this.handleAfterPrint)
  }

  componentWillUnmount() {
    const { props } = this
    const { emitter } = props

    emitter.off('_beforeprint', this.handleBeforePrint)
    emitter.off('_afterprint', this.handleAfterPrint)
  }

  private handleBeforePrint = () => {
    flushSync(() => {
      this.setState({ forPrint: true })
    })
  }

  private handleAfterPrint = () => {
    flushSync(() => {
      this.setState({ forPrint: false })
    })
  }
}

export function computeRootClassName(options: CalendarOptions, forPrint: boolean): string {
  let borderlessX = options.borderlessX ?? options.borderless
  let borderlessTop = options.borderlessTop ?? options.borderless
  let borderlessBottom = options.borderlessBottom ?? options.borderless

  const calendarDisplayData: CalendarDisplayInfo = {
    borderlessX: Boolean(borderlessX),
    borderlessTop: Boolean(borderlessTop),
    borderlessBottom: Boolean(borderlessBottom),
  }

  return joinClassNames(
    generateClassName(options.class, calendarDisplayData),
    generateClassName(options.className, calendarDisplayData),
    classNames.borderBoxRoot,
    classNames.isolate,
    classNames.flexCol,
    forPrint ? classNames.calendarPrintRoot : classNames.calendarScreenRoot,
  )
}
