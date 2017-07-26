
var DayGridHelperRenderer = HelperRenderer.extend({

	helperEls: null, // set of cell skeleton elements for rendering the mock event "helper"


	// Renders a mock "helper" event. `sourceSeg` is the associated internal segment object. It can be null.
	renderFootprintEls: function(eventFootprints, sourceSeg) {
		var segs = this.component.eventFootprintsToSegs(eventFootprints);
		var helperNodes = [];
		var rowStructs;

		segs = this.eventRenderer.renderFgSegEls(segs); // assigns each seg's el and returns a subset of segs that were rendered
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

		return ( // must return the elements rendered
			this.helperEls = $(helperNodes) // array -> jQuery set
		);
	},


	// Unrenders any visual indication of a mock helper event
	unrender: function() {
		if (this.helperEls) {
			this.helperEls.remove();
			this.helperEls = null;
		}
	}

});
