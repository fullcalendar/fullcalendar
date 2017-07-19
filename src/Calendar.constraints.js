
/*
determines if eventInstanceGroup is allowed,
in relation to other EVENTS and business hours.
*/
Calendar.prototype.isEventInstanceGroupAllowed = function(eventInstanceGroup) {
	var eventDef = eventInstanceGroup.getEventDef();
	var eventFootprints = this.eventRangesToEventFootprints(eventInstanceGroup.getAllEventRanges());
	var i;

	var peerEventInstances = this.getPeerEventInstances(eventDef);
	var peerEventRanges = eventInstancesToEventRanges(peerEventInstances);
	var peerEventFootprints = this.eventRangesToEventFootprints(peerEventRanges);

	var constraintVal = eventDef.getConstraint();
	var overlapVal = eventDef.getOverlap();

	var eventAllowFunc = this.opt('eventAllow');

	for (i = 0; i < eventFootprints.length; i++) {
		if (
			!this.isFootprintAllowed(
				eventFootprints[i].componentFootprint,
				peerEventFootprints,
				constraintVal,
				overlapVal,
				eventFootprints[i].eventInstance
			)
		) {
			return false;
		}
	}

	if (eventAllowFunc) {
		for (i = 0; i < eventFootprints.length; i++) {
			if (
				eventAllowFunc(
					eventFootprints[i].componentFootprint.toLegacy(this),
					eventFootprints[i].getEventLegacy()
				) === false
			) {
				return false;
			}
		}
	}

	return true;
};


Calendar.prototype.getPeerEventInstances = function(eventDef) {
	return this.eventManager.getEventInstancesWithoutId(eventDef.id);
};


Calendar.prototype.isSelectionFootprintAllowed = function(componentFootprint) {
	var peerEventInstances = this.eventManager.getEventInstances();
	var peerEventRanges = eventInstancesToEventRanges(peerEventInstances);
	var peerEventFootprints = this.eventRangesToEventFootprints(peerEventRanges);

	var selectAllowFunc;

	if (
		this.isFootprintAllowed(
			componentFootprint,
			peerEventFootprints,
			this.opt('selectConstraint'),
			this.opt('selectOverlap')
		)
	) {
		selectAllowFunc = this.opt('selectAllow');

		if (selectAllowFunc) {
			return selectAllowFunc(componentFootprint.toLegacy(this)) !== false;
		}
		else {
			return true;
		}
	}

	return false;
};


Calendar.prototype.isFootprintAllowed = function(
	componentFootprint,
	peerEventFootprints,
	constraintVal,
	overlapVal,
	subjectEventInstance // optional
) {
	var constraintFootprints; // ComponentFootprint[]
	var overlapEventFootprints; // EventFootprint[]

	if (constraintVal != null) {
		constraintFootprints = this.constraintValToFootprints(constraintVal, componentFootprint.isAllDay);

		if (!this.isFootprintWithinConstraints(componentFootprint, constraintFootprints)) {
			return false;
		}
	}

	overlapEventFootprints = this.collectOverlapEventFootprints(peerEventFootprints, componentFootprint);

	if (overlapVal === false) {
		if (overlapEventFootprints.length) {
			return false;
		}
	}
	else if (typeof overlapVal === 'function') {
		if (!isOverlapsAllowedByFunc(overlapEventFootprints, overlapVal, subjectEventInstance)) {
			return false;
		}
	}

	if (subjectEventInstance) {
		if (!isOverlapEventInstancesAllowed(overlapEventFootprints, subjectEventInstance)) {
			return false;
		}
	}

	return true;
};


// Constraint
// ------------------------------------------------------------------------------------------------


Calendar.prototype.isFootprintWithinConstraints = function(componentFootprint, constraintFootprints) {
	var i;

	for (i = 0; i < constraintFootprints.length; i++) {
		if (this.footprintContainsFootprint(constraintFootprints[i], componentFootprint)) {
			return true;
		}
	}

	return false;
};


Calendar.prototype.constraintValToFootprints = function(constraintVal, isAllDay) {
	var eventInstances;

	if (constraintVal === 'businessHours') {
		return this.buildCurrentBusinessFootprints(isAllDay);
	}
	else if (typeof constraintVal === 'object') {
		eventInstances = this.parseEventDefToInstances(constraintVal); // handles recurring events

		if (!eventInstances) { // invalid input. fallback to parsing footprint directly
			return this.parseFootprints(constraintVal);
		}
		else {
			return this.eventInstancesToFootprints(eventInstances);
		}
	}
	else if (constraintVal != null) { // an ID
		eventInstances = this.eventManager.getEventInstancesWithId(constraintVal);

		return this.eventInstancesToFootprints(eventInstances);
	}
};


