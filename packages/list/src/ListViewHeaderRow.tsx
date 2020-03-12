import {
  BaseComponent, DateMarker, createFormatter, ComponentContext, h, GotoAnchor,
  getDayMeta, DateRange, getDayClassNames, Ref, MountHook, ClassNamesHook, InnerContentHook
} from '@fullcalendar/core'


export interface ListViewHeaderRowProps {
  dayDate: DateMarker
  todayRange: DateRange
}


export default class ListViewHeaderRow extends BaseComponent<ListViewHeaderRowProps> {

  render(props: ListViewHeaderRowProps, state: {}, context: ComponentContext) {
    let { theme, dateEnv, options } = context
    let { dayDate } = props
    let mainFormat = createFormatter(options.listDayFormat) // TODO: cache
    let altFormat = createFormatter(options.listDayAltFormat) // TODO: cache
    let dayMeta = getDayMeta(dayDate, props.todayRange)
    let staticProps = {
      date: dayDate,
      view: context.view
    }
    let dynamicProps = {
      ...staticProps,
      ...dayMeta
    }
    let standardClassNames = [ 'fc-list-heading' ].concat(
      getDayClassNames(dayMeta, theme)
    )

    return (
      <MountHook
        name='dateCell'
        handlerProps={staticProps}
        content={(rootElRef: Ref<HTMLTableRowElement>) => (
          <ClassNamesHook
            name='dateCell'
            handlerProps={dynamicProps}
            content={(customClassNames) => (
              <tr
                ref={rootElRef}
                className={standardClassNames.concat(customClassNames).join(' ')}
                data-date={dateEnv.formatIso(dayDate, { omitTime: true })}
              >
                <td colSpan={3} className={theme.getClass('tableCellShaded')}>
                  {mainFormat &&
                    <GotoAnchor
                      navLinks={options.navLinks}
                      gotoOptions={dayDate}
                      extraAttrs={{ 'class': 'fc-list-heading-main' }}
                    >{dateEnv.format(dayDate, mainFormat)}</GotoAnchor>
                  }
                  <InnerContentHook
                    name='dateCell'
                    innerProps={dynamicProps}
                    outerContent={(innerContentParentRef, innerContent, anySpecified) => (
                      anySpecified && (
                        <div class='fc-list-heading-misc' ref={innerContentParentRef}>{innerContent}</div>
                      )
                    )}
                  />
                  {altFormat &&
                    <GotoAnchor
                      navLinks={options.navLinks}
                      gotoOptions={dayDate}
                      extraAttrs={{ 'class': 'fc-list-heading-alt' }}
                    >{dateEnv.format(dayDate, altFormat)}</GotoAnchor>
                  }
                </td>
              </tr>
            )}
          />
        )}
      />
    )
  }

}
