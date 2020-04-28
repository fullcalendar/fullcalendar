import { Component, ComponentChildren } from '../vdom'
import { CalendarDataProvider } from '../reducers/CalendarDataProvider'
import { CalendarApi } from '../CalendarApi'
import { CalendarData } from '../reducers/data-types'


export interface CalendarDataProviderComponentProps {
  optionOverrides: any
  calendarApi: CalendarApi
  children?: (data: CalendarData) => ComponentChildren
}


export class CalendarDataProviderComponent extends Component<CalendarDataProviderComponentProps, CalendarData> {

  dataProvider: CalendarDataProvider


  constructor(props: CalendarDataProviderComponentProps) {
    super(props)

    this.dataProvider = new CalendarDataProvider({
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
    this.dataProvider.resetOptions(this.props.optionOverrides)
  }

}
