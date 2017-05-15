
Calendar.prototype.isEventInstanceGroupAllowed = function(eventInstanceGroup) {
	var eventDef = eventInstanceGroup.getEventDef();
	var eventRanges = eventInstanceGroup.buildEventRanges(null, this); // TODO: fix signature
	var eventFootprints = this.eventRangesToEventFootprints(eventRanges);
	var i;

	var constraintVal = eventDef.getConstraint(this);
	var overlapVal = eventDef.getOverlap(this);

	var peerEventDefs = this.getPeerEventDefs(eventDef);
	var peerEventInstances = this.eventDefsToInstances(peerEventDefs);
	var peerEventRanges = this.eventInstancesToEventRanges(peerEventInstances); // TODO: loop through pre-cached ranges instead?
	var peerEventFootprints = this.eventRangesToEventFootprints(peerEventRanges);

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

	return true;
};


Calendar.prototype.isSelectionFootprintAllowed = function(componentFootprint) {
	var peerEventDefs = this.eventDefCollection.eventDefs; // all
	var peerEventInstances = this.eventDefsToInstances(peerEventDefs);
	var peerEventRanges = this.eventInstancesToEventRanges(peerEventInstances); // TODO: loop through pre-cached ranges instead?
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
	var eventDefs;
	var eventDef;
	var eventInstances;
	var eventRanges;
	var eventFootprints;

	if (constraintVal === 'businessHours') {

		eventFootprints = this.buildCurrentBusinessFootprints(isAllDay);

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


Calendar.prototype.getPeerEventDefs = function(subjectEventDef) {
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
	var i;
	var overlapEventInstance;
	var overlapEventDef;
	var overlapVal;

	for (i = 0; i < overlapEventFootprints.length; i++) {
		overlapEventInstance = overlapEventFootprints[i].eventInstance;
		overlapEventDef = overlapEventInstance.eventDefinition;

		// don't need to pass in calendar, because don't want to consider global eventOverlap property,
		// because we already considered that earlier in the process.
		overlapVal = overlapEventDef.getOverlap();

		if (overlapVal === false) {
			return false;
		}
		else if (typeof overlapVal === 'function') {
			if (
				!overlapVal(
					subjectEventInstance.toLegacy(),
					overlapEventInstance.toLegacy()
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
	var activeRange = this.getView().activeRange; // TODO: use EventManager's range?

	return eventDef.buildInstances(activeRange.start, activeRange.end);
};


Calendar.prototype.eventInstancesToEventRanges = function(eventInstances) {
	var group = new EventInstanceGroup(eventInstances);
	var activeRange = this.getView().activeRange; // TODO: use EventManager's range?

	return group.buildEventRanges(
		new UnzonedRange(activeRange.start, activeRange.end),
		this // calendar
	);
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


Calendar.prototype.eventRangeToEventFootprints = function(eventRange) {
	return [
		new EventFootprint(
			eventRange.eventInstance,
			new ComponentFootprint(
				eventRange.dateRange,
				eventRange.eventInstance.eventDateProfile.isAllDay()
			)
		)
	];
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
