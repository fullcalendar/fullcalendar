import EventDef from './EventDef'
import EventInstance from './EventInstance'
import EventDateProfile from './EventDateProfile'


export default class SingleEventDef extends EventDef {

	dateProfile: any


	/*
	Will receive start/end params, but will be ignored.
	*/
	buildInstances() {
		return [ this.buildInstance() ];
	}


	buildInstance() {
		return new EventInstance(
			this, // definition
			this.dateProfile
		);
	}


	isAllDay() {
		return this.dateProfile.isAllDay();
	}


	clone() {
		var def = super.clone();

		def.dateProfile = this.dateProfile;

		return def;
	}


	rezone() {
		var calendar = this.source.calendar;
		var dateProfile = this.dateProfile;

		this.dateProfile = new EventDateProfile(
			calendar.moment(dateProfile.start),
			dateProfile.end ? calendar.moment(dateProfile.end) : null,
			calendar
		);
	}


	/*
	NOTE: if super-method fails, should still attempt to apply
	*/
	applyManualStandardProps(rawProps) {
		var superSuccess = super.applyManualStandardProps(rawProps);
		var dateProfile = EventDateProfile.parse(rawProps, this.source); // returns null on failure

		if (dateProfile) {
			this.dateProfile = dateProfile;

			// make sure `date` shows up in the legacy event objects as-is
			if (rawProps.date != null) {
				this.miscProps.date = rawProps.date;
			}

			return superSuccess;
		}
		else {
			return false;
		}
	}

}


// Parsing
// ---------------------------------------------------------------------------------------------------------------------


SingleEventDef.defineStandardProps({ // false = manually process
	start: false,
	date: false, // alias for 'start'
	end: false,
	allDay: false
});
