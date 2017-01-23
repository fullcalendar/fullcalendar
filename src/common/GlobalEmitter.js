
/*
Listens to document and window-level user-interaction events, like touch events and mouse events,
and fires these events as-is to whoever is observing a GlobalEmitter.
Best when used as a singleton via GlobalEmitter.get()
*/
var GlobalEmitter = Class.extend(ListenerMixin, EmitterMixin, {

	handleScrollProxy: null,


	bind: function() {
		var _this = this;
		var doc = $(document);

		$.each([
			'mousedown', 'mousemove', 'mouseup',
			'touchstart', 'touchmove', 'touchcancel', 'touchend',
			'selectstart', 'contextmenu'
		], function(i, eventName) {
			_this.listenTo(doc, eventName, function(ev) {
				_this.trigger(eventName, ev);
			});
		});

		// attach a handler to get called when ANY scroll action happens on the page.
		// this was impossible to do with normal on/off because 'scroll' doesn't bubble.
		// http://stackoverflow.com/a/32954565/96342
		window.addEventListener(
			'scroll',
			this.handleScrollProxy = proxy(this, 'handleScroll'),
			true // useCapture
		);
	},


	unbind: function() {
		this.stopListeningTo($(document));

		window.removeEventListener(
			'scroll',
			this.handleScrollProxy,
			true // useCapture
		);
	},


	handleScroll: function(ev) {
		this.trigger('scroll', ev);
	}

});


// Singleton
// ---------------------------------------------------------------------------------------------------------------------

(function() {
	var globalEmitter = null;
	var neededCount = 0;


	// gets the singleton
	GlobalEmitter.get = function() {

		if (!globalEmitter) {
			globalEmitter = new GlobalEmitter();
			globalEmitter.bind();
		}

		return globalEmitter;
	};


	// called when an object knows it will need a GlobalEmitter in the near future.
	GlobalEmitter.needed = function() {
		GlobalEmitter.get(); // ensures globalEmitter
		neededCount++;
	};


	// called when the object that originally called needed() doesn't need a GlobalEmitter anymore.
	GlobalEmitter.unneeded = function() {
		neededCount--;

		if (!neededCount) { // nobody else needs it
			globalEmitter.unbind();
			globalEmitter = null;
		}
	};

})();
