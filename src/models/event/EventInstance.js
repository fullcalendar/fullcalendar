
var EventInstance = Class.extend({

	def: null, // EventDef
	dateProfile: null, // EventDateProfile


	constructor: function(def, dateProfile) {
		this.def = def;
		this.dateProfile = dateProfile;
	},


	buildEventRange: function() { // EventRange
		return new EventRange(
			this,
			this.buildDateRange()
		);
	},


	buildDateRange: function() { // UnzonedRange
		return this.dateProfile.buildRange(
			this.def.source.calendar
		);
	},


	toLegacy: function() {
		var def = this.def;
		var dateProfile = this.dateProfile;
		var obj = {
			_id: def.internalId,
			start: dateProfile.start.clone(),
			end: dateProfile.end ? dateProfile.end.clone() : null,
			allDay: dateProfile.isAllDay(),
			source: def.source,
			className: def.className // should clone?
		};

		if (def.rawId != null) {
			obj.id = def.rawId;
		}

		if (def.title != null) {
			obj.title = def.title;
		}

		if (def.rendering != null) {
			obj.rendering = def.rendering;
		}

		return obj;
	}

});
