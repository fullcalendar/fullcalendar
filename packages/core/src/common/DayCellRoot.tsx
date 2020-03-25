import { Ref, ComponentChildren, h } from '../vdom'
import { DateMarker } from '../datelib/marker'
import { DateRange } from '../datelib/date-range'
import { DateProfile } from '../DateProfileGenerator'
import ComponentContext from '../component/ComponentContext'
import { getDateMeta, getDayClassNames, DateMeta } from '../component/date-rendering'
import { formatDayString, createFormatter } from '../datelib/formatting'
import { buildHookClassNameGenerator, MountHook, ContentHook } from './render-hook'
import ViewApi from '../ViewApi'
import { buildNavLinkData } from './nav-link'
import { BaseComponent } from '../vdom-util'


const DAY_NUM_FORMAT = createFormatter({ day: 'numeric' })

interface DayCellHookPropOrigin {
  date: DateMarker // generic
  todayRange: DateRange
  showDayNumber?: boolean // defaults to false
  dateProfile?: DateProfile // for other/disabled days
}

export interface DayCellHookProps extends DateMeta {
  date: DateMarker // localized
  view: ViewApi
  dayNumberText: string
  navLinkData: string
  [extraProp: string]: any // so can include a resource
}


export interface DayCellRootProps {
  elRef?: Ref<any>
  date: DateMarker
  dateProfile?: DateProfile // for other/disabled days
  todayRange: DateRange
  showDayNumber?: boolean // defaults to false
  extraHookProps?: object
  children: (
    rootElRef: Ref<any>,
    classNames: string[],
    rootDataAttrs
  ) => ComponentChildren
}

export class DayCellRoot extends BaseComponent<DayCellRootProps> {

  buildClassNames = buildHookClassNameGenerator<DayCellHookProps>('dayCell')


  render(props: DayCellRootProps, state: {}, context: ComponentContext) {
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
    let customClassNames = this.buildClassNames(hookProps, context, null, hookPropsOrigin) // cacheBuster=hookPropsOrigin
    let standardClassNames = getDayClassNames(hookProps, context.theme) // can use publicHookProps as input
    let dataAttrs = { 'data-date': formatDayString(props.date) }

    return (
      <MountHook name='dayCell' hookProps={hookProps} elRef={props.elRef}>
        {(rootElRef) => props.children(rootElRef, standardClassNames.concat(customClassNames), dataAttrs)}
      </MountHook>
    )
  }

}


export interface DayCellContentProps {
  date: DateMarker
  dateProfile?: DateProfile // for other/disabled days
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

  render(props: DayCellContentProps, state: {}, context: ComponentContext) {
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
  let { dateEnv, options } = context
  let { date } = input
  let dayMeta = getDateMeta(date, input.todayRange, null, input.dateProfile)

  return {
    date: dateEnv.toDate(date),
    view: context.view,
    ...dayMeta,
    dayNumberText: input.showDayNumber ? dateEnv.format(date, DAY_NUM_FORMAT) : '',
    navLinkData: options.navLinks ? buildNavLinkData(date) : undefined
  }
}
