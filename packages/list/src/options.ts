import { identity, Identity, ClassNameGenerator, CustomContentGenerator, DidMountHandler, WillUnmountHandler, createFormatter, FormatterInput } from '@fullcalendar/common'
import { NoEventsHookProps } from './ListView'

export const OPTION_REFINERS = {
  noEventsText: String,

  noEventsClassNames: identity as Identity<ClassNameGenerator<NoEventsHookProps>>,
  noEventsContent: identity as Identity<CustomContentGenerator<NoEventsHookProps>>,
  noEventsDidMount: identity as Identity<DidMountHandler<NoEventsHookProps>>,
  noEventsWillUnmount: identity as Identity<WillUnmountHandler<NoEventsHookProps>>,

  listDayFormat: createFalsableFormatter, // defaults specified in list plugins
  listDaySideFormat: createFalsableFormatter, // "
}

function createFalsableFormatter(input: FormatterInput | false) {
  return input === false ? null : createFormatter(input)
}
