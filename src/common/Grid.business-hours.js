
Grid.mixin({

	// Generates an array of classNames to be used for the rendering business hours overlay. Called by the fill system.
	// Called by fillSegHtml.
	businessHoursSegClasses: function(seg) {
		return [ 'fc-nonbusiness', 'fc-bgevent' ];
	},


	// Compute business hour segs for the grid's current date range.
	// Caller must ask if whole-day business hours are needed.
	buildBusinessHourSegs: function(wholeDay) {
		return this.eventFootprintsToSegs(
			this.buildBusinessHourEventFootprints(wholeDay)
		);
	},


	// Compute business hour *events* for the grid's current date range.
	// Caller must ask if whole-day business hours are needed.
	// FOR RENDERING
	buildBusinessHourEventFootprints: function(wholeDay) {
		var calendar = this.view.calendar;

		return this._buildBusinessHourEventFootprints(wholeDay, calendar.opt('businessHours'));
	},


	_buildBusinessHourEventFootprints: function(wholeDay, businessHourDef) {
		var calendar = this.view.calendar;
		var eventInstanceGroup;
		var eventRanges;

		eventInstanceGroup = calendar.buildBusinessInstanceGroup(
			wholeDay,
			businessHourDef,
			this.unzonedRange
		);

		if (eventInstanceGroup) {
			eventRanges = eventInstanceGroup.sliceRenderRanges(
				this.unzonedRange,
				calendar
			);
		}
		else {
			eventRanges = [];
		}

		return this.eventRangesToEventFootprints(eventRanges);
	}

});
