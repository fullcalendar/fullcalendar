import { ComponentChildren } from './vdom'
import { BaseComponent } from './vdom-util'
import { CssDimValue } from './scrollgrid/util'
import { CalendarOptions } from './options'
import { Theme } from './theme/Theme'
import { getCanVGrowWithinCell } from './util/table-styling'


export interface CalendarRootProps {
  options: CalendarOptions
  theme: Theme
  children: (classNames: string[], height: CssDimValue, isHeightAuto: boolean, forPrint: boolean) => ComponentChildren
}

interface CalendarRootState {
  forPrint: boolean
}


export class CalendarRoot extends BaseComponent<CalendarRootProps, CalendarRootState> {

  state = {
    forPrint: false
  }


  render() {
    let { props } = this
    let { options } = props
    let { forPrint } = this.state

    let isHeightAuto = !forPrint && options.height === 'auto' || options.contentHeight === 'auto'
    let height = (!isHeightAuto && options.height != null) ? options.height : ''

    let classNames: string[] = [
      'fc',
      forPrint ? 'fc-media-print' : 'fc-media-screen',
      'fc-direction-' + options.direction,
      props.theme.getClass('root')
    ]

    if (!getCanVGrowWithinCell()) {
      classNames.push('fc-liquid-hack')
    }

    return props.children(classNames, height, isHeightAuto, forPrint)
  }


  componentDidMount() {
    window.addEventListener('beforeprint', this.handleBeforePrint)
    window.addEventListener('afterprint', this.handleAfterPrint)
  }


  componentWillUnmount() {
    window.removeEventListener('beforeprint', this.handleBeforePrint)
    window.removeEventListener('afterprint', this.handleAfterPrint)
  }


  handleBeforePrint = () => {
    this.setState({ forPrint: true })
  }


  handleAfterPrint = () => {
    this.setState({ forPrint: false })
  }

}
