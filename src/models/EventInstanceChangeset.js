
var EventInstanceChangeset = EventInstanceRepo.extend({

	removals: null,


	constructor: function(removals, adds) {
		EventInstanceRepo.call(this);

		this.removals = removals || [];

		(adds || []).forEach(this.addEventInstance.bind(this));
	}

});
