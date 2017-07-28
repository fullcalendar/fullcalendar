
var Interaction = Class.extend({

	view: null,
	component: null,


	constructor: function(component) {
		this.view = component._getView();
		this.component = component;
	},


	opt: function(name) {
		return this.view.opt(name);
	},


	end: function() {
		// subclasses can implement
	}

});
