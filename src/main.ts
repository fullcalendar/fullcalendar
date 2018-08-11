import * as exportHooks from './exports'

// for intentional side-effects
import './theme/config'
import './basic/config'
import './agenda/config'
import './list/config'

import './event-sources/array-event-source'
import './event-sources/func-event-source'
import './event-sources/json-feed-event-source'

import './structs/recurring-event-simple'

export = exportHooks
