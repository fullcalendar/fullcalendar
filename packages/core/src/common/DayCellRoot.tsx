import { Ref, ComponentChildren, h } from '../vdom'
import { DateMarker } from '../datelib/marker'
import { DateRange } from '../datelib/date-range'
import { DateProfile } from '../DateProfileGenerator'
import ComponentContext, { ComponentContextType } from '../component/ComponentContext'
import { getDateMeta, getDayClassNames, DateMeta } from '../component/date-rendering'
import { formatDayString, createFormatter } from '../datelib/formatting'
import { RenderHook } from './render-hook'
import ViewApi from '../ViewApi'
import { buildNavLinkData } from './nav-link'


export interface DayCellRootProps {
  elRef?: Ref<any>
  date: DateMarker
  todayRange: DateRange
  showDayNumber?: boolean // defaults to false
  dateProfile?: DateProfile // for other/disabled days
  extraMountProps?: object
  extraDynamicProps?: object
  defaultInnerContent?: (dynamicProps: DayCellDynamicProps) => ComponentChildren
  children: (
    rootElRef: Ref<any>,
    classNames: string[],
    rootDataAttrs,
    innerElRef: Ref<any>,
    innerContent: ComponentChildren
  ) => ComponentChildren
}

export interface DayCellMountProps {
  date: DateMarker
  view: ViewApi
  [extraProp: string]: any // so can include a resource
}

export type DayCellDynamicProps = DayCellMountProps & DateMeta & {
  dayNumberText: string
  navLinkData: string
}

const DAY_NUM_FORMAT = createFormatter({ day: 'numeric' })


export const DayCellRoot = (props: DayCellRootProps) => (
  <ComponentContextType.Consumer>
    {(context: ComponentContext) => {
      let { dateEnv, options } = context
      let { date } = props
      let dayMeta = getDateMeta(date, props.todayRange, null, props.dateProfile)
      let standardClassNames = getDayClassNames(dayMeta, context.theme)
      let dataAttrs = { 'data-date': formatDayString(date) }

      let mountProps: DayCellMountProps = {
        date: dateEnv.toDate(date),
        view: context.view,
        ...props.extraMountProps
      }

      let dynamicProps: DayCellDynamicProps = {
        ...mountProps,
        ...dayMeta,
        dayNumberText: props.showDayNumber ? dateEnv.format(date, DAY_NUM_FORMAT) : '',
        navLinkData: options.navLinks ? buildNavLinkData(date) : undefined,
        ...props.extraDynamicProps
      }

      return (
        <RenderHook name='dayCell'
          mountProps={mountProps}
          dynamicProps={dynamicProps}
          defaultInnerContent={props.defaultInnerContent}
          elRef={props.elRef}
        >
          {(rootElRef, customClassNames, innerElRef, innerContent) => props.children(
            rootElRef, standardClassNames.concat(customClassNames), dataAttrs, innerElRef, innerContent
          )}
        </RenderHook>
      )
    }}
  </ComponentContextType.Consumer>
)
