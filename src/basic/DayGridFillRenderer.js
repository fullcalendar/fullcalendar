
var DayGridFillRenderer = FillRenderer.extend({

	fillSegTag: 'td', // override the default tag name
	dayGrid: null,


	constructor: function(dayGrid) {
		FillRenderer.call(this, dayGrid);

		this.dayGrid = dayGrid;
	},


	attachSegEls: function(type, segs) {
		var nodes = [];
		var i, seg;
		var skeletonEl;

		for (i = 0; i < segs.length; i++) {
			seg = segs[i];
			skeletonEl = this.renderFillRow(type, seg);
			this.dayGrid.rowEls.eq(seg.row).append(skeletonEl);
			nodes.push(skeletonEl[0]);
		}

		return nodes;
	},


	// Generates the HTML needed for one row of a fill. Requires the seg's el to be rendered.
	renderFillRow: function(type, seg) {
		var colCnt = this.dayGrid.colCnt;
		var startCol = seg.leftCol;
		var endCol = seg.rightCol + 1;
		var className;
		var skeletonEl;
		var trEl;

		if (type === 'businessHours') {
			className = 'bgevent';
		}
		else {
			className = type.toLowerCase();
		}

		skeletonEl = $(
			'<div class="fc-' + className + '-skeleton">' +
				'<table><tr/></table>' +
			'</div>'
		);
		trEl = skeletonEl.find('tr');

		if (startCol > 0) {
			trEl.append('<td colspan="' + startCol + '"/>');
		}

		trEl.append(
			seg.el.attr('colspan', endCol - startCol)
		);

		if (endCol < colCnt) {
			trEl.append('<td colspan="' + (colCnt - endCol) + '"/>');
		}

		this.dayGrid.bookendCells(trEl);

		return skeletonEl;
	}
});
