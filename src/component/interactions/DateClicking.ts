import HitDragListener from '../../common/HitDragListener'
import Interaction from './Interaction'


export default class DateClicking extends Interaction {

  dragListener: any


  /*
  component must implement:
    - bindDateHandlerToEl
    - getSafeHitFootprint
    - getHitEl
  */
  constructor(component) {
    super(component)
    this.dragListener = this.buildDragListener()
  }


  end() {
    this.dragListener.endInteraction()
  }


  bindToEl(el) {
    let component = this.component
    let dragListener = this.dragListener

    component.bindDateHandlerToEl(el, 'mousedown', function(ev) {
      if (!component.shouldIgnoreMouse()) {
        dragListener.startInteraction(ev)
      }
    })

    component.bindDateHandlerToEl(el, 'touchstart', function(ev) {
      if (!component.shouldIgnoreTouch()) {
        dragListener.startInteraction(ev)
      }
    })
  }


  // Creates a listener that tracks the user's drag across day elements, for day clicking.
  buildDragListener() {
    let component = this.component
    let dayClickHit // null if invalid dayClick

    let dragListener = new HitDragListener(component, {
      scroll: this.opt('dragScroll'),
      interactionStart: () => {
        dayClickHit = dragListener.origHit
      },
      hitOver: (hit, isOrig, origHit) => {
        // if user dragged to another cell at any point, it can no longer be a dayClick
        if (!isOrig) {
          dayClickHit = null
        }
      },
      hitOut: () => { // called before mouse moves to a different hit OR moved out of all hits
        dayClickHit = null
      },
      interactionEnd: (ev, isCancelled) => {
        let componentFootprint

        if (!isCancelled && dayClickHit) {
          componentFootprint = component.getSafeHitFootprint(dayClickHit)

          if (componentFootprint) {
            this.view.triggerDayClick(componentFootprint, component.getHitEl(dayClickHit), ev)
          }
        }
      }
    })

    // because dragListener won't be called with any time delay, "dragging" will begin immediately,
    // which will kill any touchmoving/scrolling. Prevent this.
    dragListener.shouldCancelTouchScroll = false

    dragListener.scrollAlwaysKills = true

    return dragListener
  }

}
