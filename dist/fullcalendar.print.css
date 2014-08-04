/*!
 * FullCalendar v2.1.0-beta2 Print Stylesheet
 * Docs & License: http://arshaw.com/fullcalendar/
 * (c) 2013 Adam Shaw
 */

/*
 * Include this stylesheet on your page to get a more printer-friendly calendar.
 * When including this stylesheet, use the media='print' attribute of the <link> tag.
 * Make sure to include this stylesheet IN ADDITION to the regular fullcalendar.css.
 */

.fc {
	max-width: 100% !important;
}


/* Global Event Restyling
--------------------------------------------------------------------------------------------------*/

.fc-event {
	background: #fff !important;
	color: #000 !important;
	page-break-inside: avoid;
}

.fc-event .fc-resizer {
	display: none;
}


/* Table & Day-Row Restyling
--------------------------------------------------------------------------------------------------*/

th,
td,
hr,
thead,
tbody,
.fc-row {
	border-color: #ccc !important;
	background: #fff !important;
}

/* kill the overlaid, absolutely-positioned common components */
.fc-bg,
.fc-highlight-skeleton,
.fc-helper-skeleton {
	display: none;
}

/* don't force a min-height on rows (for DayGrid) */
.fc tbody .fc-row {
	height: auto !important; /* undo height that JS set in distributeHeight */
	min-height: 0 !important; /* undo the min-height from each view's specific stylesheet */
}

.fc tbody .fc-row .fc-content-skeleton {
	position: static; /* undo .fc-rigid */
	/* don't have chunky padding underneath events (for Agenda, basicWeek, basicDay) */
	padding-bottom: 0 !important;
}

/* give back the bottom spacing that was taken away from the content-skeleton's padding (above) */
/* only works on modern browsers */
.fc tbody .fc-row .fc-content-skeleton table tr:last-child td {
	padding-bottom: 1px;
}

/* sets a min-height on the event skeleton. for IE8. was overexaggerating this, so make small */
.fc tbody .fc-row .fc-content-skeleton table {
	height: 2em;
}

/* sets a min-height on the event skeleton. for modern browsers (not IE8) */
.fc tbody .fc-row .fc-content-skeleton table:last-child {
	height: 4em;
}


/* Undo month-view event limiting. Display all events and hide the "more" links
--------------------------------------------------------------------------------------------------*/

.fc-more-cell,
.fc-more {
	display: none !important;
}

.fc tr.fc-limited {
	display: table-row !important;
}

.fc td.fc-limited {
	display: table-cell !important;
}


/* TimeGrid Restyling
--------------------------------------------------------------------------------------------------*/

/* undo the min-height 100% trick used to fill the container's height */
.fc-time-grid {
	min-height: 0 !important;
}

/* don't display the side axis at all ("all-day" and time cells) */
.fc-agenda-view .fc-axis {
	display: none;
}

/* don't display the horizontal lines */
.fc-slats,
.fc-time-grid hr { /* this hr is used when height is underused and needs to be filled */
	display: none !important; /* important overrides inline declaration */
}

/* let the container that holds the events be naturally positioned and create real height */
.fc-time-grid .fc-content-skeleton {
	position: static;
}

/* in case there are no events, we still want some height */
.fc-time-grid .fc-content-skeleton table {
	height: 4em;
}

/* kill the horizontal spacing made by the event container. event margins will be done below */
.fc-time-grid .fc-event-container {
	margin: 0 !important;
}


/* TimeGrid *Event* Restyling
--------------------------------------------------------------------------------------------------*/

/* naturally position events, vertically stacking them */
.fc-time-grid .fc-event {
	position: static !important;
	margin: 3px 2px !important;
}

/* for events that continue to a future day, give the bottom border back */
.fc-time-grid .fc-event.fc-not-end {
	border-bottom-width: 1px !important;
}

/* indicate the event continues via "..." text */
.fc-time-grid .fc-event.fc-not-end:after {
	content: "...";
}

/* for events that are continuations from previous days, give the top border back */
.fc-time-grid .fc-event.fc-not-start {
	border-top-width: 1px !important;
}

/* indicate the event is a continuation via "..." text */
.fc-time-grid .fc-event.fc-not-start:before {
	content: "...";
}

/* time */

/* undo a previous declaration and let the time text span to a second line */
.fc-time-grid .fc-event .fc-time {
	white-space: normal !important;
}

/* hide the the time that is normally displayed... */
.fc-time-grid .fc-event .fc-time span {
	display: none;
}

/* ...replace it with a more verbose version (includes AM/PM) stored in an html attribute */
.fc-time-grid .fc-event .fc-time:after {
	content: attr(data-full);
}


/* Vertical Scroller & Containers
--------------------------------------------------------------------------------------------------*/

/* kill the scrollbars and allow natural height */
.fc-scroller,
.fc-day-grid-container,    /* these divs might be assigned height, which we need to cleared */
.fc-time-grid-container {  /* */
	overflow: visible !important;
	height: auto !important;
}

/* kill the horizontal border/padding used to compensate for scrollbars */
.fc-row {
	border: 0 !important;
	margin: 0 !important;
}


/* Button Controls
--------------------------------------------------------------------------------------------------*/

.fc-button-group,
.fc button {
	display: none; /* don't display any button-related controls */
}
