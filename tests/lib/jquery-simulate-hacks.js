(function($) {

	/*
	Addresses a shortcoming with jquery-simulate[-ext] where a click event doesn't
	provide pageX/pageY coordinates. Should be the centered coordinates of the element.
	This file needs to be loaded after jquery-simulate and jquery-simulate-ext.
	*/

	var originalMouseEvent = $.simulate.prototype.mouseEvent;

	$.simulate.prototype.mouseEvent = function(type, options) {
		if (type === 'click' && options.pageX === undefined && options.pageY === undefined) {
			$.extend(options, findCenterPageXY(this.target));
		}
		// after this, jquery-simulate-ext will calculate screenX/screenY
		// and jquery-simulate will calculate clientX/clientY...
		return originalMouseEvent.apply(this, [ type, options ]);
	};

	function findCenterPageXY( elem ) {
		var offset,
			$elem = $(elem),
			offset = $elem.offset();
		
		return {
			pageX: Math.round(offset.left + $elem.outerWidth() / 2),
			pageY: Math.round(offset.top + $elem.outerHeight() / 2)
		};
	}


	/*
	Give jquery-simulate-ext drag-n-drop a default interpolation.
	*/

	var originalSimulate = $.fn.simulate;

	$.fn.simulate = function(eventName, options) {

		if (eventName == 'drag' || eventName == 'drop' || eventName == 'drag-n-drop') {
			options = options || {};
			if (options.interpolation === undefined) {
				options.interpolation = {
					stepCount: 10,
					duration: 100
				};
			}
			return originalSimulate.call(this, eventName, options);
		}

		return originalSimulate.apply(this, arguments);
	};

})(jQuery);