
Calendar.prototype.isEventFootprintAllowed = function(eventFootprint) {
	var eventDef = eventFootprint.eventInstance.eventDefinition;
	var constraintVal = eventDef.getConstraint(this);
	var overlapVal = eventDef.getOverlap(this);

	return this.isFootprintAllowed(
		eventFootprint.componentFootprint,
		constraintVal,
		overlapVal,
		eventFootprint.eventInstance
	);
};


Calendar.prototype.isSelectionFootprintAllowed = function(componentFootprint) {
	var selectAllowFunc;

	if (
		this.isFootprintAllowed(
			componentFootprint,
			this.opt('selectConstraint'),
			this.opt('selectOverlap')
		)
	) {
		selectAllowFunc = this.opt('selectAllow');

		if (selectAllowFunc) {
			return selectAllowFunc(componentFootprint.toLegacy()) !== false;
		}
		else {
			return true;
		}
	}

	return false;
};


Calendar.prototype.isFootprintAllowed = function(
	componentFootprint,
	constraintVal,
	overlapVal,
	subjectEventInstance
) {
	var constraintFootprints; // ComponentFootprint[]
	var overlapEventFootprints; // EventFootprint[]

	if (constraintVal != null) {
		constraintFootprints = this.constraintValToFootprints(constraintVal);

		if (!this.isFootprintWithinConstraints(componentFootprint, constraintFootprints)) {
			return false;
		}
	}

	// TODO: somehow cache this for multiple calls that all share the same EventDefinition
	overlapEventFootprints = this.getOverlappingEventFootprints(componentFootprint, subjectEventInstance);

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
	else if (subjectEventInstance) {
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
		if (this.footprintContainsFootprint(
			constraintFootprints[i],
			componentFootprint
		)) {
			return true;
		}
	}

	return false;
};


Calendar.prototype.constraintValToFootprints = function(constraintVal) {
	var eventDefs;
	var eventDef;
	var eventInstances;
	var eventRanges;
	var eventFootprints;

	if (constraintVal === 'businessHours') {

		eventFootprints = this.buildCurrentBusinessFootprints();

		return eventFootprintsToComponentFootprints(eventFootprints);
	}
	else if (typeof constraintVal === 'object') {

		eventDef = parseEventInput(constraintVal, this);
		eventInstances = this.eventDefToInstances(eventDef);
		eventRanges = this.eventInstancesToEventRanges(eventInstances);
		eventFootprints = this.eventRangesToEventFootprints(eventRanges);

		return eventFootprintsToComponentFootprints(eventFootprints);
	}
	else if (constraintVal != null) { // an ID

		eventDefs = this.eventDefCollection.getById(constraintVal);
		eventInstances = this.eventDefsToInstances(eventDefs);
		eventRanges = this.eventInstancesToEventRanges(eventInstances);
		eventFootprints = this.eventRangesToEventFootprints(eventRanges);

		return eventFootprintsToComponentFootprints(eventFootprints);
	}

	return [];
};


// Overlap
// ------------------------------------------------------------------------------------------------


Calendar.prototype.getOverlappingEventFootprints = function(componentFootprint, subjectEventInstance) {
	var peerEventFootprints = this.getPeerEventFootprints(subjectEventInstance);
	var overlapEventFootprints = [];
	var i;

	for (i = 0; i < peerEventFootprints.length; i++) {
		if (
			this.footprintsIntersect(
				componentFootprint,
				peerEventFootprints[i].componentFootprint
			)
		) {
			overlapEventFootprints.push(peerEventFootprints[i]);
		}
	}

	return overlapEventFootprints;
};


Calendar.prototype.getPeerEventFootprints = function(subjectEventInstance) {
	var peerEventDefs = subjectEventInstance ?
		this.getUnrelatedEventDefs(subjectEventInstance.eventDefinition) :
		this.eventDefCollection.eventDefs.slice(); // all. clone

	var peerEventInstances = this.eventDefsToInstances(peerEventDefs);
	var peerEventRanges = this.eventInstancesToEventRanges(peerEventInstances);

	return this.eventRangesToEventFootprints(peerEventRanges);
};


