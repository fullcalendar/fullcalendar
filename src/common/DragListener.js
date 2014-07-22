
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
		var cell;

		if (!this.isListening) {

			this.coordMap.build(); // build coordinates of the cells

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
			this.trigger('dragStop', ev);
			this.isDragging = false;
		}
	},


	// Call this to stop listening to the user's mouse events
	stopListening: function(ev) {
		if (this.isListening) {

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
