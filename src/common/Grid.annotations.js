
/* annotation-rendering and annotation-interaction methods for the abstract Grid class
----------------------------------------------------------------------------------------------------------------------*/

$.extend(Grid.prototype, {


	// Converts an array of annotation objects into an array of segment objects
	annotationsToSegs: function(annotations, intervalStart, intervalEnd) {
		var _this = this;

		return $.map(annotations, function(annotation) {
			return _this.annotationToSegs(annotation, intervalStart, intervalEnd); // $.map flattens all returned arrays together
		});
	},


	// Slices a single annotation into an array of annotation segments.
	// When `intervalStart` and `intervalEnd` are specified, intersect the annotations with that interval.
	// Otherwise, let the subclass decide how it wants to slice the segments over the grid.
	annotationToSegs: function(annotation, intervalStart, intervalEnd) {
		var annotationStart = annotation.start.clone().stripZone(); // normalize
		var annotationEnd = this.view.calendar.getEventEnd(annotation).stripZone(); // compute (if necessary) and normalize
		var segs;
		var i, seg;

		if (intervalStart && intervalEnd) {
			seg = intersectionToSeg(annotationStart, annotationEnd, intervalStart, intervalEnd);
			segs = seg ? [ seg ] : [];
		}
		else {
			segs = this.rangeToSegs(annotationStart, annotationEnd); // defined by the subclass
		}

		// assign extra annotation-related properties to the segment objects
		for (i = 0; i < segs.length; i++) {
			seg = segs[i];
			seg.annotation = annotation;
			seg.eventStartMS = +annotationStart;
			seg.eventDurationMS = annotationEnd - annotationStart;
		}

		return segs;
	},

	// Renders a `el` property for each seg, and only returns segments that successfully rendered
	renderAnnotations: function(annotations, disableResizing) {
		var html = '';
		var renderedAnns = [];
		var i;

		// build a large concatenation of annotation segment HTML
		for (i = 0; i < annotations.length; i++) {
			html += this.renderAnnotationHtml(annotations[i], disableResizing);
		}

		// Grab individual elements from the combined HTML string. Use each as the default rendering.
		// Then, compute the 'el' for each segment. An el might be null if the eventRender callback returned false.
		$(html).each(function(i, node) {
			annotations[i].el = $(node);
			renderedAnns.push(annotations[i]);
		});

		return renderedAnns;
	},

		// Builds the HTML to be used for the default element for an individual segment
	renderAnnotationHtml: function(seg, disableResizing) {
		var view = this.view;
		var isRTL = view.opt('isRTL');
		var annotation = seg.annotation;
		var classes = ['fc-annotation'].concat(annotation.cls);
		var skinCss = this.getEventSkinCss(annotation);
		var timeHtml = '';
		var titleHtml;

		// Only display a timed events time if it is the starting segment
		if (!annotation.allDay && seg.isStart) {
			timeHtml = '<span class="fc-time">' + htmlEscape(view.getEventTimeText(annotation)) + '</span>';
		}

		titleHtml =
			'<span class="fc-title">' +
				(htmlEscape(annotation.title || '') || '&nbsp;') + // we always want one line of height
			'</span>';

		return '<a class="' + classes.join(' ') + '"' +
				(annotation.url ?
					' href="' + htmlEscape(annotation.url) + '"' :
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
				'</div></a>';
	}

});
