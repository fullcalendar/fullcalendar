import { EventSourceFetcher } from './event-source.js'
import { EventSourceRefined } from './event-source-parse.js'

export interface EventSourceDef<Meta> {
  ignoreRange?: boolean
  parseMeta: (refined: EventSourceRefined) => Meta | null
  fetch: EventSourceFetcher<Meta>
}
