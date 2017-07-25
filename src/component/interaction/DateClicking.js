
var DateClicking = Class.extend({

	view: null,
	component: null, // CoordComponent
	dragListener: null,


	/*
	component must implement:
		- bindDateHandlerToEl
		- registerDragListener
		- getSafeHitFootprint
		- getHitEl
	*/
	constructor: function(component) {
		this.view = component._getView();
		this.component = component;

		this.dragListener = this.buildDragListener();
		component.registerDragListener(this.dragListener);
	},


	opt: function(name) {
		return this.view.opt(name);
	},


	bindToEl: function(el) {
		var component = this.component;
		var dragListener = this.dragListener;

		component.bindDateHandlerToEl(el, 'mousedown', function(ev) {
			if (!component.shouldIgnoreMouse()) {
				dragListener.startInteraction(ev);
			}
		});

		component.bindDateHandlerToEl(el, 'touchstart', function(ev) {
			if (!component.shouldIgnoreTouch()) {
				dragListener.startInteraction(ev);
			}
		});
	},


	// Creates a listener that tracks the user's drag across day elements, for day clicking.
	buildDragListener: function() {
		var _this = this;
		var component = this.component;
		var dayClickHit; // null if invalid dayClick

		var dragListener = new HitDragListener(component, {
			scroll: this.opt('dragScroll'),
			interactionStart: function() {
				dayClickHit = dragListener.origHit;
			},
			hitOver: function(hit, isOrig, origHit) {
				// if user dragged to another cell at any point, it can no longer be a dayClick
				if (!isOrig) {
					dayClickHit = null;
				}
			},
			hitOut: function() { // called before mouse moves to a different hit OR moved out of all hits
				dayClickHit = null;
			},
			interactionEnd: function(ev, isCancelled) {
				var componentFootprint;

				if (!isCancelled && dayClickHit) {
					componentFootprint = component.getSafeHitFootprint(dayClickHit);

					if (componentFootprint) {
						_this.view.triggerDayClick(componentFootprint, component.getHitEl(dayClickHit), ev);
					}
				}
			}
		});

		// because dragListener won't be called with any time delay, "dragging" will begin immediately,
		// which will kill any touchmoving/scrolling. Prevent this.
		dragListener.shouldCancelTouchScroll = false;

		dragListener.scrollAlwaysKills = true;

		return dragListener;
	}

});
