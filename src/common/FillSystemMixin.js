
var FillSystem = Class.extend({ // use for highlight, background events, business hours

	component: null,
	elsByFill: null, // a hash of jQuery element sets used for rendering each fill. Keyed by fill name.


	/*
	component defines:
		- fillSegTag (optional, defaults to 'div')
		- *SegEl
		- *SegClasses
		- *SegCss
	*/
	constructor: function(component) {
		this.component = component;
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
		var component = this.component;
		var segElMethod = component[type + 'SegEl'];
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
					el = segElMethod.call(component, seg, el);
				}

				if (el) { // custom filters did not cancel the render
					el = $(el); // allow custom filter to return raw DOM node

					// correct element type? (would be bad if a non-TD were inserted into a table for example)
					if (el.is(component.fillSegTag || 'div')) {
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
		var component = this.component;

		// custom hooks per-type
		var classesMethod = component[type + 'SegClasses'];
		var cssMethod = component[type + 'SegCss'];

		var classes = classesMethod ? classesMethod.call(component, seg) : [];
		var css = cssToStr(cssMethod ? cssMethod.call(component, seg) : {});

		return '<' + (component.fillSegTag || 'div') +
			(classes.length ? ' class="' + classes.join(' ') + '"' : '') +
			(css ? ' style="' + css + '"' : '') +
			' />';
	}

});
