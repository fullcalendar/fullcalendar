import UnzonedRange from './models/UnzonedRange'
import ComponentFootprint from './models/ComponentFootprint'
import EventFootprint from './models/event/EventFootprint'
import EventDefParser from './models/event/EventDefParser'
import EventSource from './models/event-source/EventSource'
import {
	eventInstanceToEventRange,
	eventFootprintToComponentFootprint,
	eventRangeToEventFootprint
} from './models/event/util'


export default class Constraints {

	eventManager: any
	_calendar: any // discourage


	constructor(eventManager, _calendar) {
		this.eventManager = eventManager;
		this._calendar = _calendar;
	}


	opt(name) {
		return this._calendar.opt(name);
	}


	/*
	determines if eventInstanceGroup is allowed,
	in relation to other EVENTS and business hours.
	*/
	isEventInstanceGroupAllowed(eventInstanceGroup) {
		var eventDef = eventInstanceGroup.getEventDef();
		var eventFootprints = this.eventRangesToEventFootprints(eventInstanceGroup.getAllEventRanges());
		var i;

		var peerEventInstances = this.getPeerEventInstances(eventDef);
		var peerEventRanges = peerEventInstances.map(eventInstanceToEventRange);
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
						eventFootprints[i].componentFootprint.toLegacy(this._calendar),
						eventFootprints[i].getEventLegacy()
					) === false
				) {
					return false;
				}
			}
		}

		return true;
	}


	getPeerEventInstances(eventDef) {
		return this.eventManager.getEventInstancesWithoutId(eventDef.id);
	}


	isSelectionFootprintAllowed(componentFootprint) {
		var peerEventInstances = this.eventManager.getEventInstances();
		var peerEventRanges = peerEventInstances.map(eventInstanceToEventRange);
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
				return selectAllowFunc(componentFootprint.toLegacy(this._calendar)) !== false;
			}
			else {
				return true;
			}
		}

		return false;
	}


	isFootprintAllowed(
		componentFootprint,
		peerEventFootprints,
		constraintVal,
		overlapVal,
		subjectEventInstance? // optional
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
	}


	// Constraint
	// ------------------------------------------------------------------------------------------------


	isFootprintWithinConstraints(componentFootprint, constraintFootprints) {
		var i;

		for (i = 0; i < constraintFootprints.length; i++) {
			if (this.footprintContainsFootprint(constraintFootprints[i], componentFootprint)) {
				return true;
			}
		}

		return false;
	}


	constraintValToFootprints(constraintVal, isAllDay) {
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
	}


	// returns ComponentFootprint[]
	// uses current view's range
	buildCurrentBusinessFootprints(isAllDay) {
		var view = this._calendar.view;
		var businessHourGenerator = view.get('businessHourGenerator');
		var unzonedRange = view.dateProfile.activeUnzonedRange;
		var eventInstanceGroup = businessHourGenerator.buildEventInstanceGroup(isAllDay, unzonedRange);

		if (eventInstanceGroup) {
			return this.eventInstancesToFootprints(eventInstanceGroup.eventInstances);
		}
		else {
			return [];
		}
	}


	// conversion util
	eventInstancesToFootprints(eventInstances) {
		var eventRanges = eventInstances.map(eventInstanceToEventRange);
		var eventFootprints = this.eventRangesToEventFootprints(eventRanges);

		return eventFootprints.map(eventFootprintToComponentFootprint);
	}


	// Overlap
	// ------------------------------------------------------------------------------------------------


	collectOverlapEventFootprints(peerEventFootprints, targetFootprint) {
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
	parseEventDefToInstances(eventInput) {
		var eventManager = this.eventManager;
		var eventDef = EventDefParser.parse(eventInput, new EventSource(this._calendar));

		if (!eventDef) { // invalid
			return false;
		}

		return eventDef.buildInstances(eventManager.currentPeriod.unzonedRange);
	}


	eventRangesToEventFootprints(eventRanges) {
		var i;
		var eventFootprints = [];

		for (i = 0; i < eventRanges.length; i++) {
			eventFootprints.push.apply( // footprints
				eventFootprints,
				this.eventRangeToEventFootprints(eventRanges[i])
			);
		}

		return eventFootprints;
	}


	eventRangeToEventFootprints(eventRange): EventFootprint[] {
		return [ eventRangeToEventFootprint(eventRange) ];
	}


	/*
	Parses footprints directly.
	Very similar to EventDateProfile::parse :(
	*/
	parseFootprints(rawInput) {
		var start, end;

		if (rawInput.start) {
			start = this._calendar.moment(rawInput.start);

			if (!start.isValid()) {
				start = null;
			}
		}

		if (rawInput.end) {
			end = this._calendar.moment(rawInput.end);

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
	}


	// Footprint Utils
	// ----------------------------------------------------------------------------------------


	footprintContainsFootprint(outerFootprint, innerFootprint) {
		return outerFootprint.unzonedRange.containsRange(innerFootprint.unzonedRange);
	}


	footprintsIntersect(footprint0, footprint1) {
		return footprint0.unzonedRange.intersectsWith(footprint1.unzonedRange);
	}

}


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

