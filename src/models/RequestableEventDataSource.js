
var RequestableEventDataSource = EventDataSource.extend({

	currentStart: null,
	currentEnd: null,
	currentTimezone: null,

	requestsByUid: null,
	pendingSourceCnt: 0,


	constructor: function() {
		EventDataSource.call(this);

		this.requestsByUid = {};
	},


	request: function(start, end, timezone, force) {
		if (
			force ||
			!this.currentStart || // first fetch?
			this.currentTimezone !== timezone || // different timezone?
			start.isBefore(this.currentStart) || // out of bounds?
			end.isAfter(this.currentEnd)         // "
		) {
			this.currentTimezone = timezone;
			this.currentStart = start;
			this.currentEnd = end;
			this.currentUnzonedRange = new UnzonedRange(
				start.clone().stripZone(),
				end.clone().stripZone()
			);

			this.refetchAllSources();
		}
	},


	refetchSource: function(eventSource) {
		if (this.currentUnzonedRange) {
			this.freeze();
			this.purgeSource(eventSource);
			this.requestSource(eventSource);
			this.thaw();
		}
	},


	refetchAllSources: function() {
		if (this.currentUnzonedRange) {
			this.freeze();
			this.purgeAllSources();
			this.requestSources(this.getSources());
			this.thaw();
		}
	},


	getSources: function() {
		return [];
	},


	requestSources: function(sources) {
		this.freeze();

		for (var i = 0; i < sources.length; i++) {
			this.requestSource(sources[i]);
		}

		this.thaw();
	},


	requestSource: function(source) {
		var _this = this;
		var request = { source: source, status: 'pending' };

		this.requestsByUid[source.uid] = request;
		this.pendingSourceCnt += 1;

		source.fetch(this.currentStart, this.currentEnd, this.currentTimezone).then(function(eventDefs) {
			if (request.status !== 'cancelled') {
				request.status = 'completed';
				request.eventDefs = eventDefs;

				_this.addEventDefs(eventDefs);
				_this.reportSourceDone();
			}
		}, function() { // failure
			if (request.status !== 'cancelled') {
				request.status = 'failed';

				_this.reportSourceDone();
			}
		});
	},


	purgeSource: function(source) {
		var request = this.requestsByUid[source.uid];

		if (request) {
			delete this.requestsByUid[source.uid];

			if (request.status === 'pending') {
				request.status = 'cancelled';

				this.reportSourceDone();
			}
			else if (request.status === 'completed') {
				this.freeze();

				request.eventDefs.forEach(this.removeEventDef.bind(this));

				this.thaw();
			}
		}
	},


	purgeAllSources: function() {
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

		this.pendingSourceCnt = 0;
		this.requestsByUid = {};

		if (completedCnt) {
			this.removeAllEventDefs();
		}
	},


	reportSourceDone: function() {
		this.pendingSourceCnt--;
		this.trySendOutbound();
	},


	canTrigger: function() {
		return EventDataSource.prototype.canTrigger.apply(this, arguments) &&
			!this.pendingSourceCnt;
	}

});
