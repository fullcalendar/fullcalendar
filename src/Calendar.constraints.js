
Calendar.prototype.isEventFootprintAllowed = function(eventFootprint) {
	var eventDef = eventFootprint.eventInstance.eventDefinition;
	var source = eventDef.source || {};
	var constraintVal;
	var overlapVal;

	constraintVal = eventDef.constraint;
	if (constraintVal == null) {
		constraintVal = source.constraint;
		if (constraintVal == null) {
			constraintVal = this.opt('eventConstraint');
		}
	}

	overlapVal = eventDef.overlap;
	if (overlapVal == null) {
		overlapVal = source.overlap;
		if (overlapVal == null) {
			overlapVal = this.opt('eventOverlap');
		}
	}

	return this.isFootprintAllowed(
		eventFootprint.componentFootprint,
		constraintVal,
		overlapVal,
		eventDef
	);
};


Calendar.prototype.isSelectionFootprintAllowed = function(componentFootprint) {
	var selectAllowFunc = this.opt('selectAllow');

	if (this.isFootprintAllowed(
		componentFootprint,
		this.opt('selectConstraint'),
		this.opt('selectOverlap')
	)) {
		if (selectAllowFunc) {
			return selectAllowFunc(selectAllowFunc) !== false;
		}
		else {
			return true;
		}
	}

	return false;
};


Calendar.prototype.isFootprintAllowed = function(componentFootprint, constraintVal, overlapVal, subjectEventDef) {

	console.log('constraint', this.constraintValToFootprints(constraintVal));

	return true;
};


Calendar.prototype.constraintValToFootprints = function(constraintVal) {

	if (constraintVal === 'businessHours') {
		return this.buildCurrentBusinessFootprints();
	}

	if (typeof constraintVal === 'object') {
		return this.eventInputToFootprints(constraintVal);
	}

	return this.eventIdToFootprints(constraintVal);
};


Calendar.prototype.eventInputToFootprints = function(eventInput) {
	var activeRange = this.getView().activeRange;
	var eventDef;
	var eventInstances;
	var eventInstanceGroup;

	if (eventInput.start == null) {
		return []; // invalid
	}

	eventDef = parseEventInput(eventInput, this);
	eventInstances = eventDef.buildInstances(activeRange.start, activeRange.end);
	eventInstanceGroup = new EventInstanceGroup(eventInstances);

	return this.eventInstanceGroupToFootprints(eventInstanceGroup);
};


Calendar.prototype.eventIdToFootprints = function(eventId) {
	var activeRange = this.getView().activeRange;
	var eventDefs = this.eventDefCollection.getById(eventId);
	var eventInstances = [];
	var eventInstanceGroup;
	var i;

	if (!eventDefs) {
		return []; // invalid
	}

	for (i = 0; i < eventDefs.length; i++) {
		eventInstances.push.apply(eventInstances, // append
			eventDefs[i].buildInstances(activeRange.start, activeRange.end)
		);
	}

	eventInstanceGroup = new EventInstanceGroup(eventInstances);

	return this.eventInstanceGroupToFootprints(eventInstanceGroup);
};
