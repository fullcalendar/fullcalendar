
var EventInstance = Class.extend({

	eventDefinition: null,
	eventDateProfile: null,

	constructor: function(eventDefinition, eventDateProfile) {
		this.eventDefinition = eventDefinition;
		this.eventDateProfile = eventDateProfile;
	},

	toLegacy: function() {
		var def = this.eventDefinition;
		var dateProfile = this.eventDateProfile;

		return $.extend({}, def.miscProps, {
			_id: def.id,
			id: def.id,
			title: def.title,
			rendering: def.rendering,
			start: dateProfile.start.clone(),
			end: dateProfile.end ? dateProfile.end.clone() : null,
			source: def.source
		});
	}

});
