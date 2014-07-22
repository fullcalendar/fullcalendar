
/* Event-rendering methods for the DayGrid class
----------------------------------------------------------------------------------------------------------------------*/

$.extend(DayGrid.prototype, {

	// A jQuery set of <tbody> elements, one for each row, with events inside. Attached to the content skeletons.
	eventTbodyEls: null,


	// Render the given events onto the Grid and return the rendered segments
	renderEvents: function(events) {
		var res = this.renderEventRows(events);
		var tbodyEls = this.eventTbodyEls = res.tbodyEls;

		// append to each row's content skeleton
		this.rowEls.each(function(i, rowNode) {
			$(rowNode).find('.fc-content-skeleton > table').append(tbodyEls[i]);
		});

		return res.segs; // return segment objects. for the view
	},


	// Removes all rendered event elements
	destroyEvents: function() {
		if (this.eventTbodyEls) {
			this.eventTbodyEls.remove();
			this.eventTbodyEls = null;
		}
	},


	// Uses the given events array to generate <tbody> elements that should be appended to each row's content skeleton.
	// Returns an object with properties 'tbodyEls' and 'segs' (which contains all the rendered segment objects).
	renderEventRows: function(events) {
		var view = this.view;
		var allSegs = this.eventsToSegs(events);
		var segRows = this.groupSegRows(allSegs); // group into nested arrays
		var html = '';
		var tbodyNodes = [];
		var i;
		var row;

		// build a large concatenation of event segment HTML
		for (i = 0; i < allSegs.length; i++) {
			html += this.renderSegHtml(allSegs[i]);
		}

		// Grab individual elements from the combined HTML string. Use each as the default rendering.
		// Then, compute the 'el' for each segment. An el might be null if the eventRender callback returned false.
		$(html).each(function(i, node) {
			allSegs[i].el = view.resolveEventEl(allSegs[i].event, $(node));
		});

		// iterate each row of segment groupings
		for (row = 0; row < segRows.length; row++) {
			segRows[row] = $.grep(segRows[row], renderedSegFilter); // filter out non-rendered segments. reassign array
			tbodyNodes.push(
				this.renderSegSkeleton(segRows[row])[0]
			);
		}

		return {
			tbodyEls: $(tbodyNodes), // array -> jQuery set
			segs: flattenArray(segRows) // flatten all rendered segments into one array
		};
	},


	// Builds the HTML to be used for the default element for an individual segment
	renderSegHtml: function(seg) {
		var view = this.view;
		var isRTL = view.opt('isRTL');
		var event = seg.event;
		var isDraggable = view.isEventDraggable(event);
		var isResizable = event.allDay && seg.isEnd && view.isEventResizable(event); // only on endings of timed events
		var classes = this.getSegClasses(seg, isDraggable, isResizable);
		var skinCss = this.getEventSkinCss(event);
		var timeHtml = '';
		var titleHtml;

		classes.unshift('fc-day-grid-event');

		// Only display a timed events time if it is the starting segment
		if (!event.allDay && seg.isStart) {
			timeHtml = '<span class="fc-time">' + htmlEscape(view.getEventTimeText(event)) + '</span>';
		}

		titleHtml =
			'<span class="fc-title">' +
				(htmlEscape(event.title || '') || '&nbsp;') + // we always want one line of height
			'</span>';
		
		return '<a class="' + classes.join(' ') + '"' +
				(event.url ?
					' href="' + htmlEscape(event.url) + '"' :
					''
					) +
				(skinCss ?
					' style="' + skinCss + '"' :
					''
					) +
			'>' +
				'<div class="fc-content">' +
					(isRTL ?
						titleHtml + ' ' + timeHtml : // put a natural space in between
						timeHtml + ' ' + titleHtml   //
						) +
				'</div>' +
				(isResizable ?
					'<div class="fc-resizer"/>' :
					''
					) +
			'</a>';
	},


	// Given an array of segments all in the same row, render a <tbody> element, a skeleton that contains the segments
	renderSegSkeleton: function(rowSegs) {
		var view = this.view;
		var colCnt = view.colCnt;
		var levels = this.buildSegLevels(rowSegs); // group into sub-arrays of levels
		var tbody = $('<tbody/>');
		var emptyTds = []; // a sparse array of references to the current row's empty cells, indexed by column
		var aboveEmptyTds; // like emptyTds, but for the level above
		var i, levelSegs;
		var col;
		var tr;
		var j, seg;
		var td;

		// populates empty cells from the current column (`col`) to `endCol`
		function emptyCellsUntil(endCol) {
			while (col < endCol) {
				// try to grab an empty cell from the level above and extend its rowspan. otherwise, create a fresh cell
				td = aboveEmptyTds[col];
				if (td) {
					td.attr(
						'rowspan',
						parseInt(td.attr('rowspan') || 1, 10) + 1
					);
				}
				else {
					td = $('<td/>');
					tr.append(td);
				}
				emptyTds[col] = td;
				col++;
			}
		}

		// Iterate through all levels, and then beyond one. Do this so we have an empty row at the end.
		// This empty row comes in handy when styling the height of the content skeleton.
		for (i = 0; i < levels.length + 1; i++) {
			levelSegs = levels[i];
			col = 0;
			tr = $('<tr/>');

			aboveEmptyTds = emptyTds;
			emptyTds = [];

			if (levelSegs) { // protect against non-existent last level
				for (j = 0; j < levelSegs.length; j++) { // iterate through segments in level
					seg = levelSegs[j];

					emptyCellsUntil(seg.leftCol);

					// create a container that occupies or more columns. append the event element.
					td = $('<td class="fc-event-container"/>').append(seg.el);
					if (seg.rightCol > seg.leftCol) {
						td.attr('colspan', seg.rightCol - seg.leftCol + 1);
					}

					tr.append(td);
					col = seg.rightCol + 1;
				}
			}

			emptyCellsUntil(colCnt); // finish off the row

			this.bookendCells(tr, 'eventSkeleton');
			tbody.append(tr);
		}

		return tbody;
	},


	// Stacks a flat array of segments, which are all assumed to be in the same row, into subarrays of vertical levels.
	buildSegLevels: function(segs) {
		var levels = [];
		var i, seg;
		var j;

		// Give preference to elements with certain criteria, so they have
		// a chance to be closer to the top.
		segs.sort(compareSegs);
		
		for (i = 0; i < segs.length; i++) {
			seg = segs[i];

			// loop through levels, starting with the topmost, until the segment doesn't collide with other segments
			for (j = 0; j < levels.length; j++) {
				if (!isDaySegCollision(seg, levels[j])) {
					break;
				}
			}
			// `j` now holds the desired subrow index
			seg.level = j;

			// create new level array if needed and append segment
			(levels[j] || (levels[j] = [])).push(seg);
		}

		// order segments left-to-right. very important if calendar is RTL
		for (j = 0; j < levels.length; j++) {
			levels[j].sort(compareDaySegCols);
		}

		return levels;
	},


	// Given a flat array of segments, return an array of sub-arrays, grouped by each segment's row
	groupSegRows: function(segs) {
		var view = this.view;
		var segRows = [];
		var i;

		for (i = 0; i < view.rowCnt; i++) {
			segRows.push([]);
		}

		for (i = 0; i < segs.length; i++) {
			segRows[segs[i].row].push(segs[i]);
		}

		return segRows;
	}

});


// Computes whether two segments' columns collide. They are assumed to be in the same row.
function isDaySegCollision(seg, otherSegs) {
	var i, otherSeg;

	for (i = 0; i < otherSegs.length; i++) {
		otherSeg = otherSegs[i];

		if (
			otherSeg.leftCol <= seg.rightCol &&
			otherSeg.rightCol >= seg.leftCol
		) {
			return true;
		}
	}

	return false;
}


// A cmp function for determining the leftmost event
function compareDaySegCols(a, b) {
	return a.leftCol - b.leftCol;
}
