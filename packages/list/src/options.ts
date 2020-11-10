import {
  identity,
  Identity,
  ClassNamesGenerator,
  CustomContentGenerator,
  DidMountHandler,
  WillUnmountHandler,
  createFormatter,
  FormatterInput,
} from '@fullcalendar/common'

// public
import {
  NoEventsContentArg,
  NoEventsMountArg,
} from './api-type-deps'

export const OPTION_REFINERS = {
  listDayFormat: createFalsableFormatter, // defaults specified in list plugins
  listDaySideFormat: createFalsableFormatter, // "

  noEventsClassNames: identity as Identity<ClassNamesGenerator<NoEventsContentArg>>,
  noEventsContent: identity as Identity<CustomContentGenerator<NoEventsContentArg>>,
  noEventsDidMount: identity as Identity<DidMountHandler<NoEventsMountArg>>,
  noEventsWillUnmount: identity as Identity<WillUnmountHandler<NoEventsMountArg>>,

  // noEventsText is defined in base options
}

function createFalsableFormatter(input: FormatterInput | false) {
  return input === false ? null : createFormatter(input)
}
