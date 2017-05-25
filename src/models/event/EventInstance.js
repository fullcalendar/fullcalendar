
var EventInstance = Class.extend({

	def: null, // EventDef
	dateProfile: null, // EventDateProfile


	constructor: function(def, dateProfile) {
		this.def = def;
		this.dateProfile = dateProfile;
	},


	buildEventRange: function() { // EventRange
		return new EventRange(
			this.buildDateRange(),
			this.def,
			this
		);
	},


	buildDateRange: function() { // UnzonedRange
		return this.dateProfile.buildRange(
			this.def.source.calendar
		);
	},


	toLegacy: function() {
		var dateProfile = this.dateProfile;
		var obj = this.def.toLegacy();

		obj.start = dateProfile.start.clone();
		obj.end = dateProfile.end ? dateProfile.end.clone() : null;

		return obj;
	}

});
