import * as exportHooks from './exports'

// for intentional side-effects
import './models/event-source/config'
import './theme/config'
import './basic/config'
import './agenda/config'
import './list/config'

import './reducers/json-feed-event-source'
import './reducers/array-event-source'

export = exportHooks
