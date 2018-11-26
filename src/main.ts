import * as exportHooks from './exports'

// for intentional side-effects
import './theme/config'

import './event-sources/array-event-source'
import './event-sources/func-event-source'
import './event-sources/json-feed-event-source'

import './structs/recurring-event-simple'

import BasicPlugin from './basic/config'
import AgendaPlugin from './agenda/config'
import ListPlugin from './list/config'

import Calendar from './Calendar'

Calendar.defaultPlugins.push(BasicPlugin, AgendaPlugin, ListPlugin)

export = exportHooks
