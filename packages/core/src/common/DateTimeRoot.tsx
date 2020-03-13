import { DateMarker } from '../datelib/marker'
import ComponentContext, { ComponentContextType } from '../component/ComponentContext'
import { getDateMeta, getDateTimeClassNames } from '../component/date-rendering'
import { DateRange } from '../datelib/date-range'
import { ComponentChildren, Ref, h } from '../vdom'
import { RenderHook } from './render-hook'

export interface DateTimeRootProps {
  elRef?: Ref<any>
  date: DateMarker
  classNameScope: string
  nowDate?: DateMarker
  todayRange?: DateRange
  children: (
    rootElRef: Ref<any>,
    classNames: string[],
    dataAttrs: any,
    innerElRef: Ref<any>,
    innerContent: ComponentChildren
  ) => ComponentChildren
}

export const DateTimeRoot = (props: DateTimeRootProps) => (
  <ComponentContextType.Consumer>
    {(context: ComponentContext) => {
      let { dateEnv } = context
      let { date } = props
      let dateMeta = getDateMeta(props.date, props.todayRange, props.nowDate)
      let standardClassNames = getDateTimeClassNames(dateMeta, props.classNameScope, context.theme)
      let dataAttrs = { 'data-date': dateEnv.formatIso(date, { omitTimeZoneOffset: true }) }
      let mountProps = { date: dateEnv.toDate(props.date), view: context.view }
      let dynamicProps = { ...mountProps, ...dateMeta }

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
