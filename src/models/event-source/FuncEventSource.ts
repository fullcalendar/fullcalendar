import * as $ from 'jquery'
import Promise from '../../common/Promise'
import EventSource from './EventSource'


export default class FuncEventSource extends EventSource {

	func: any


	fetch(start, end, timezone) {
		this.calendar.pushLoading();

		return Promise.construct((onResolve) => {
			this.func.call(
				this.calendar,
				start.clone(),
				end.clone(),
				timezone,
				(rawEventDefs) => {
					this.calendar.popLoading();

					onResolve(this.parseEventDefs(rawEventDefs));
				}
			);
		});
	}


	getPrimitive() {
		return this.func;
	}


	applyManualStandardProps(rawProps) {
		var superSuccess = super.applyManualStandardProps(rawProps);

		this.func = rawProps.events;

		return superSuccess;
	}


	static parse(rawInput, calendar) {
		var rawProps;

		// normalize raw input
		if ($.isFunction(rawInput.events)) { // extended form
			rawProps = rawInput;
		}
		else if ($.isFunction(rawInput)) { // short form
			rawProps = { events: rawInput };
		}

		if (rawProps) {
			return EventSource.parse.call(this, rawProps, calendar);
		}

		return false;
	}

}

FuncEventSource.defineStandardProps({
	events: false // don't automatically transfer
});
