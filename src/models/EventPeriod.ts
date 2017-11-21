import * as $ from 'jquery'
import { removeExact, removeMatching } from '../util'
import Promise from '../common/Promise'
import { default as EmitterMixin, EmitterInterface } from '../common/EmitterMixin'
import UnzonedRange from './UnzonedRange'
import EventInstanceGroup from './event/EventInstanceGroup'


export default class EventPeriod {

	on: EmitterInterface['on']
	one: EmitterInterface['one']
	off: EmitterInterface['off']
	trigger: EmitterInterface['trigger']
	triggerWith: EmitterInterface['triggerWith']
	hasHandlers: EmitterInterface['hasHandlers']

	start: any
	end: any
	timezone: any

	unzonedRange: any

	requestsByUid: any
	pendingCnt: number = 0

	freezeDepth: number = 0
	stuntedReleaseCnt: number = 0
	releaseCnt: number = 0

	eventDefsByUid: any
	eventDefsById: any
	eventInstanceGroupsById: any


	constructor(start, end, timezone) {
		this.start = start;
		this.end = end;
		this.timezone = timezone;

		this.unzonedRange = new UnzonedRange(
			start.clone().stripZone(),
			end.clone().stripZone()
		);

		this.requestsByUid = {};
		this.eventDefsByUid = {};
		this.eventDefsById = {};
		this.eventInstanceGroupsById = {};
	}


	isWithinRange(start, end) {
		// TODO: use a range util function?
		return !start.isBefore(this.start) && !end.isAfter(this.end);
	}


	// Requesting and Purging
	// -----------------------------------------------------------------------------------------------------------------


	requestSources(sources) {
		this.freeze();

		for (var i = 0; i < sources.length; i++) {
			this.requestSource(sources[i]);
		}

		this.thaw();
	}


	requestSource(source) {
		var request = { source: source, status: 'pending', eventDefs: null };

		this.requestsByUid[source.uid] = request;
		this.pendingCnt += 1;

		source.fetch(this.start, this.end, this.timezone).then((eventDefs) => {
			if (request.status !== 'cancelled') {
				request.status = 'completed';
				request.eventDefs = eventDefs;

				this.addEventDefs(eventDefs);
				this.pendingCnt--;
				this.tryRelease();
			}
		}, () => { // failure
			if (request.status !== 'cancelled') {
				request.status = 'failed';

				this.pendingCnt--;
				this.tryRelease();
			}
		});
	}


	purgeSource(source) {
		var request = this.requestsByUid[source.uid];

		if (request) {
			delete this.requestsByUid[source.uid];

			if (request.status === 'pending') {
				request.status = 'cancelled';
				this.pendingCnt--;
				this.tryRelease();
			}
			else if (request.status === 'completed') {
				request.eventDefs.forEach(this.removeEventDef.bind(this));
			}
		}
	}


	purgeAllSources() {
		var requestsByUid = this.requestsByUid;
		var uid, request;
		var completedCnt = 0;

		for (uid in requestsByUid) {
			request = requestsByUid[uid];

			if (request.status === 'pending') {
				request.status = 'cancelled';
			}
			else if (request.status === 'completed') {
				completedCnt++;
			}
		}

		this.requestsByUid = {};
		this.pendingCnt = 0;

		if (completedCnt) {
			this.removeAllEventDefs(); // might release
		}
	}


	// Event Definitions
	// -----------------------------------------------------------------------------------------------------------------


	getEventDefByUid(eventDefUid) {
		return this.eventDefsByUid[eventDefUid];
	}


	getEventDefsById(eventDefId) {
		var a = this.eventDefsById[eventDefId];

		if (a) {
			return a.slice(); // clone
		}

		return [];
	}


	addEventDefs(eventDefs) {
		for (var i = 0; i < eventDefs.length; i++) {
			this.addEventDef(eventDefs[i]);
		}
	}


	addEventDef(eventDef) {
		var eventDefsById = this.eventDefsById;
		var eventDefId = eventDef.id;
		var eventDefs = eventDefsById[eventDefId] || (eventDefsById[eventDefId] = []);
		var eventInstances = eventDef.buildInstances(this.unzonedRange);
		var i;

		eventDefs.push(eventDef);

		this.eventDefsByUid[eventDef.uid] = eventDef;

		for (i = 0; i < eventInstances.length; i++) {
			this.addEventInstance(eventInstances[i], eventDefId);
		}
	}


