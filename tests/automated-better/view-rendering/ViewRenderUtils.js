
var ViewRenderUtils = {

	expectDayRange: function(start, end) {
		start = this.processWholeDay(start);
		end = this.processWholeDay(end);

		var dayBefore = start.clone().subtract(1, 'day');
		this.expectDay(dayBefore, false);

		var date = start.clone();
		while (date < end) {
			this.expectDay(date, true);
			date.add(1, 'day');
		}

		// `date` is now the first day after the range
		this.expectDay(date, false);
	},

	expectDay: function(date, bool) {
		date = this.processWholeDay(date);
		var els = $('td.fc-day[data-date="' + date.format() + '"]');

		if (bool) {
			expect(els).toBeInDOM();
		}
		else {
			expect(els).not.toBeInDOM();
		}
	},

	processWholeDay: function(date) {
		date = $.fullCalendar.moment.parseZone(date);
		expect(date.hasTime()).toBe(false);
		expect(date.hasZone()).toBe(false);
		return date;
	}

};
