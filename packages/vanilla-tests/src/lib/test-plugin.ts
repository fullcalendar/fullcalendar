import { PluginInput } from 'fullcalendar'
import { standardPartsPlugin } from './parts'

/*
Option defaults every test calendar gets, on top of the classic theme, and the parts plugin that marks
elements for tests to find (see parts.ts).
*/
export default {
  name: 'tests',
  deps: [standardPartsPlugin],
  optionDefaults: {
    headerToolbar: {
      start: 'title',
      end: 'today prev,next',
    },
  },
} as PluginInput
