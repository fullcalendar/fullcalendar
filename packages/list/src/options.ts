import { identity, Identity, ClassNamesGenerator, CustomContentGenerator, DidMountHandler, WillUnmountHandler, createFormatter, FormatterInput } from '@fullcalendar/common'
import { NoEventsHookProps } from './ListView'

export const OPTION_REFINERS = {
  listDayFormat: createFalsableFormatter, // defaults specified in list plugins
  listDaySideFormat: createFalsableFormatter, // "

  noEventsClassNames: identity as Identity<ClassNamesGenerator<NoEventsHookProps>>,
  noEventsContent: identity as Identity<CustomContentGenerator<NoEventsHookProps>>,
  noEventsDidMount: identity as Identity<DidMountHandler<NoEventsHookProps>>,
  noEventsWillUnmount: identity as Identity<WillUnmountHandler<NoEventsHookProps>>

  // noEventsText is defined in base options
}

function createFalsableFormatter(input: FormatterInput | false) {
  return input === false ? null : createFormatter(input)
}
