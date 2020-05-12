import { EventSourceFetcher } from './event-source'
import { EventSourceRefined } from './event-source-parse'

export interface EventSourceDef<Meta> {
  ignoreRange?: boolean
  parseMeta: (refined: EventSourceRefined) => Meta | null
  fetch: EventSourceFetcher<Meta>
}
