
var EventInstanceDataSource = Class.extend(EmitterMixin, ListenerMixin, {

	instanceRepo: null,
	freezeDepth: 0,
	outboundChangeset: null,
	isResolved: false, // for eventAfterAllRender


	constructor: function() {
		this.instanceRepo = new EventInstanceRepo();
	},


	tryReset: function() {
		if (this.isResolved && this.canTrigger()) {
			this.triggerChangeset(new EventInstanceChangeset(
				this.instanceRepo, // removals
				this.instanceRepo // additions
			));
			this.trigger('resolved');
		}
	},


	// Reporting and Triggering
	// -----------------------------------------------------------------------------------------------------------------


	addChangeset: function(changeset) {
		if (!this.outboundChangeset) {
			this.outboundChangeset = new EventInstanceChangeset();
		}

		changeset.applyToChangeset(this.outboundChangeset);

		this.trySendOutbound();
	},


	freeze: function() {
		this.freezeDepth++;
	},


	thaw: function() {
		this.freezeDepth--;
		this.trySendOutbound();
	},


	trySendOutbound: function() { // also might apply outbound changes to INTERNAL data
		var outboundChangeset = this.outboundChangeset;

		if (this.canTrigger()) {

			if (outboundChangeset) {
				outboundChangeset.applyToRepo(this.instanceRepo); // finally internally record

				this.outboundChangeset = null;
				this.triggerChangeset(outboundChangeset);
			}

			// for eventAfterAllRender
			this.isResolved = true;
			this.trigger('resolved');
		}
	},


	canTrigger: function() {
		return !this.freezeDepth;
	},


	triggerChangeset: function(changeset) {
		this.trigger('before:receive');
		this.trigger('receive', changeset);
		this.trigger('after:receive');
	}

});
