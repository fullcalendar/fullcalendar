import { BaseComponent } from '../../vdom-util'
import { ContentContainer } from '../../content-inject/ContentContainer'
import type { DateFormatter, DateMarker } from '@full-ui/headless-calendar'
import type { DateMeta } from '../../component-util/date-rendering'
import { formatDayString } from '@full-ui/headless-calendar'
import type { ViewSpec } from '../../structs/view-spec'
import { WEEKDAY_ONLY_FORMAT, FULL_DATE_FORMAT } from '../../util/date-format'
import classNames from '../../styles.module.css'
import { ListDayHeaderInfo } from '../structs'
import { ListDayHeaderInner } from "./ListDayHeaderInner";

export interface ListDayHeaderProps {
  dayDate: DateMarker
  dateMeta: DateMeta
  forPrint: boolean
}

export class ListDayHeader extends BaseComponent<ListDayHeaderProps> {
  render() {
    let { options, viewApi, viewSpec } = this.context
    let { dayDate, dateMeta } = this.props
    let stickyHeaderDates = !this.props.forPrint

    const listDayFormat = options.listDayFormat ?? createDefaultListDayFormat(viewSpec)
    const listDayAltFormat = options.listDayAltFormat ?? createDefaultListDaySideFormat(viewSpec)

    let renderProps: ListDayHeaderInfo = {
      ...dateMeta,
      view: viewApi,
    }

    return (
      <ContentContainer
        tag="div"
        attrs={{
          'data-date': formatDayString(dayDate),
          ...(dateMeta.isToday ? { 'aria-current': 'date' } : {}),
        }}
        className={stickyHeaderDates ? classNames.stickyT : ''}
        renderProps={renderProps}
        generatorName={undefined}
        classNameGenerator={options.listDayHeaderClass}
        didMount={options.listDayHeaderDidMount}
        willUnmount={options.listDayHeaderWillUnmount}
      >
        {() => (
          <>
            {Boolean(listDayFormat) && (
              <ListDayHeaderInner
                dayDate={dayDate}
                dayFormat={listDayFormat}
                isTabbable
                dateMeta={dateMeta}
                level={0}
              />
            )}
            {Boolean(listDayAltFormat) && (
              <ListDayHeaderInner
                dayDate={dayDate}
                dayFormat={listDayAltFormat}
                isTabbable={false}
                dateMeta={dateMeta}
                level={1}
              />
            )}
          </>
        )}
      </ContentContainer>
    )
  }
}

function createDefaultListDayFormat({ durationUnit, singleUnit }: ViewSpec): DateFormatter {
  if (singleUnit === 'day') {
    return WEEKDAY_ONLY_FORMAT
  } else if (durationUnit === 'day' || singleUnit === 'week') {
    return WEEKDAY_ONLY_FORMAT
  } else {
    return FULL_DATE_FORMAT
  }
}

function createDefaultListDaySideFormat({ durationUnit, singleUnit }: ViewSpec): DateFormatter {
  if (singleUnit === 'day') {
    // nothing b/c full date is probably in headerToolbar
  } else if (durationUnit === 'day' || singleUnit === 'week') {
    return FULL_DATE_FORMAT
  } else {
    return WEEKDAY_ONLY_FORMAT
  }
}