Calendar.prototype.getUnrelatedEventDefs = function(subjectEventDef) {
	var eventDefs = this.eventDefCollection.eventDefs;
	var i, eventDef;
	var unrelated = [];

	for (i = 0; i < eventDefs.length; i++) {
		eventDef = eventDefs[i];

		if (eventDef.id !== subjectEventDef.id) {
			unrelated.push(eventDef);
		}
	}

	return unrelated;
};


function isOverlapsAllowedByFunc(overlapEventFootprints, overlapFunc, subjectEventInstance) {
	var i;

	for (i = 0; i < overlapEventFootprints.length; i++) {
		if (!overlapFunc(
			overlapEventFootprints[i].eventInstance.toLegacy(),
			subjectEventInstance ? subjectEventInstance.toLegacy() : null
		)) {
			return false;
		}
	}

	return true;
}


function isOverlapEventInstancesAllowed(overlapEventFootprints, subjectEventInstance) {
	var i;
	var overlapEventFootprint;
	var overlapEventInstance;
	var overlapEventDef;
	var overlapVal;

	for (i = 0; i < overlapEventFootprints.length; i++) {
		overlapEventFootprint = overlapEventFootprints[i];
		overlapEventInstance = overlapEventFootprint.eventInstance;
		overlapEventDef = overlapEventInstance.eventDefinition;

		// TODO: use EventDef
		overlapVal = overlapEventDef.overlap;
		if (overlapVal == null) {
			if (overlapEventDef.source) {
				overlapVal = overlapEventDef.source.overlap;
			}
		}

		if (overlapVal === false) {
			return false;
		}
		else if (typeof overlapVal === 'function') {
			if (!overlapVal(
				subjectEventInstance.toLegacy(),
				overlapEventInstance.toLegacy()
			)) {
				return false;
			}
		}
	}

	return true;
}


// Conversion: eventDefs -> eventInstances -> eventRanges -> eventFootprints -> componentFootprints
// ------------------------------------------------------------------------------------------------
// TODO: this is not DRY with Grid


Calendar.prototype.eventDefsToInstances = function(eventDefs) {
	var eventInstances = [];
	var i;

	for (i = 0; i < eventDefs.length; i++) {
		eventInstances.push.apply(eventInstances, // append
			this.eventDefToInstances(eventDefs[i])
		);
	}

	return eventInstances;
};


Calendar.prototype.eventDefToInstances = function(eventDef) {
	var activeRange = this.getView().activeRange;

	return eventDef.buildInstances(activeRange.start, activeRange.end);
};


Calendar.prototype.eventInstancesToEventRanges = function(eventInstances) {
	var group = new EventInstanceGroup(eventInstances);
	var activeRange = this.getView().activeRange;

	return group.buildEventRanges(
		new UnzonedRange(activeRange.start, activeRange.end),
		this // calendar
	);
};


Calendar.prototype.eventRangesToEventFootprints = function(eventRanges) {
	var _this = this;

	return eventRanges.map(function(eventRange) {
		return _this.eventRangeToEventFootprint(eventRange);
	});
};


Calendar.prototype.eventRangeToEventFootprint = function(eventRange) {
	return new EventFootprint( // TODO: DRY. also in Grid.event.js
		eventRange.eventInstance,
		new ComponentFootprint(
			eventRange.dateRange,
			eventRange.eventInstance.eventDateProfile.isAllDay()
		)
	);
};


function eventFootprintsToComponentFootprints(eventFootprints) {
	return eventFootprints.map(function(eventFootprint) {
		return eventFootprint.componentFootprint;
	});
}


// Footprint Utils
// ----------------------------------------------------------------------------------------


Calendar.prototype.footprintContainsFootprint = function(outerFootprint, innerFootprint) {
	// TODO: use date range utils
	return innerFootprint.dateRange.startMs >= outerFootprint.dateRange.startMs &&
		innerFootprint.dateRange.endMs <= outerFootprint.dateRange.endMs;
};


Calendar.prototype.footprintsIntersect = function(footprint0, footprint1) {
	// TODO: use date range utils
	return footprint0.dateRange.startMs < footprint1.dateRange.endMs &&
		footprint0.dateRange.endMs > footprint1.dateRange.startMs;
};
