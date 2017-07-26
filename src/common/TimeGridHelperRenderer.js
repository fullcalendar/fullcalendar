
var TimeGridHelperRenderer = HelperRenderer.extend({

	helperEls: null,


	// Renders a mock "helper" event. `sourceSeg` is the original segment object and might be null (an external drag)
	renderFootprintEls: function(eventFootprints, sourceSeg) {
		var segs = this.component.eventFootprintsToSegs(eventFootprints);

		return this.renderHelperSegs( // returns mock event elements
			segs,
			sourceSeg
		);
	},


	renderHelperSegs: function(segs, sourceSeg) {
		var helperNodes = [];
		var i, seg;
		var sourceEl;

		segs = this.eventRenderer.renderFgSegsIntoContainers(
			segs,
			this.component.helperContainerEls
		);

		// Try to make the segment that is in the same row as sourceSeg look the same
		for (i = 0; i < segs.length; i++) {
			seg = segs[i];
			if (sourceSeg && sourceSeg.col === seg.col) {
				sourceEl = sourceSeg.el;
				seg.el.css({
					left: sourceEl.css('left'),
					right: sourceEl.css('right'),
					'margin-left': sourceEl.css('margin-left'),
					'margin-right': sourceEl.css('margin-right')
				});
			}
			helperNodes.push(seg.el[0]);
		}

		return ( // must return the elements rendered
			this.helperEls = $(helperNodes) // array -> jQuery set
		);
	},


	// Unrenders any mock helper event
	unrender: function() {
		if (this.helperEls) {
			this.helperEls.remove();
			this.helperEls = null;
		}
	}

});
