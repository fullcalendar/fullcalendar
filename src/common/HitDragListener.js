
/* Tracks mouse movements over a component and raises events about which hit the mouse is over.
------------------------------------------------------------------------------------------------------------------------
options:
- subjectEl
- subjectCenter
*/

var HitDragListener = DragListener.extend({

	component: null, // converts coordinates to hits
		// methods: prepareHits, releaseHits, queryHit

	origHit: null, // the hit the mouse was over when listening started
	hit: null, // the hit the mouse is over
	coordAdjust: null, // delta that will be added to the mouse coordinates when computing collisions


	constructor: function(component, options) {
		DragListener.call(this, options); // call the super-constructor

		this.component = component;
	},


	// Called when drag listening starts (but a real drag has not necessarily began).
	// ev might be undefined if dragging was started manually.
	listenStart: function(ev) {
		var subjectEl = this.subjectEl;
		var subjectRect;
		var origPoint;
		var point;

		DragListener.prototype.listenStart.apply(this, arguments); // call the super-method

		this.computeCoords();

		if (ev) {
			origPoint = { left: ev.pageX, top: ev.pageY };
			point = origPoint;

			// constrain the point to bounds of the element being dragged
			if (subjectEl) {
				subjectRect = getOuterRect(subjectEl); // used for centering as well
				point = constrainPoint(point, subjectRect);
			}

			this.origHit = this.queryHit(point.left, point.top);

			// treat the center of the subject as the collision point?
			if (subjectEl && this.options.subjectCenter) {

				// only consider the area the subject overlaps the hit. best for large subjects.
				// TODO: skip this if hit didn't supply left/right/top/bottom
				if (this.origHit) {
					subjectRect = intersectRects(this.origHit, subjectRect) ||
						subjectRect; // in case there is no intersection
				}

				point = getRectCenter(subjectRect);
			}

			this.coordAdjust = diffPoints(point, origPoint); // point - origPoint
		}
		else {
			this.origHit = null;
			this.coordAdjust = null;
		}
	},


	// Recomputes the drag-critical positions of elements
	computeCoords: function() {
		this.component.prepareHits();
		this.computeScrollBounds(); // why is this here???
	},


	// Called when the actual drag has started
	dragStart: function(ev) {
		var hit;

		DragListener.prototype.dragStart.apply(this, arguments); // call the super-method

		// might be different from this.origHit if the min-distance is large
		hit = this.queryHit(ev.pageX, ev.pageY);

		// report the initial hit the mouse is over
		// especially important if no min-distance and drag starts immediately
		if (hit) {
			this.hitOver(hit);
		}
	},


	// Called when the drag moves
	drag: function(dx, dy, ev) {
		var hit;

		DragListener.prototype.drag.apply(this, arguments); // call the super-method

		hit = this.queryHit(ev.pageX, ev.pageY);

		if (!isHitsEqual(hit, this.hit)) { // a different hit than before?
			if (this.hit) {
				this.hitOut();
			}
			if (hit) {
				this.hitOver(hit);
			}
		}
	},


	// Called when dragging has been stopped
	dragStop: function() {
		this.hitDone();
		DragListener.prototype.dragStop.apply(this, arguments); // call the super-method
	},


	// Called when a the mouse has just moved over a new hit
	hitOver: function(hit) {
		var isOrig = isHitsEqual(hit, this.origHit);

		this.hit = hit;

		this.trigger('hitOver', this.hit, isOrig, this.origHit);
	},


	// Called when the mouse has just moved out of a hit
	hitOut: function() {
		if (this.hit) {
			this.trigger('hitOut', this.hit);
			this.hitDone();
			this.hit = null;
		}
	},


	// Called after a hitOut. Also called before a dragStop
	hitDone: function() {
		if (this.hit) {
			this.trigger('hitDone', this.hit);
		}
	},


	// Called when drag listening has stopped
	listenStop: function() {
		DragListener.prototype.listenStop.apply(this, arguments); // call the super-method

		this.origHit = null;
		this.hit = null;

		this.component.releaseHits();
	},


	// Called when scrolling has stopped, whether through auto scroll, or the user scrolling
	scrollStop: function() {
		DragListener.prototype.scrollStop.apply(this, arguments); // call the super-method

		this.computeCoords(); // hits' absolute positions will be in new places. recompute
	},


	// Gets the hit underneath the coordinates for the given mouse event
	queryHit: function(left, top) {

		if (this.coordAdjust) {
			left += this.coordAdjust.left;
			top += this.coordAdjust.top;
		}

		return this.component.queryHit(left, top);
	}

});


// Returns `true` if the hits are identically equal. `false` otherwise. Must be from the same component.
// Two null values will be considered equal, as two "out of the component" states are the same.
function isHitsEqual(hit0, hit1) {

	if (!hit0 && !hit1) {
		return true;
	}

	if (hit0 && hit1) {
		return hit0.component === hit1.component &&
			isHitPropsWithin(hit0, hit1) &&
			isHitPropsWithin(hit1, hit0); // ensures all props are identical
	}

	return false;
}


// Returns true if all of subHit's non-standard properties are within superHit
function isHitPropsWithin(subHit, superHit) {
	for (var propName in subHit) {
		if (!/^(component|left|right|top|bottom)$/.test(propName)) {
			if (subHit[propName] !== superHit[propName]) {
				return false;
			}
		}
	}
	return true;
}
