import Mixin from '../../common/Mixin'
import DateClicking from './DateClicking'
import DateSelecting from './DateSelecting'
import EventPointing from './EventPointing'
import EventDragging from './EventDragging'
import EventResizing from './EventResizing'
import ExternalDropping from './ExternalDropping'

export default class StandardInteractionsMixin extends Mixin {
}

(StandardInteractionsMixin as any).prototype.dateClickingClass = DateClicking;
(StandardInteractionsMixin as any).prototype.dateSelectingClass = DateSelecting;
(StandardInteractionsMixin as any).prototype.eventPointingClass = EventPointing;
(StandardInteractionsMixin as any).prototype.eventDraggingClass = EventDragging;
(StandardInteractionsMixin as any).prototype.eventResizingClass = EventResizing;
(StandardInteractionsMixin as any).prototype.externalDroppingClass = ExternalDropping
