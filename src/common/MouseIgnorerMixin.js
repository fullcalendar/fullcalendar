
// simple class for toggle a `isIgnoringMouse` flag on delay
// initMouseIgnoring must first be called, with a millisecond delay setting.
var MouseIgnorerMixin = {

	isIgnoringMouse: false, // bool
	delayUnignoreMouse: null, // method


	initMouseIgnoring: function(delay) {
		this.delayUnignoreMouse = debounce(proxy(this, 'unignoreMouse'), delay || 1000);
	},


	// temporarily ignore mouse actions on segments
	tempIgnoreMouse: function() {
		this.isIgnoringMouse = true;
		this.delayUnignoreMouse();
	},


	// delayUnignoreMouse eventually calls this
	unignoreMouse: function() {
		this.isIgnoringMouse = false;
	}

};
