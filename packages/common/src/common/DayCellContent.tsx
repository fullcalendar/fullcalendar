import { Ref, ComponentChildren, createElement } from '../vdom'
import { DateMarker } from '../datelib/marker'
import { DateRange } from '../datelib/date-range'
import { getDateMeta, DateMeta } from '../component/date-rendering'
import { createFormatter } from '../datelib/formatting'
import { ContentHook } from './render-hook'
import { ViewApi } from '../ViewApi'
import { BaseComponent } from '../vdom-util'
import { DateProfile } from '../DateProfileGenerator'
import { Dictionary } from '../options'
import { DateEnv } from '../datelib/env'

const DAY_NUM_FORMAT = createFormatter({ day: 'numeric' })

export interface DayCellContentProps {
  date: DateMarker
  dateProfile: DateProfile
  todayRange: DateRange
  showDayNumber?: boolean // defaults to false
  extraHookProps?: Dictionary
  defaultContent?: (hookProps: DayCellContentArg) => ComponentChildren
  children: (
    innerElRef: Ref<any>,
    innerContent: ComponentChildren
  ) => ComponentChildren
}

export interface DayCellContentArg extends DateMeta {
  date: DateMarker // localized
  view: ViewApi
  dayNumberText: string
  [extraProp: string]: any // so can include a resource
}

export interface DayCellHookPropsInput {
  date: DateMarker // generic
  dateProfile: DateProfile
  todayRange: DateRange
  dateEnv: DateEnv
  viewApi: ViewApi
  showDayNumber?: boolean // defaults to false
  extraProps?: Dictionary // so can include a resource
}

export class DayCellContent extends BaseComponent<DayCellContentProps> {
  render() {
    let { props, context } = this
    let { options } = context
    let hookProps = refineDayCellHookProps({
      date: props.date,
      dateProfile: props.dateProfile,
      todayRange: props.todayRange,
      showDayNumber: props.showDayNumber,
      extraProps: props.extraHookProps,
      viewApi: context.viewApi,
      dateEnv: context.dateEnv,
    })

    return (
      <ContentHook
        hookProps={hookProps}
        content={options.dayCellContent}
        defaultContent={props.defaultContent}
      >
        {props.children}
      </ContentHook>
    )
  }
}

export function refineDayCellHookProps(raw: DayCellHookPropsInput): DayCellContentArg {
  let { date, dateEnv } = raw
  let dayMeta = getDateMeta(date, raw.todayRange, null, raw.dateProfile)

  return {
    date: dateEnv.toDate(date),
    view: raw.viewApi,
    ...dayMeta,
    dayNumberText: raw.showDayNumber ? dateEnv.format(date, DAY_NUM_FORMAT) : '',
    ...raw.extraProps,
  }
}
