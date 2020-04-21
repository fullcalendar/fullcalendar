import { EventSourceFetcher } from './event-source'


export interface EventSourceDef {
  ignoreRange?: boolean
  parseMeta: (raw: any) => object | null
  fetch: EventSourceFetcher
}
