
export default {

	version: "<%= version %>",

	// When introducing internal API incompatibilities (where fullcalendar plugins would break),
	// the minor version of the calendar should be upped (ex: 2.7.2 -> 2.8.0)
	// and the below integer should be incremented.
	internalApiVersion: 12,

	// for GlobalEmitter
	touchMouseIgnoreWait: 500,

	// for ExternalDropping
	// Require all HTML5 data-* attributes used by FullCalendar to have this prefix.
	// A value of '' will query attributes like data-event. A value of 'fc' will query attributes like data-fc-event.
	dataAttrPrefix: '',

	views: {},
	locales: {}

}
