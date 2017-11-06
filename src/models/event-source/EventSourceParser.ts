
export default {

	sourceClasses: [],


	registerClass: function(EventSourceClass) {
		this.sourceClasses.unshift(EventSourceClass); // give highest priority
	},


	parse: function(rawInput, calendar) {
		var sourceClasses = this.sourceClasses;
		var i;
		var eventSource;

		for (i = 0; i < sourceClasses.length; i++) {
			eventSource = sourceClasses[i].parse(rawInput, calendar);

			if (eventSource) {
				return eventSource;
			}
		}
	}

}
