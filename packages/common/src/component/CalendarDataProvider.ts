import { Component, ComponentChildren } from '../vdom'
import { CalendarDataManager } from '../reducers/CalendarDataManager'
import { CalendarApi } from '../CalendarApi'
import { CalendarData } from '../reducers/data-types'


export interface CalendarDataProviderProps {
  optionOverrides: any
  calendarApi: CalendarApi
  children?: (data: CalendarData) => ComponentChildren
}


export class CalendarDataProvider extends Component<CalendarDataProviderProps, CalendarData> {

  dataManager: CalendarDataManager


  constructor(props: CalendarDataProviderProps) {
    super(props)

    this.dataManager = new CalendarDataManager({
      optionOverrides: props.optionOverrides,
      calendarApi: props.calendarApi,
      onData: this.handleData
    })
  }


  handleData = (data: CalendarData) => {
    if (!this.state) {
      this.state = data // first time, from constructor
    } else {
      this.setState(data)
    }
  }


  render() {
    return this.props.children(this.state)
  }


  componentDidUpdate() {
    this.dataManager.resetOptions(this.props.optionOverrides)
  }

}
