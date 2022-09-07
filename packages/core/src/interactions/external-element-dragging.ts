import { DateSpan } from '../structs/date-span'
import { DragMeta } from '../structs/drag-meta'

export type ExternalDefTransform = (dateSpan: DateSpan, dragMeta: DragMeta) => any
