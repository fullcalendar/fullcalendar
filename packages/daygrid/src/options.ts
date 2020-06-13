import {
  identity, Identity, ClassNamesGenerator, CustomContentGenerator, DidMountHandler, WillUnmountHandler
} from '@fullcalendar/common'

// public
import {
  MoreLinkContentArg,
  MoreLinkMountArg,
  MoreLinkAction
} from './api-type-deps'

export const OPTION_REFINERS = {
  moreLinkClick: identity as Identity<MoreLinkAction>,
  moreLinkClassNames: identity as Identity<ClassNamesGenerator<MoreLinkContentArg>>,
  moreLinkContent: identity as Identity<CustomContentGenerator<MoreLinkContentArg>>,
  moreLinkDidMount: identity as Identity<DidMountHandler<MoreLinkMountArg>>,
  moreLinkWillUnmount: identity as Identity<WillUnmountHandler<MoreLinkMountArg>>,
}
