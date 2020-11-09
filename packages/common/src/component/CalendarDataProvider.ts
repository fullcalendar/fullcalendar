import { Component, ComponentChildren } from '../vdom'
import { CalendarDataManager } from '../reducers/CalendarDataManager'
import { CalendarApi } from '../CalendarApi'
import { CalendarData } from '../reducers/data-types'

export interface CalendarDataProviderProps {
  optionOverrides: any
  calendarApi: CalendarApi
  children?: (data: CalendarData) => ComponentChildren
}

// TODO: move this to react plugin?
export class CalendarDataProvider extends Component<CalendarDataProviderProps, CalendarData> {
  dataManager: CalendarDataManager

  constructor(props: CalendarDataProviderProps) {
    super(props)

    this.dataManager = new CalendarDataManager({
      optionOverrides: props.optionOverrides,
      calendarApi: props.calendarApi,
      onData: this.handleData,
    })
  }

  handleData = (data: CalendarData) => {
    if (!this.dataManager) { // still within initial run, before assignment in constructor
      // eslint-disable-next-line react/no-direct-mutation-state
      this.state = data // can't use setState yet
    } else {
      this.setState(data)
    }
  }

  render() {
    return this.props.children(this.state)
  }

  componentDidUpdate(prevProps: CalendarDataProviderProps) {
    let newOptionOverrides = this.props.optionOverrides

    if (newOptionOverrides !== prevProps.optionOverrides) { // prevent recursive handleData
      this.dataManager.resetOptions(newOptionOverrides)
    }
  }
}
