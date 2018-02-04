import * as exportHooks from 'fullcalendar'
import GcalEventSource from './GcalEventSource'

exportHooks.EventSourceParser.registerClass(GcalEventSource);

(exportHooks as any).GcalEventSource = GcalEventSource
