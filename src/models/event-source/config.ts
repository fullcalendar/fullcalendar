
import EventSourceParser from './EventSourceParser'

import ArrayEventSource from './ArrayEventSource'
import FuncEventSource from './FuncEventSource'
import JsonFeedEventSource from './JsonFeedEventSource'

EventSourceParser.registerClass(ArrayEventSource)
EventSourceParser.registerClass(FuncEventSource)
EventSourceParser.registerClass(JsonFeedEventSource)
