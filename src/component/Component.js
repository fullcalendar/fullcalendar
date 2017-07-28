
var Component = Model.extend({

	el: null,


	setElement: function(el) {
		this.el = el;
		this.bindGlobalHandlers();
		this.render();
	},


	removeElement: function() {
		this.unrender();
		this.unbindGlobalHandlers();

		this.el.remove();
		// NOTE: don't null-out this.el in case the View was destroyed within an API callback.
		// We don't null-out the View's other jQuery element references upon destroy,
		//  so we shouldn't kill this.el either.
	},


	bindGlobalHandlers: function() {
	},


	unbindGlobalHandlers: function() {
	},


	render: function() {
	},


	unrender: function() {
	}

});
