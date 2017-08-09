
var DateSelecting = FC.DateSelecting = Interaction.extend({

	dragListener: null,


	/*
	component must implement:
		- bindDateHandlerToEl
		- getSafeHitFootprint
		- renderHighlight
		- unrenderHighlight
	*/
	constructor: function(component) {
		Interaction.call(this, component);

		this.dragListener = this.buildDragListener();
	},


	end: function() {
		this.dragListener.endInteraction();
	},


	getDelay: function() {
		var delay = this.opt('selectLongPressDelay');

		if (delay == null) {
			delay = this.opt('longPressDelay'); // fallback
		}

		return delay;
	},


	bindToEl: function(el) {
		var _this = this;
		var component = this.component;
		var dragListener = this.dragListener;

		component.bindDateHandlerToEl(el, 'mousedown', function(ev) {
			if (_this.opt('selectable') && !component.shouldIgnoreMouse()) {
				dragListener.startInteraction(ev, {
					distance: _this.opt('selectMinDistance')
				});
			}
		});

		component.bindDateHandlerToEl(el, 'touchstart', function(ev) {
			if (_this.opt('selectable') && !component.shouldIgnoreTouch()) {
				dragListener.startInteraction(ev, {
					delay: _this.getDelay()
				});
			}
		});

		preventSelection(el);
	},


	// Creates a listener that tracks the user's drag across day elements, for day selecting.
	buildDragListener: function() {
		var _this = this;
		var component = this.component;
		var selectionFootprint; // null if invalid selection

		var dragListener = new HitDragListener(component, {
			scroll: this.opt('dragScroll'),
			interactionStart: function() {
				selectionFootprint = null;
			},
			dragStart: function() {
				_this.view.unselect(); // since we could be rendering a new selection, we want to clear any old one
			},
			hitOver: function(hit, isOrig, origHit) {
				var origHitFootprint;
				var hitFootprint;

				if (origHit) { // click needs to have started on a hit

					origHitFootprint = component.getSafeHitFootprint(origHit);
					hitFootprint = component.getSafeHitFootprint(hit);

					if (origHitFootprint && hitFootprint) {
						selectionFootprint = _this.computeSelection(origHitFootprint, hitFootprint);
					}
					else {
						selectionFootprint = null;
					}

					if (selectionFootprint) {
						component.renderSelectionFootprint(selectionFootprint);
					}
					else if (selectionFootprint === false) {
						disableCursor();
					}
				}
			},
			hitOut: function() { // called before mouse moves to a different hit OR moved out of all hits
				selectionFootprint = null;
				component.unrenderSelection();
			},
			hitDone: function() { // called after a hitOut OR before a dragEnd
				enableCursor();
			},
			interactionEnd: function(ev, isCancelled) {
				if (!isCancelled && selectionFootprint) {
					// the selection will already have been rendered. just report it
					_this.view.reportSelection(selectionFootprint, ev);
				}
			}
		});

		return dragListener;
	},


	// Given the first and last date-spans of a selection, returns another date-span object.
	// Subclasses can override and provide additional data in the span object. Will be passed to renderSelectionFootprint().
	// Will return false if the selection is invalid and this should be indicated to the user.
	// Will return null/undefined if a selection invalid but no error should be reported.
	computeSelection: function(footprint0, footprint1) {
		var wholeFootprint = this.computeSelectionFootprint(footprint0, footprint1);

		if (wholeFootprint && !this.isSelectionFootprintAllowed(wholeFootprint)) {
			return false;
		}

		return wholeFootprint;
	},


	// Given two spans, must return the combination of the two.
	// TODO: do this separation of concerns (combining VS validation) for event dnd/resize too.
	// Assumes both footprints are non-open-ended.
	computeSelectionFootprint: function(footprint0, footprint1) {
		var ms = [
			footprint0.unzonedRange.startMs,
			footprint0.unzonedRange.endMs,
			footprint1.unzonedRange.startMs,
			footprint1.unzonedRange.endMs
		];

		ms.sort(compareNumbers);

		return new ComponentFootprint(
			new UnzonedRange(ms[0], ms[3]),
			footprint0.isAllDay
		);
	},


	isSelectionFootprintAllowed: function(componentFootprint) {
		return this.component.get('dateProfile').validUnzonedRange.containsRange(componentFootprint.unzonedRange) &&
			this.view.calendar.isSelectionFootprintAllowed(componentFootprint);
	}

});
