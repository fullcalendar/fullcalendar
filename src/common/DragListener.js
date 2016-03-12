
/* Tracks a drag's mouse movement, firing various handlers
----------------------------------------------------------------------------------------------------------------------*/
// TODO: use Emitter

var DragListener = FC.DragListener = Class.extend(ListenerMixin, {

	options: null,

	subjectEl: null, // the element being dragged
	subjectHref: null, // for IE8 bug-fighting behavior

	// coordinates of the initial mousedown
	originX: null,
	originY: null,

	scrollEl: null,

	isInteracting: false,
	isTouch: false,
	isDistanceSurpassed: false,
	isDelayEnded: false,
	isDragging: false,

	delayTimeoutId: null,


	constructor: function(options) {
		options = options || {};
		this.options = options;
		this.subjectEl = options.subjectEl;
	},


	// Interaction (high-level)
	// -----------------------------------------------------------------------------------------------------------------


	startInteraction: function(ev, isTouch) {
		if (!this.isInteracting) {

			this.isInteracting = true;
			this.isDelayEnded = false;
			this.isDistanceSurpassed = false;

			this.isTouch = isTouch || false;
			this.originX = getEvX(ev);
			this.originY = getEvY(ev);
			this.scrollEl = getScrollParent($(ev.target));

			this.bindHandlers();
			this.initAutoScroll();

			this.handleInteractionStart(ev);

			this.processDelay(this.options.delay, ev);

			if (!this.options.distance) {
				this.handleDistanceSurpassed(ev);
			}
		}
	},


	handleInteractionStart: function(ev) {
		this.trigger('interactionStart', ev);
	},


	endInteraction: function(ev) {
		if (this.isInteracting) {
			this.endDrag(ev);

			if (this.delayTimeoutId) {
				clearTimeout(this.delayTimeoutId);
				this.delayTimeoutId = null;
			}

			this.destroyAutoScroll();
			this.unbindHandlers();

			this.isInteracting = false;
			this.handleInteractionEnd(ev);
		}
	},


	handleInteractionEnd: function(ev) {
		this.trigger('interactionEnd', ev);
	},


	// Binding To DOM
	// -----------------------------------------------------------------------------------------------------------------


	bindHandlers: function() {

		if (this.isTouch) {
			this.listenTo($(document), {
				touchmove: this.handleTouchMove,
				touchend: this.endInteraction,
				touchcancel: this.endInteraction
			});
		}
		else {
			this.listenTo($(document), {
				mousemove: this.handleMouseMove,
				mouseup: this.endInteraction
			});
		}

		this.listenTo($(document), {
			selectstart: preventDefault, // don't allow selection while dragging
			contextmenu: preventDefault // long taps would open menu on Chrome dev tools
		});

		if (this.scrollEl) {
			this.listenTo(this.scrollEl, 'scroll', this.handleScroll);
		}
	},


	unbindHandlers: function() {
		this.stopListeningTo($(document));

		if (this.scrollEl) {
			this.stopListeningTo(this.scrollEl);
		}
	},


	// Drag (high-level)
	// -----------------------------------------------------------------------------------------------------------------


	// isTouch is only required if startInteraction not called
	startDrag: function(ev, isTouch) {
		this.startInteraction(ev, isTouch); // ensure interaction began

		if (!this.isDragging) {
			this.isDragging = true;
			this.handleDragStart(ev);
		}
	},


	handleDragStart: function(ev) {
		this.trigger('dragStart', ev);
		this.initHrefHack();
	},


	handleMove: function(ev) {
		var dx = getEvX(ev) - this.originX;
		var dy = getEvY(ev) - this.originY;
		var minDistance;
		var distanceSq; // current distance from the origin, squared

		if (!this.isDistanceSurpassed) {
			minDistance = this.options.distance || 0;
			distanceSq = dx * dx + dy * dy;
			if (distanceSq >= minDistance * minDistance) { // use pythagorean theorem
				this.handleDistanceSurpassed(ev);
			}
		}

		if (this.isDragging) {
			this.handleDrag(dx, dy, ev);
		}
	},


	// Called while the mouse is being moved and when we know a legitimate drag is taking place
	handleDrag: function(dx, dy, ev) {
		this.trigger('drag', dx, dy, ev);
		this.updateAutoScroll(ev); // will possibly cause scrolling
	},


	endDrag: function(ev) {
		if (this.isDragging) {
			this.isDragging = false;
			this.handleDragEnd(ev);
		}
	},


	handleDragEnd: function(ev) {
		this.trigger('dragEnd', ev);
		this.destroyHrefHack();
	},


	// Delay
	// -----------------------------------------------------------------------------------------------------------------


	processDelay: function(delay, initialEv) {
		var _this = this;

		// prevents mousemove+mousedown+click for touch "click"
		if (delay == null && FC.isTouchEnabled) {
			delay = 1;
		}

		if (delay) {
			this.delayTimeoutId = setTimeout(function() {
				_this.handleDelayEnd(initialEv);
			}, delay);
		}
		else {
			this.handleDelayEnd(initialEv);
		}
	},


	handleDelayEnd: function(ev) {
		this.isDelayEnded = true;

		if (this.isDistanceSurpassed) {
			this.startDrag(ev);
		}
	},


	// Distance
	// -----------------------------------------------------------------------------------------------------------------


	handleDistanceSurpassed: function(ev) {
		this.isDistanceSurpassed = true;

		if (this.isDelayEnded) {
			this.startDrag(ev);
		}
	},


	// Mouse / Touch
	// -----------------------------------------------------------------------------------------------------------------


	handleMouseDown: function(ev) {
		if (isPrimaryMouseButton(ev)) {
			ev.preventDefault(); // prevents native selection in most browsers
			this.startInteraction(ev, false); // isTouch=false
		}
	},


	handleTouchStart: function(ev) {
		if (isSingleTouch(ev)) {
			this.startInteraction(ev, true); // isTouch=true
		}
	},


	handleMouseMove: function(ev) {
		this.handleMove(ev);
	},


	handleTouchMove: function(ev) {
		// prevent inertia and touchmove-scrolling while dragging
		if (this.isDragging) {
			ev.preventDefault();
		}

		this.handleMove(ev);
	},


	// Scrolling (unrelated to auto-scroll)
	// -----------------------------------------------------------------------------------------------------------------


	handleScroll: function(ev) {
		// if the drag is being initiated by touch, but a scroll happens before
		// the drag-initiating delay is over, cancel the drag
		if (this.isTouch && !this.isDragging) {
			this.endInteraction();
		}
	},


	// <A> HREF Hack
	// -----------------------------------------------------------------------------------------------------------------


	initHrefHack: function() {
		var subjectEl = this.subjectEl;

		// remove a mousedown'd <a>'s href so it is not visited (IE8 bug)
		if ((this.subjectHref = subjectEl ? subjectEl.attr('href') : null)) {
			subjectEl.removeAttr('href');
		}
	},


	destroyHrefHack: function() {
		var subjectEl = this.subjectEl;
		var subjectHref = this.subjectHref;

		// restore a mousedown'd <a>'s href (for IE8 bug)
		setTimeout(function() { // must be outside of the click's execution
			if (subjectHref) {
				subjectEl.attr('href', subjectHref);
			}
		}, 0);
	},


	// Utils
	// -----------------------------------------------------------------------------------------------------------------


	// Triggers a callback. Calls a function in the option hash of the same name.
	// Arguments beyond the first `name` are forwarded on.
	trigger: function(name) {
		if (this.options[name]) {
			this.options[name].apply(this, Array.prototype.slice.call(arguments, 1));
		}
		// makes _methods callable by event name. TODO: kill this
		if (this['_' + name]) {
			this['_' + name].apply(this, Array.prototype.slice.call(arguments, 1));
		}
	}


});
