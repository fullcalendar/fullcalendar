import { Ref, ComponentChildren, h } from '../vdom'
import { DateMarker } from '../datelib/marker'
import { DateRange } from '../datelib/date-range'
import { DateProfile } from '../DateProfileGenerator'
import ComponentContext, { ComponentContextType } from '../component/ComponentContext'
import { getDayMeta, getDayClassNames } from '../component/date-rendering'
import { formatDayString } from '../datelib/formatting'
import { RenderHook } from './render-hook'

export interface DayRootProps {
  elRef?: Ref<any>
  date: DateMarker
  todayRange: DateRange
  dateProfile?: DateProfile // for other/disabled days
  extraMountProps?: any
  extraDynamicProps?: any
  children: (
    rootElRef: Ref<any>,
    classNames: string[],
    dataAttrs,
    innerElRef: Ref<any>,
    innerContent: ComponentChildren
  ) => ComponentChildren
}

export const DayRoot = (props: DayRootProps) => (
  <ComponentContextType.Consumer>
    {(context: ComponentContext) => {
      let dayMeta = getDayMeta(props.date, props.todayRange, props.dateProfile)
      let standardClassNames = getDayClassNames(dayMeta, context.theme)
      let dataAttrs = { 'data-date': formatDayString(props.date) }
      let mountProps = { date: context.dateEnv.toDate(props.date), view: context.view, ...props.extraMountProps }
      let dynamicProps = { ...mountProps, ...dayMeta, ...props.extraDynamicProps }

      return (
        <RenderHook name='date' mountProps={mountProps} dynamicProps={dynamicProps} elRef={props.elRef}>
          {(rootElRef, customClassNames, innerElRef, innerContent) => props.children(
            rootElRef, standardClassNames.concat(customClassNames), dataAttrs, innerElRef, innerContent
          )}
        </RenderHook>
      )
    }}
  </ComponentContextType.Consumer>
)