	removeEventDefsById(eventDefId) {
		this.getEventDefsById(eventDefId).forEach((eventDef) => {
			this.removeEventDef(eventDef);
		});
	}


	removeAllEventDefs() {
		var isEmpty = $.isEmptyObject(this.eventDefsByUid);

		this.eventDefsByUid = {};
		this.eventDefsById = {};
		this.eventInstanceGroupsById = {};

		if (!isEmpty) {
			this.tryRelease();
		}
	}


	removeEventDef(eventDef) {
		var eventDefsById = this.eventDefsById;
		var eventDefs = eventDefsById[eventDef.id];

		delete this.eventDefsByUid[eventDef.uid];

		if (eventDefs) {
			removeExact(eventDefs, eventDef);

			if (!eventDefs.length) {
				delete eventDefsById[eventDef.id];
			}

			this.removeEventInstancesForDef(eventDef);
		}
	}


	// Event Instances
	// -----------------------------------------------------------------------------------------------------------------


	getEventInstances() { // TODO: consider iterator
		var eventInstanceGroupsById = this.eventInstanceGroupsById;
		var eventInstances = [];
		var id;

		for (id in eventInstanceGroupsById) {
			eventInstances.push.apply(eventInstances, // append
				eventInstanceGroupsById[id].eventInstances
			);
		}

		return eventInstances;
	}


	getEventInstancesWithId(eventDefId) {
		var eventInstanceGroup = this.eventInstanceGroupsById[eventDefId];

		if (eventInstanceGroup) {
			return eventInstanceGroup.eventInstances.slice(); // clone
		}

		return [];
	}


	getEventInstancesWithoutId(eventDefId) { // TODO: consider iterator
		var eventInstanceGroupsById = this.eventInstanceGroupsById;
		var matchingInstances = [];
		var id;

		for (id in eventInstanceGroupsById) {
			if (id !== eventDefId) {
				matchingInstances.push.apply(matchingInstances, // append
					eventInstanceGroupsById[id].eventInstances
				);
			}
		}

		return matchingInstances;
	}


	addEventInstance(eventInstance, eventDefId) {
		var eventInstanceGroupsById = this.eventInstanceGroupsById;
		var eventInstanceGroup = eventInstanceGroupsById[eventDefId] ||
			(eventInstanceGroupsById[eventDefId] = new EventInstanceGroup());

		eventInstanceGroup.eventInstances.push(eventInstance);

		this.tryRelease();
	}


	removeEventInstancesForDef(eventDef) {
		var eventInstanceGroupsById = this.eventInstanceGroupsById;
		var eventInstanceGroup = eventInstanceGroupsById[eventDef.id];
		var removeCnt;

		if (eventInstanceGroup) {
			removeCnt = removeMatching(eventInstanceGroup.eventInstances, function(currentEventInstance) {
				return currentEventInstance.def === eventDef;
			});

			if (!eventInstanceGroup.eventInstances.length) {
				delete eventInstanceGroupsById[eventDef.id];
			}

			if (removeCnt) {
				this.tryRelease();
			}
		}
	}


	// Releasing and Freezing
	// -----------------------------------------------------------------------------------------------------------------


	tryRelease() {
		if (!this.pendingCnt) {
			if (!this.freezeDepth) {
				this.release();
			}
			else {
				this.stuntedReleaseCnt++;
			}
		}
	}


	release() {
		this.releaseCnt++;
		this.trigger('release', this.eventInstanceGroupsById);
	}


	whenReleased() {
		if (this.releaseCnt) {
			return Promise.resolve(this.eventInstanceGroupsById);
		}
		else {
			return Promise.construct((onResolve) => {
				this.one('release', onResolve);
			});
		}
	}


	freeze() {
		if (!(this.freezeDepth++)) {
			this.stuntedReleaseCnt = 0;
		}
	}


	thaw() {
		if (!(--this.freezeDepth) && this.stuntedReleaseCnt && !this.pendingCnt) {
			this.release();
		}
	}

}

EmitterMixin.mixInto(EventPeriod)
