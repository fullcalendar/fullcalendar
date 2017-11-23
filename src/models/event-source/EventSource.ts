import * as $ from 'jquery'
import {
	default as ParsableModelMixin,
	ParsableModelInterface
} from '../../common/ParsableModelMixin'
import Class from '../../common/Class'
import EventDefParser from '../event/EventDefParser'


export default class EventSource extends Class {

	applyProps: ParsableModelInterface['applyProps']
	isStandardProp: ParsableModelInterface['isStandardProp']
	static defineStandardProps = ParsableModelMixin.defineStandardProps
	static copyVerbatimStandardProps = ParsableModelMixin.copyVerbatimStandardProps

	calendar: any

	id: any // can stay null
	uid: any
	color: any
	backgroundColor: any
	borderColor: any
	textColor: any
	className: any // array
	editable: any
	startEditable: any
	durationEditable: any
	rendering: any
	overlap: any
	constraint: any
	allDayDefault: any
	eventDataTransform: any // optional function


	// can we do away with calendar? at least for the abstract?
	// useful for buildEventDef
	constructor(calendar) {
		super();
		this.calendar = calendar;
		this.className = [];
		this.uid = String(EventSource.uuid++);
	}


	fetch(start, end, timezone) {
		// subclasses must implement. must return a promise.
	}


	removeEventDefsById(eventDefId) {
		// optional for subclasses to implement
	}


	removeAllEventDefs() {
		// optional for subclasses to implement
	}


	/*
	For compairing/matching
	*/
	getPrimitive(otherSource) {
		// subclasses must implement
	}


	parseEventDefs(rawEventDefs) {
		var i;
		var eventDef;
		var eventDefs = [];

		for (i = 0; i < rawEventDefs.length; i++) {
			eventDef = this.parseEventDef(rawEventDefs[i]);

			if (eventDef) {
				eventDefs.push(eventDef);
			}
		}

		return eventDefs;
	}


	parseEventDef(rawInput) {
		var calendarTransform = this.calendar.opt('eventDataTransform');
		var sourceTransform = this.eventDataTransform;

		if (calendarTransform) {
			rawInput = calendarTransform(rawInput);
		}
		if (sourceTransform) {
			rawInput = sourceTransform(rawInput);
		}

		return EventDefParser.parse(rawInput, this);
	}


	applyManualStandardProps(rawProps) {

		if (rawProps.id != null) {
			this.id = EventSource.normalizeId(rawProps.id);
		}

		// TODO: converge with EventDef
		if ($.isArray(rawProps.className)) {
			this.className = rawProps.className;
		}
		else if (typeof rawProps.className === 'string') {
			this.className = rawProps.className.split(/\s+/);
		}

		return true;
	}


	/*
	rawInput can be any data type!
	*/
	static parse(rawInput, calendar) {
		var source = new this(calendar);

		if (typeof rawInput === 'object') {
			if (source.applyProps(rawInput)) {
				return source;
			}
		}

		return false;
	}


	// IDs
	// -----------------------------------------------------------------------------------------------------------------
	// TODO: converge with EventDef

	static uuid: number = 0

	static normalizeId(id) {
		if (id) {
			return String(id);
		}

		return null;
	}

}

ParsableModelMixin.mixInto(EventSource);


// Parsing
// ---------------------------------------------------------------------------------------------------------------------


EventSource.defineStandardProps({
	// manually process...
	id: false,
	className: false,

	// automatically transfer...
	color: true,
	backgroundColor: true,
	borderColor: true,
	textColor: true,
	editable: true,
	startEditable: true,
	durationEditable: true,
	rendering: true,
	overlap: true,
	constraint: true,
	allDayDefault: true,
	eventDataTransform: true
});
