import { enableCursor, disableCursor, preventSelection, compareNumbers } from '../../util'
import HitDragListener from '../../common/HitDragListener'
import ComponentFootprint from '../../models/ComponentFootprint'
import UnzonedRange from '../../models/UnzonedRange'
import Interaction from './Interaction'


export default class DateSelecting extends Interaction {

  dragListener: any


  /*
  component must implement:
    - bindDateHandlerToEl
    - getSafeHitFootprint
    - renderHighlight
    - unrenderHighlight
  */
  constructor(component) {
    super(component)
    this.dragListener = this.buildDragListener()
  }


  end() {
    this.dragListener.endInteraction()
  }


  getDelay() {
    let delay = this.opt('selectLongPressDelay')

    if (delay == null) {
      delay = this.opt('longPressDelay') // fallback
    }

    return delay
  }


  bindToEl(el) {
    let component = this.component
    let dragListener = this.dragListener

    component.bindDateHandlerToEl(el, 'mousedown', (ev) => {
      if (this.opt('selectable') && !component.shouldIgnoreMouse()) {
        dragListener.startInteraction(ev, {
          distance: this.opt('selectMinDistance')
        })
      }
    })

    component.bindDateHandlerToEl(el, 'touchstart', (ev) => {
      if (this.opt('selectable') && !component.shouldIgnoreTouch()) {
        dragListener.startInteraction(ev, {
          delay: this.getDelay()
        })
      }
    })

    preventSelection(el)
  }


  // Creates a listener that tracks the user's drag across day elements, for day selecting.
  buildDragListener() {
    let component = this.component
    let selectionFootprint // null if invalid selection

    let dragListener = new HitDragListener(component, {
      scroll: this.opt('dragScroll'),
      interactionStart: () => {
        selectionFootprint = null
      },
      dragStart: (ev) => {
        this.view.unselect(ev) // since we could be rendering a new selection, we want to clear any old one
      },
      hitOver: (hit, isOrig, origHit) => {
        let origHitFootprint
        let hitFootprint

        if (origHit) { // click needs to have started on a hit

          origHitFootprint = component.getSafeHitFootprint(origHit)
          hitFootprint = component.getSafeHitFootprint(hit)

          if (origHitFootprint && hitFootprint) {
            selectionFootprint = this.computeSelection(origHitFootprint, hitFootprint)
          } else {
            selectionFootprint = null
          }

          if (selectionFootprint) {
            component.renderSelectionFootprint(selectionFootprint)
          } else if (selectionFootprint === false) {
            disableCursor()
          }
        }
      },
      hitOut: () => { // called before mouse moves to a different hit OR moved out of all hits
        selectionFootprint = null
        component.unrenderSelection()
      },
      hitDone: () => { // called after a hitOut OR before a dragEnd
        enableCursor()
      },
      interactionEnd: (ev, isCancelled) => {
        if (!isCancelled && selectionFootprint) {
          // the selection will already have been rendered. just report it
          this.view.reportSelection(selectionFootprint, ev)
        }
      }
    })

    return dragListener
  }


  // Given the first and last date-spans of a selection, returns another date-span object.
  // Subclasses can override and provide additional data in the span object. Will be passed to renderSelectionFootprint().
  // Will return false if the selection is invalid and this should be indicated to the user.
  // Will return null/undefined if a selection invalid but no error should be reported.
  computeSelection(footprint0, footprint1) {
    let wholeFootprint = this.computeSelectionFootprint(footprint0, footprint1)

    if (wholeFootprint && !this.isSelectionFootprintAllowed(wholeFootprint)) {
      return false
    }

    return wholeFootprint
  }


  // Given two spans, must return the combination of the two.
  // TODO: do this separation of concerns (combining VS validation) for event dnd/resize too.
  // Assumes both footprints are non-open-ended.
  computeSelectionFootprint(footprint0, footprint1) {
    let ms = [
      footprint0.unzonedRange.startMs,
      footprint0.unzonedRange.endMs,
      footprint1.unzonedRange.startMs,
      footprint1.unzonedRange.endMs
    ]

    ms.sort(compareNumbers)

    return new ComponentFootprint(
      new UnzonedRange(ms[0], ms[3]),
      footprint0.isAllDay
    )
  }


  isSelectionFootprintAllowed(componentFootprint) {
    return this.component.dateProfile.validUnzonedRange.containsRange(componentFootprint.unzonedRange) &&
      this.view.calendar.constraints.isSelectionFootprintAllowed(componentFootprint)
  }

}
