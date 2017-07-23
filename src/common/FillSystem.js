
var FillSystem = Class.extend({ // use for highlight, background events, business hours

	delegate: null,
	elsByFill: null, // a hash of jQuery element sets used for rendering each fill. Keyed by fill name.


	/*
	delegate defines:
		- fillSegTag (optional, defaults to 'div')
		- *SegEl
		- *SegClasses
		- *SegCss
	*/
	constructor: function(delegate) {
		this.delegate = delegate;
		this.elsByFill = {};
	},


	reportEls: function(type, nodes) {
		if (this.elsByFill[type]) {
			this.elsByFill[type] = this.elsByFill[type].add(nodes);
		}
		else {
			this.elsByFill[type] = $(nodes);
		}
	},


	// Unrenders a specific type of fill that is currently rendered on the grid
	unrender: function(type) {
		var el = this.elsByFill[type];

		if (el) {
			el.remove();
			delete this.elsByFill[type];
		}
	},


	// Renders and assigns an `el` property for each fill segment. Generic enough to work with different types.
	// Only returns segments that successfully rendered.
	buildSegEls: function(type, segs) {
		var delegate = this.delegate;
		var segElMethod = delegate[type + 'SegEl'];
		var html = '';
		var renderedSegs = [];
		var i;

		if (segs.length) {

			// build a large concatenation of segment HTML
			for (i = 0; i < segs.length; i++) {
				html += this.buildSegHtml(type, segs[i]);
			}

			// Grab individual elements from the combined HTML string. Use each as the default rendering.
			// Then, compute the 'el' for each segment.
			$(html).each(function(i, node) {
				var seg = segs[i];
				var el = $(node);

				// allow custom filter methods per-type
				if (segElMethod) {
					el = segElMethod.call(delegate, seg, el);
				}

				if (el) { // custom filters did not cancel the render
					el = $(el); // allow custom filter to return raw DOM node

					// correct element type? (would be bad if a non-TD were inserted into a table for example)
					if (el.is(delegate.fillSegTag || 'div')) {
						seg.el = el;
						renderedSegs.push(seg);
					}
				}
			});
		}

		return renderedSegs;
	},


	// Builds the HTML needed for one fill segment. Generic enough to work with different types.
	buildSegHtml: function(type, seg) {
		var delegate = this.delegate;

		// custom hooks per-type
		var classesMethod = delegate[type + 'SegClasses'];
		var cssMethod = delegate[type + 'SegCss'];

		var classes = classesMethod ? classesMethod.call(delegate, seg) : [];
		var css = cssToStr(cssMethod ? cssMethod.call(delegate, seg) : {});

		return '<' + (delegate.fillSegTag || 'div') +
			(classes.length ? ' class="' + classes.join(' ') + '"' : '') +
			(css ? ' style="' + css + '"' : '') +
			' />';
	}

});
