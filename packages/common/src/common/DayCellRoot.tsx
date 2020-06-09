import { Ref, ComponentChildren, createElement } from '../vdom'
import { DateMarker } from '../datelib/marker'
import { DateRange } from '../datelib/date-range'
import { getDateMeta, getDayClassNames, DateMeta } from '../component/date-rendering'
import { createFormatter } from '../datelib/formatting'
import { formatDayString } from '../datelib/formatting-utils'
import { buildClassNameNormalizer, MountHook, ContentHook } from './render-hook'
import { ViewApi } from '../ViewApi'
import { BaseComponent } from '../vdom-util'
import { DateProfile } from '../DateProfileGenerator'
import { memoizeObjArg } from '../util/memoize'
import { DateEnv } from '../datelib/env'
import { Dictionary } from '../options'


const DAY_NUM_FORMAT = createFormatter({ day: 'numeric' })

interface DayCellHookPropsInput {
  date: DateMarker // generic
  dateProfile: DateProfile
  todayRange: DateRange
  dateEnv: DateEnv
  viewApi: ViewApi
  showDayNumber?: boolean // defaults to false
  extraProps?: Dictionary // so can include a resource
}

export interface DayCellHookProps extends DateMeta {
  date: DateMarker // localized
  view: ViewApi
  dayNumberText: string
  [extraProp: string]: any // so can include a resource
}


export interface DayCellRootProps {
  elRef?: Ref<any>
  date: DateMarker
  dateProfile: DateProfile
  todayRange: DateRange
  showDayNumber?: boolean // defaults to false
  extraHookProps?: Dictionary
  children: (
    rootElRef: Ref<any>,
    classNames: string[],
    rootDataAttrs,
    isDisabled: boolean
  ) => ComponentChildren
}

export class DayCellRoot extends BaseComponent<DayCellRootProps> {

  refineHookProps = memoizeObjArg(refineHookProps)
  normalizeClassNames = buildClassNameNormalizer<DayCellHookProps>()


  render() {
    let { props, context } = this
    let { options } = context
    let hookProps = this.refineHookProps({
      date: props.date,
      dateProfile: props.dateProfile,
      todayRange: props.todayRange,
      showDayNumber: props.showDayNumber,
      extraProps: props.extraHookProps,
      viewApi: context.viewApi,
      dateEnv: context.dateEnv
    })

    let classNames = getDayClassNames(hookProps, context.theme).concat(
      hookProps.isDisabled
        ? [] // don't use custom classNames if disabled
        : this.normalizeClassNames(options.dayCellClassNames, hookProps)
    )

    let dataAttrs = hookProps.isDisabled ? {} : {
      'data-date': formatDayString(props.date)
    }

    return (
      <MountHook
        hookProps={hookProps}
        didMount={options.dayCellDidMount}
        willUnmount={options.dayCellWillUnmount}
        elRef={props.elRef}
      >
        {(rootElRef) => props.children(rootElRef, classNames, dataAttrs, hookProps.isDisabled)}
      </MountHook>
    )
  }

}


export interface DayCellContentProps {
  date: DateMarker
  dateProfile: DateProfile
  todayRange: DateRange
  showDayNumber?: boolean // defaults to false
  extraHookProps?: Dictionary
  defaultContent?: (hookProps: DayCellHookProps) => ComponentChildren
  children: (
    innerElRef: Ref<any>,
    innerContent: ComponentChildren
  ) => ComponentChildren
}

export class DayCellContent extends BaseComponent<DayCellContentProps> {

  render() {
    let { props, context } = this
    let { options } = context
    let hookProps = refineHookProps({
      date: props.date,
      dateProfile: props.dateProfile,
      todayRange: props.todayRange,
      showDayNumber: props.showDayNumber,
      extraProps: props.extraHookProps,
      viewApi: context.viewApi,
      dateEnv: context.dateEnv
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


function refineHookProps(raw: DayCellHookPropsInput): DayCellHookProps {
  let { date, dateEnv } = raw
  let dayMeta = getDateMeta(date, raw.todayRange, null, raw.dateProfile)

  return {
    date: dateEnv.toDate(date),
    view: raw.viewApi,
    ...dayMeta,
    dayNumberText: raw.showDayNumber ? dateEnv.format(date, DAY_NUM_FORMAT) : '',
    ...raw.extraProps
  }
}
