import { DateSpan } from '../structs/date-span.js'
import { DragMeta } from '../structs/drag-meta.js'

export type ExternalDefTransform = (dateSpan: DateSpan, dragMeta: DragMeta) => any
