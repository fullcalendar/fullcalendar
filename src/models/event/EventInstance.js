
var EventInstance = Class.extend({

	def: null, // EventDef
	dateProfile: null, // EventDateProfile
	dateRange: null, // UnzonedRange


	constructor: function(def, dateProfile) {
		this.def = def;
		this.dateProfile = dateProfile;
		this.dateRange = dateProfile.buildRange(
			def.source.calendar
		);
	},


	buildEventRange: function() { // EventRange
		return new EventRange(
			this.dateRange,
			this.def,
			this
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
