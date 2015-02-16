
/* A "coordinate map" converts pixel coordinates into an associated cell, which has an associated date
------------------------------------------------------------------------------------------------------------------------
Common interface:

	CoordMap.prototype = {
		build: function() {},
		getCell: function(x, y) {}
	};

*/

/* Coordinate map for a grid component
----------------------------------------------------------------------------------------------------------------------*/

var GridCoordMap = Class.extend({

	grid: null, // reference to the Grid
	rowCoords: null, // array of {top,bottom} objects
	colCoords: null, // array of {left,right} objects

	containerEl: null, // container element that all coordinates are constrained to. optionally assigned
	bounds: null,


	constructor: function(grid) {
		this.grid = grid;
	},


	// Queries the grid for the coordinates of all the cells
	build: function() {
		this.rowCoords = this.grid.computeRowCoords();
		this.colCoords = this.grid.computeColCoords();
		this.computeBounds();
	},


	// Clears the coordinates data to free up memory
	clear: function() {
		this.rowCoords = null;
		this.colCoords = null;
	},


	// Given a coordinate of the document, gets the associated cell. If no cell is underneath, returns null
	getCell: function(x, y) {
		var rowCoords = this.rowCoords;
		var rowCnt = rowCoords.length;
		var colCoords = this.colCoords;
		var colCnt = colCoords.length;
		var hitRow = null;
		var hitCol = null;
		var i, coords;
		var cell;

		if (this.inBounds(x, y)) {

			for (i = 0; i < rowCnt; i++) {
				coords = rowCoords[i];
				if (y >= coords.top && y < coords.bottom) {
					hitRow = i;
					break;
				}
			}

			for (i = 0; i < colCnt; i++) {
				coords = colCoords[i];
				if (x >= coords.left && x < coords.right) {
					hitCol = i;
					break;
				}
			}

			if (hitRow !== null && hitCol !== null) {

				cell = this.grid.getCell(hitRow, hitCol); // expected to return a fresh object we can modify
				cell.grid = this.grid; // for CellDragListener's isCellsEqual. dragging between grids

				// make the coordinates available on the cell object
				$.extend(cell, rowCoords[hitRow], colCoords[hitCol]);

				return cell;
			}
		}

		return null;
	},


	// If there is a containerEl, compute the bounds into min/max values
	computeBounds: function() {
		this.bounds = this.containerEl ?
			getClientRect(this.containerEl) : // area within scrollbars
			null;
	},


	// Determines if the given coordinates are in bounds. If no `containerEl`, always true
	inBounds: function(x, y) {
		var bounds = this.bounds;

		if (bounds) {
			return x >= bounds.left && x < bounds.right && y >= bounds.top && y < bounds.bottom;
		}

		return true;
	}

});


/* Coordinate map that is a combination of multiple other coordinate maps
----------------------------------------------------------------------------------------------------------------------*/

var ComboCoordMap = Class.extend({

	coordMaps: null, // an array of CoordMaps


	constructor: function(coordMaps) {
		this.coordMaps = coordMaps;
	},


	// Builds all coordMaps
	build: function() {
		var coordMaps = this.coordMaps;
		var i;

		for (i = 0; i < coordMaps.length; i++) {
			coordMaps[i].build();
		}
	},


	// Queries all coordMaps for the cell underneath the given coordinates, returning the first result
	getCell: function(x, y) {
		var coordMaps = this.coordMaps;
		var cell = null;
		var i;

		for (i = 0; i < coordMaps.length && !cell; i++) {
			cell = coordMaps[i].getCell(x, y);
		}

		return cell;
	},


	// Clears all coordMaps
	clear: function() {
		var coordMaps = this.coordMaps;
		var i;

		for (i = 0; i < coordMaps.length; i++) {
			coordMaps[i].clear();
		}
	}

});