// conversion util
Calendar.prototype.eventInstancesToFootprints = function(eventInstances) {
	return eventFootprintsToComponentFootprints(
		this.eventRangesToEventFootprints(
			eventInstancesToEventRanges(eventInstances)
		)
	);
};


// Overlap
// ------------------------------------------------------------------------------------------------


Calendar.prototype.collectOverlapEventFootprints = function(peerEventFootprints, targetFootprint) {
	var overlapEventFootprints = [];
	var i;

	for (i = 0; i < peerEventFootprints.length; i++) {
		if (
			this.footprintsIntersect(
				targetFootprint,
				peerEventFootprints[i].componentFootprint
			)
		) {
			overlapEventFootprints.push(peerEventFootprints[i]);
		}
	}

	return overlapEventFootprints;
};


// optional subjectEventInstance
function isOverlapsAllowedByFunc(overlapEventFootprints, overlapFunc, subjectEventInstance) {
	var i;

	for (i = 0; i < overlapEventFootprints.length; i++) {
		if (
			!overlapFunc(
				overlapEventFootprints[i].eventInstance.toLegacy(),
				subjectEventInstance ? subjectEventInstance.toLegacy() : null
			)
		) {
			return false;
		}
	}

	return true;
}


function isOverlapEventInstancesAllowed(overlapEventFootprints, subjectEventInstance) {
	var subjectLegacyInstance = subjectEventInstance.toLegacy();
	var i;
	var overlapEventInstance;
	var overlapEventDef;
	var overlapVal;

	for (i = 0; i < overlapEventFootprints.length; i++) {
		overlapEventInstance = overlapEventFootprints[i].eventInstance;
		overlapEventDef = overlapEventInstance.def;

		// don't need to pass in calendar, because don't want to consider global eventOverlap property,
		// because we already considered that earlier in the process.
		overlapVal = overlapEventDef.getOverlap();

		if (overlapVal === false) {
			return false;
		}
		else if (typeof overlapVal === 'function') {
			if (
				!overlapVal(
					overlapEventInstance.toLegacy(),
					subjectLegacyInstance
				)
			) {
				return false;
			}
		}
	}

	return true;
}


// Conversion: eventDefs -> eventInstances -> eventRanges -> eventFootprints -> componentFootprints
// ------------------------------------------------------------------------------------------------
// NOTE: this might seem like repetitive code with the Grid class, however, this code is related to
// constraints whereas the Grid code is related to rendering. Each approach might want to convert
// eventRanges -> eventFootprints in a different way. Regardless, there are opportunities to make
// this more DRY.


/*
Returns false on invalid input.
*/
Calendar.prototype.parseEventDefToInstances = function(eventInput) {
	var eventPeriod = this.eventManager.currentPeriod;
	var eventDef = EventDefParser.parse(eventInput, new EventSource(this));

	if (!eventDef) { // invalid
		return false;
	}

	if (eventPeriod) {
		return eventDef.buildInstances(eventPeriod.unzonedRange);
	}
	else {
		return [];
	}
};


Calendar.prototype.eventRangesToEventFootprints = function(eventRanges) {
	var i;
	var eventFootprints = [];

	for (i = 0; i < eventRanges.length; i++) {
		eventFootprints.push.apply(eventFootprints, // append
			this.eventRangeToEventFootprints(eventRanges[i])
		);
	}

	return eventFootprints;
};


/*
TODO: somehow more DRY with Grid::eventRangeToEventFootprints
*/
Calendar.prototype.eventRangeToEventFootprints = function(eventRange) {
	return [
		new EventFootprint(
			new ComponentFootprint(
				eventRange.unzonedRange,
				eventRange.eventDef.isAllDay()
			),
			eventRange.eventDef,
			eventRange.eventInstance // might not exist
		)
	];
};


/*
Parses footprints directly.
Very similar to EventDateProfile::parse :(
*/
Calendar.prototype.parseFootprints = function(rawInput) {
	var start, end;

	if (rawInput.start) {
		start = this.moment(rawInput.start);

		if (!start.isValid()) {
			start = null;
		}
	}

	if (rawInput.end) {
		end = this.moment(rawInput.end);

		if (!end.isValid()) {
			end = null;
		}
	}

	return [
		new ComponentFootprint(
			new UnzonedRange(start, end),
			(start && !start.hasTime()) || (end && !end.hasTime()) // isAllDay
		)
	];
};


// Footprint Utils
// ----------------------------------------------------------------------------------------


Calendar.prototype.footprintContainsFootprint = function(outerFootprint, innerFootprint) {
	return outerFootprint.unzonedRange.containsRange(innerFootprint.unzonedRange);
};


Calendar.prototype.footprintsIntersect = function(footprint0, footprint1) {
	return footprint0.unzonedRange.intersectsWith(footprint1.unzonedRange);
};
