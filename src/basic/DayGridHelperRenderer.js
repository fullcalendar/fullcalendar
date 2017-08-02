
var DayGridHelperRenderer = HelperRenderer.extend({


	// Renders a mock "helper" event. `sourceSeg` is the associated internal segment object. It can be null.
	renderSegs: function(segs, sourceSeg) {
		var helperNodes = [];
		var rowStructs;

		// TODO: not good to call eventRenderer this way
		rowStructs = this.eventRenderer.renderSegRows(segs);

		// inject each new event skeleton into each associated row
		this.component.rowEls.each(function(row, rowNode) {
			var rowEl = $(rowNode); // the .fc-row
			var skeletonEl = $('<div class="fc-helper-skeleton"><table/></div>'); // will be absolutely positioned
			var skeletonTop;

			// If there is an original segment, match the top position. Otherwise, put it at the row's top level
			if (sourceSeg && sourceSeg.row === row) {
				skeletonTop = sourceSeg.el.position().top;
			}
			else {
				skeletonTop = rowEl.find('.fc-content-skeleton tbody').position().top;
			}

			skeletonEl.css('top', skeletonTop)
				.find('table')
					.append(rowStructs[row].tbodyEl);

			rowEl.append(skeletonEl);
			helperNodes.push(skeletonEl[0]);
		});

		return $(helperNodes); // must return the elements rendered
	}

});
