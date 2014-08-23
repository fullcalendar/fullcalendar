
/* Tracks mouse movements over a CoordMap and raises events about which cell the mouse is over.
----------------------------------------------------------------------------------------------------------------------*/
// TODO: implement scrolling

function DragListener(coordMap, options) {
	this.coordMap = coordMap;
	this.options = options || {};
}


DragListener.prototype = {

	coordMap: null,
	options: null,

	isListening: false,
	isDragging: false,

	// the cell/date the mouse was over when listening started
	origCell: null,
	origDate: null,

	// the cell/date the mouse is over
	cell: null,
	date: null,

	// coordinates of the initial mousedown
	mouseX0: null,
	mouseY0: null,

	// handler attached to the document, bound to the DragListener's `this`
	mousemoveProxy: null,
	mouseupProxy: null,

	scrollEl: null,
	scrollBounds: null, // { top, bottom, left, right }
	scrollTopVel: null, // pixels per second
	scrollLeftVel: null, // pixels per second
	scrollIntervalId: null, // ID of setTimeout for scrolling animation loop
	scrollHandlerProxy: null, // this-scoped function for handling when scrollEl is scrolled

	scrollSensitivity: 30, // pixels from edge for scrolling to start
	scrollSpeed: 200, // pixels per second, at maximum speed
	scrollIntervalMs: 50, // millisecond wait between scroll increment


	// Call this when the user does a mousedown. Will probably lead to startListening
	mousedown: function(ev) {
		if (isPrimaryMouseButton(ev)) {

			ev.preventDefault(); // prevents native selection in most browsers

			this.startListening(ev);

			// start the drag immediately if there is no minimum distance for a drag start
			if (!this.options.distance) {
				this.startDrag(ev);
			}
		}
	},


	// Call this to start tracking mouse movements
	startListening: function(ev) {
		var scrollParent;
		var cell;

		if (!this.isListening) {

			// grab scroll container and attach handler
			if (ev && this.options.scroll) {
				scrollParent = getScrollParent($(ev.target));
				if (!scrollParent.is(window) && !scrollParent.is(document)) {
					this.scrollEl = scrollParent;

					// scope to `this`, and use `debounce` to make sure rapid calls don't happen
					this.scrollHandlerProxy = debounce($.proxy(this, 'scrollHandler'), 100);
					this.scrollEl.on('scroll', this.scrollHandlerProxy);
				}
			}

			this.computeCoords(); // relies on `scrollEl`

			// get info on the initial cell, date, and coordinates
			if (ev) {
				cell = this.getCell(ev);
				this.origCell = cell;
				this.origDate = cell ? cell.date : null;

				this.mouseX0 = ev.pageX;
				this.mouseY0 = ev.pageY;
			}

			$(document)
				.on('mousemove', this.mousemoveProxy = $.proxy(this, 'mousemove'))
				.on('mouseup', this.mouseupProxy = $.proxy(this, 'mouseup'))
				.on('selectstart', this.preventDefault); // prevents native selection in IE<=8

			this.isListening = true;
			this.trigger('listenStart', ev);
		}
	},


	// Recomputes the drag-critical positions of elements
	computeCoords: function() {
		this.coordMap.build();
		this.computeScrollBounds();
	},


	// Called when the user moves the mouse
	mousemove: function(ev) {
		var minDistance;
		var distanceSq; // current distance from mouseX0/mouseY0, squared

		if (!this.isDragging) { // if not already dragging...
			// then start the drag if the minimum distance criteria is met
			minDistance = this.options.distance || 1;
			distanceSq = Math.pow(ev.pageX - this.mouseX0, 2) + Math.pow(ev.pageY - this.mouseY0, 2);
			if (distanceSq >= minDistance * minDistance) { // use pythagorean theorem
				this.startDrag(ev);
			}
		}

		if (this.isDragging) {
			this.drag(ev); // report a drag, even if this mousemove initiated the drag
		}
	},


	// Call this to initiate a legitimate drag.
	// This function is called internally from this class, but can also be called explicitly from outside
	startDrag: function(ev) {
		var cell;

		if (!this.isListening) { // startDrag must have manually initiated
			this.startListening();
		}

		if (!this.isDragging) {
			this.isDragging = true;
			this.trigger('dragStart', ev);

			// report the initial cell the mouse is over
			cell = this.getCell(ev);
			if (cell) {
				this.cellOver(cell, true);
			}
		}
	},


	// Called while the mouse is being moved and when we know a legitimate drag is taking place
	drag: function(ev) {
		var cell;

		if (this.isDragging) {
			cell = this.getCell(ev);

			if (!isCellsEqual(cell, this.cell)) { // a different cell than before?
				if (this.cell) {
					this.cellOut();
				}
				if (cell) {
					this.cellOver(cell);
				}
			}

			this.dragScroll(ev); // will possibly cause scrolling
		}
	},


	// Called when a the mouse has just moved over a new cell
	cellOver: function(cell) {
		this.cell = cell;
		this.date = cell.date;
		this.trigger('cellOver', cell, cell.date);
	},


	// Called when the mouse has just moved out of a cell
	cellOut: function() {
		if (this.cell) {
			this.trigger('cellOut', this.cell);
			this.cell = null;
			this.date = null;
		}
	},


	// Called when the user does a mouseup
	mouseup: function(ev) {
		this.stopDrag(ev);
		this.stopListening(ev);
	},


	// Called when the drag is over. Will not cause listening to stop however.
	// A concluding 'cellOut' event will NOT be triggered.
	stopDrag: function(ev) {
		if (this.isDragging) {
			this.stopScrolling();
			this.trigger('dragStop', ev);
			this.isDragging = false;
		}
	},


	// Call this to stop listening to the user's mouse events
	stopListening: function(ev) {
		if (this.isListening) {

			// remove the scroll handler if there is a scrollEl
			if (this.scrollEl) {
				this.scrollEl.off('scroll', this.scrollHandlerProxy);
				this.scrollHandlerProxy = null;
			}

			$(document)
				.off('mousemove', this.mousemoveProxy)
				.off('mouseup', this.mouseupProxy)
				.off('selectstart', this.preventDefault);

			this.mousemoveProxy = null;
			this.mouseupProxy = null;

			this.isListening = false;
			this.trigger('listenStop', ev);

			this.origCell = this.cell = null;
			this.origDate = this.date = null;
		}
	},


	// Gets the cell underneath the coordinates for the given mouse event
	getCell: function(ev) {
		return this.coordMap.getCell(ev.pageX, ev.pageY);
	},


	// Triggers a callback. Calls a function in the option hash of the same name.
	// Arguments beyond the first `name` are forwarded on.
	trigger: function(name) {
		if (this.options[name]) {
			this.options[name].apply(this, Array.prototype.slice.call(arguments, 1));
		}
	},


	// Stops a given mouse event from doing it's native browser action. In our case, text selection.
	preventDefault: function(ev) {
		ev.preventDefault();
	},


	/* Scrolling
	------------------------------------------------------------------------------------------------------------------*/


	// Computes and stores the bounding rectangle of scrollEl
	computeScrollBounds: function() {
		var el = this.scrollEl;
		var offset;

		if (el) {
			offset = el.offset();
			this.scrollBounds = {
				top: offset.top,
				left: offset.left,
				bottom: offset.top + el.outerHeight(),
				right: offset.left + el.outerWidth()
			};
		}
	},


	// Called when the dragging is in progress and scrolling should be updated
	dragScroll: function(ev) {
		var sensitivity = this.scrollSensitivity;
		var bounds = this.scrollBounds;
		var topCloseness, bottomCloseness;
		var leftCloseness, rightCloseness;
		var topVel = 0;
		var leftVel = 0;

		if (bounds) { // only scroll if scrollEl exists

			// compute closeness to edges. valid range is from 0.0 - 1.0
			topCloseness = (sensitivity - (ev.pageY - bounds.top)) / sensitivity;
			bottomCloseness = (sensitivity - (bounds.bottom - ev.pageY)) / sensitivity;
			leftCloseness = (sensitivity - (ev.pageX - bounds.left)) / sensitivity;
			rightCloseness = (sensitivity - (bounds.right - ev.pageX)) / sensitivity;

			// translate vertical closeness into velocity.
			// mouse must be completely in bounds for velocity to happen.
			if (topCloseness >= 0 && topCloseness <= 1) {
				topVel = topCloseness * this.scrollSpeed * -1; // negative. for scrolling up
			}
			else if (bottomCloseness >= 0 && bottomCloseness <= 1) {
				topVel = bottomCloseness * this.scrollSpeed;
			}

			// translate horizontal closeness into velocity
			if (leftCloseness >= 0 && leftCloseness <= 1) {
				leftVel = leftCloseness * this.scrollSpeed * -1; // negative. for scrolling left
			}
			else if (rightCloseness >= 0 && rightCloseness <= 1) {
				leftVel = rightCloseness * this.scrollSpeed;
			}
		}

		this.setScrollVel(topVel, leftVel);
	},


	// Sets the speed-of-scrolling for the scrollEl
	setScrollVel: function(topVel, leftVel) {

		this.scrollTopVel = topVel;
		this.scrollLeftVel = leftVel;

		this.constrainScrollVel(); // massages into realistic values

		// if there is non-zero velocity, and an animation loop hasn't already started, then START
		if ((this.scrollTopVel || this.scrollLeftVel) && !this.scrollIntervalId) {
			this.scrollIntervalId = setInterval(
				$.proxy(this, 'scrollIntervalFunc'), // scope to `this`
				this.scrollIntervalMs
			);
		}
	},


	// Forces scrollTopVel and scrollLeftVel to be zero if scrolling has already gone all the way
	constrainScrollVel: function() {
		var el = this.scrollEl;

		if (this.scrollTopVel < 0) { // scrolling up?
			if (el.scrollTop() <= 0) { // already scrolled all the way up?
				this.scrollTopVel = 0;
			}
		}
		else if (this.scrollTopVel > 0) { // scrolling down?
			if (el.scrollTop() + el[0].clientHeight >= el[0].scrollHeight) { // already scrolled all the way down?
				this.scrollTopVel = 0;
			}
		}

		if (this.scrollLeftVel < 0) { // scrolling left?
			if (el.scrollLeft() <= 0) { // already scrolled all the left?
				this.scrollLeftVel = 0;
			}
		}
		else if (this.scrollLeftVel > 0) { // scrolling right?
			if (el.scrollLeft() + el[0].clientWidth >= el[0].scrollWidth) { // already scrolled all the way right?
				this.scrollLeftVel = 0;
			}
		}
	},


	// This function gets called during every iteration of the scrolling animation loop
	scrollIntervalFunc: function() {
		var el = this.scrollEl;
		var frac = this.scrollIntervalMs / 1000; // considering animation frequency, what the vel should be mult'd by

		// change the value of scrollEl's scroll
		if (this.scrollTopVel) {
			el.scrollTop(el.scrollTop() + this.scrollTopVel * frac);
		}
		if (this.scrollLeftVel) {
			el.scrollLeft(el.scrollLeft() + this.scrollLeftVel * frac);
		}

		this.constrainScrollVel(); // since the scroll values changed, recompute the velocities

		// if scrolled all the way, which causes the vels to be zero, stop the animation loop
		if (!this.scrollTopVel && !this.scrollLeftVel) {
			this.stopScrolling();
		}
	},


	// Kills any existing scrolling animation loop
	stopScrolling: function() {
		if (this.scrollIntervalId) {
			clearInterval(this.scrollIntervalId);
			this.scrollIntervalId = null;

			// when all done with scrolling, recompute positions since they probably changed
			this.computeCoords();
		}
	},


	// Get called when the scrollEl is scrolled (NOTE: this is delayed via debounce)
	scrollHandler: function() {
		// recompute all coordinates, but *only* if this is *not* part of our scrolling animation
		if (!this.scrollIntervalId) {
			this.computeCoords();
		}
	}

};


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
