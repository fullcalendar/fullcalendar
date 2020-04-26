import { Ref, ComponentChildren, h } from '../vdom'
import { DateMarker } from '../datelib/marker'
import { DateRange } from '../datelib/date-range'
import { ComponentContext } from '../component/ComponentContext'
import { getDateMeta, getDayClassNames, DateMeta } from '../component/date-rendering'
import { createFormatter } from '../datelib/formatting'
import { formatDayString } from '../datelib/formatting-utils'
import { buildHookClassNameGenerator, MountHook, ContentHook } from './render-hook'
import { ViewApi } from '../ViewApi'
import { BaseComponent } from '../vdom-util'
import { DateProfile } from '../DateProfileGenerator'


const DAY_NUM_FORMAT = createFormatter({ day: 'numeric' })

interface DayCellHookPropOrigin {
  date: DateMarker // generic
  dateProfile: DateProfile
  todayRange: DateRange
  showDayNumber?: boolean // defaults to false
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
  extraHookProps?: object
  children: (
    rootElRef: Ref<any>,
    classNames: string[],
    rootDataAttrs,
    isDisabled: boolean
  ) => ComponentChildren
}

export class DayCellRoot extends BaseComponent<DayCellRootProps> {

  buildClassNames = buildHookClassNameGenerator<DayCellHookProps>('dayCell')


  render() {
    let { props, context } = this

    let hookPropsOrigin: DayCellHookPropOrigin = {
      date: props.date,
      dateProfile: props.dateProfile,
      todayRange: props.todayRange,
      showDayNumber: props.showDayNumber
    }
    let hookProps = { // it's weird to rely on this internally so much (isDisabled)
      ...massageHooksProps(hookPropsOrigin, context),
      ...props.extraHookProps
    }

    let classNames = getDayClassNames(hookProps, context.theme).concat(
      hookProps.isDisabled
        ? [] // don't use custom classNames if disalbed
        : this.buildClassNames(hookProps, context, null, hookPropsOrigin) // cacheBuster=hookPropsOrigin
    )

    let dataAttrs = hookProps.isDisabled ? {} : {
      'data-date': formatDayString(props.date)
    }

    return (
      <MountHook name='dayCell' hookProps={hookProps} elRef={props.elRef}>
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
  extraHookProps?: object
  defaultContent?: (hookProps: DayCellHookProps) => ComponentChildren
  children: (
    innerElRef: Ref<any>,
    innerContent: ComponentChildren
  ) => ComponentChildren
}

export class DayCellContent extends BaseComponent<DayCellContentProps> {

  render() {
    let { props, context } = this

    let hookPropsOrigin: DayCellHookPropOrigin = {
      date: props.date,
      dateProfile: props.dateProfile,
      todayRange: props.todayRange,
      showDayNumber: props.showDayNumber
    }
    let hookProps = {
      ...massageHooksProps(hookPropsOrigin, context),
      ...props.extraHookProps
    }

    return (
      <ContentHook name='dayCell' hookProps={hookProps} defaultContent={props.defaultContent}>
        {props.children}
      </ContentHook>
    )
  }

}


function massageHooksProps(input: DayCellHookPropOrigin, context: ComponentContext): DayCellHookProps {
  let { dateEnv } = context
  let { date } = input
  let dayMeta = getDateMeta(date, input.todayRange, null, input.dateProfile)

  return {
    date: dateEnv.toDate(date),
    view: context.viewApi,
    ...dayMeta,
    dayNumberText: input.showDayNumber ? dateEnv.format(date, DAY_NUM_FORMAT) : ''
  }
}
