import { Ref, ComponentChildren, createElement } from '../vdom'
import { DateMarker } from '../datelib/marker'
import { DateRange } from '../datelib/date-range'
import { getDayClassNames, DateMeta } from '../component/date-rendering'
import { formatDayString } from '../datelib/formatting-utils'
import { buildClassNameNormalizer, MountHook, MountArg } from './render-hook'
import { ViewApi } from '../ViewApi'
import { BaseComponent } from '../vdom-util'
import { DateProfile } from '../DateProfileGenerator'
import { memoizeObjArg } from '../util/memoize'
import { Dictionary } from '../options'
import { refineDayCellHookProps } from './DayCellContent'

export interface DayCellContentArg extends DateMeta {
  date: DateMarker // localized
  view: ViewApi
  dayNumberText: string
  [extraProp: string]: any // so can include a resource
}
export type DayCellMountArg = MountArg<DayCellContentArg>

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
  refineHookProps = memoizeObjArg(refineDayCellHookProps)
  normalizeClassNames = buildClassNameNormalizer<DayCellContentArg>()

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
      dateEnv: context.dateEnv,
    })

    let classNames = getDayClassNames(hookProps, context.theme).concat(
      hookProps.isDisabled
        ? [] // don't use custom classNames if disabled
        : this.normalizeClassNames(options.dayCellClassNames, hookProps),
    )

    let dataAttrs = hookProps.isDisabled ? {} : {
      'data-date': formatDayString(props.date),
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
