
/* Tracks mouse movements over a CoordMap and raises events about which cell the mouse is over.
------------------------------------------------------------------------------------------------------------------------
options:
- subjectEl
- subjectCenter
*/

var CellDragListener = DragListener.extend({

	coordMap: null, // converts coordinates to date cells
	origCell: null, // the cell the mouse was over when listening started
	cell: null, // the cell the mouse is over
	coordAdjust: null, // delta that will be added to the mouse coordinates when computing collisions


	constructor: function(coordMap, options) {
		DragListener.prototype.constructor.call(this, options); // call the super-constructor

		this.coordMap = coordMap;
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

			this.origCell = this.getCell(point.left, point.top);

			// treat the center of the subject as the collision point?
			if (subjectEl && this.options.subjectCenter) {

				// only consider the area the subject overlaps the cell. best for large subjects
				if (this.origCell) {
					subjectRect = intersectRects(this.origCell, subjectRect) ||
						subjectRect; // in case there is no intersection
				}

				point = getRectCenter(subjectRect);
			}

			this.coordAdjust = diffPoints(point, origPoint); // point - origPoint
		}
		else {
			this.origCell = null;
			this.coordAdjust = null;
		}
	},


	// Recomputes the drag-critical positions of elements
	computeCoords: function() {
		this.coordMap.build();
		this.computeScrollBounds();
	},


	// Called when the actual drag has started
	dragStart: function(ev) {
		var cell;

		DragListener.prototype.dragStart.apply(this, arguments); // call the super-method

		cell = this.getCell(ev.pageX, ev.pageY); // might be different from this.origCell if the min-distance is large

		// report the initial cell the mouse is over
		// especially important if no min-distance and drag starts immediately
		if (cell) {
			this.cellOver(cell);
		}
	},


	// Called when the drag moves
	drag: function(dx, dy, ev) {
		var cell;

		DragListener.prototype.drag.apply(this, arguments); // call the super-method

		cell = this.getCell(ev.pageX, ev.pageY);

		if (!isCellsEqual(cell, this.cell)) { // a different cell than before?
			if (this.cell) {
				this.cellOut();
			}
			if (cell) {
				this.cellOver(cell);
			}
		}
	},


	// Called when dragging has been stopped
	dragStop: function() {
		this.cellDone();
		DragListener.prototype.dragStop.apply(this, arguments); // call the super-method
	},


	// Called when a the mouse has just moved over a new cell
	cellOver: function(cell) {
		this.cell = cell;
		this.trigger('cellOver', cell, isCellsEqual(cell, this.origCell), this.origCell);
	},


	// Called when the mouse has just moved out of a cell
	cellOut: function() {
		if (this.cell) {
			this.trigger('cellOut', this.cell);
			this.cellDone();
			this.cell = null;
		}
	},


	// Called after a cellOut. Also called before a dragStop
	cellDone: function() {
		if (this.cell) {
			this.trigger('cellDone', this.cell);
		}
	},


	// Called when drag listening has stopped
	listenStop: function() {
		DragListener.prototype.listenStop.apply(this, arguments); // call the super-method

		this.origCell = this.cell = null;
		this.coordMap.clear();
	},


	// Called when scrolling has stopped, whether through auto scroll, or the user scrolling
	scrollStop: function() {
		DragListener.prototype.scrollStop.apply(this, arguments); // call the super-method

		this.computeCoords(); // cells' absolute positions will be in new places. recompute
	},


	// Gets the cell underneath the coordinates for the given mouse event
	getCell: function(left, top) {

		if (this.coordAdjust) {
			left += this.coordAdjust.left;
			top += this.coordAdjust.top;
		}

		return this.coordMap.getCell(left, top);
	}

});


// Returns `true` if the cells are identically equal. `false` otherwise.
// They must have the same row, col, and be from the same grid.
// Two null values will be considered equal, as two "out of the grid" states are the same.
function isCellsEqual(cell1, cell2) {

	if (!cell1 && !cell2) {
		return true;
	}

	if (cell1 && cell2) {
		return cell1.grid === cell2.grid &&
			cell1.row === cell2.row &&
			cell1.col === cell2.col;
	}

	return false;
}
