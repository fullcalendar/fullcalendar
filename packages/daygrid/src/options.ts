import {
  identity, Identity, ClassNamesGenerator, CustomContentGenerator, DidMountHandler, WillUnmountHandler
} from '@fullcalendar/common'

// public
import {
  MoreLinkHookProps,
  MoreLinkAction
} from './api-type-deps'

export const OPTION_REFINERS = {
  moreLinkClick: identity as Identity<MoreLinkAction>,
  moreLinkClassNames: identity as Identity<ClassNamesGenerator<MoreLinkHookProps>>,
  moreLinkContent: identity as Identity<CustomContentGenerator<MoreLinkHookProps>>,
  moreLinkDidMount: identity as Identity<DidMountHandler<MoreLinkHookProps>>,
  moreLinkWillUnmount: identity as Identity<WillUnmountHandler<MoreLinkHookProps>>,
}
