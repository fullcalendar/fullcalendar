
v2.0.0 (2014-06-01)
-------------------

Internationalization support, timezone support, and [MomentJS] integration. Extensive changes, many
of which are backwards incompatible.

[Full list of changes][Upgrading-to-2] | [Affected Issues][Date-Milestone]

An automated testing framework has been set up ([Karma] + [Jasmine]) and tests have been written
which cover about half of FullCalendar's functionality. Special thanks to @incre-d, @vidbina, and
@sirrocco for the help.

In addition, the main development repo has been repurposed to also include the built distributable
JS/CSS for the project and will serve as the new [Bower] endpoint.

[MomentJS]: http://momentjs.com/
[Upgrading-to-2]: http://arshaw.com/fullcalendar/wiki/Upgrading-to-2/
[Date-Milestone]: https://code.google.com/p/fullcalendar/issues/list?can=1&q=milestone%3Ddate
[Karma]: http://karma-runner.github.io/
[Jasmine]: http://jasmine.github.io/
[Bower]: http://bower.io/


v1.6.4 (2013-09-01)
-------------------

- better algorithm for positioning timed agenda events ([1115])
- `slotEventOverlap` option to tweak timed agenda event overlapping ([218])
- selection bug when slot height is customized ([1035])
- supply view argument in `loading` callback ([1018])
- fixed week number not displaying in agenda views ([1951])
- fixed fullCalendar not initializing with no options ([1356])
- NPM's `package.json`, no more warnings or errors ([1762])
- building the bower component should output `bower.json` instead of `component.json` ([PR 125])
- use bower internally for fetching new versions of jQuery and jQuery UI

[1115]: https://code.google.com/p/fullcalendar/issues/detail?id=1115
[218]: https://code.google.com/p/fullcalendar/issues/detail?id=218
[1035]: https://code.google.com/p/fullcalendar/issues/detail?id=1035
[1018]: https://code.google.com/p/fullcalendar/issues/detail?id=1018
[1951]: https://code.google.com/p/fullcalendar/issues/detail?id=1951
[1356]: https://code.google.com/p/fullcalendar/issues/detail?id=1356
[1762]: https://code.google.com/p/fullcalendar/issues/detail?id=1762
[PR 125]: https://github.com/arshaw/fullcalendar/pull/125


v1.6.3 (2013-08-10)
-------------------

- `viewRender` callback ([PR 15])
- `viewDestroy` callback ([PR 15])
- `eventDestroy` callback ([PR 111])
- `handleWindowResize` option ([PR 54])
- `eventStartEditable`/`startEditable` options ([PR 49])
- `eventDurationEditable`/`durationEditable` options ([PR 49])
- specify function for `$.ajax` `data` parameter for JSON event sources ([PR 59])
- fixed bug with agenda event dropping in wrong column ([PR 55])
- easier event element z-index customization ([PR 58])
- classNames on past/future days ([PR 88])
- allow `null`/`undefined` event titles ([PR 84])
- small optimize for agenda event rendering ([PR 56])
- deprecated:
	- `viewDisplay`
	- `disableDragging`
	- `disableResizing`
- bundled with latest jQuery (1.10.2) and jQuery UI (1.10.3)

[PR 15]: https://github.com/arshaw/fullcalendar/pull/15
[PR 111]: https://github.com/arshaw/fullcalendar/pull/111
[PR 54]: https://github.com/arshaw/fullcalendar/pull/54
[PR 49]: https://github.com/arshaw/fullcalendar/pull/49
[PR 59]: https://github.com/arshaw/fullcalendar/pull/59
[PR 55]: https://github.com/arshaw/fullcalendar/pull/55
[PR 58]: https://github.com/arshaw/fullcalendar/pull/58
[PR 88]: https://github.com/arshaw/fullcalendar/pull/88
[PR 84]: https://github.com/arshaw/fullcalendar/pull/84
[PR 56]: https://github.com/arshaw/fullcalendar/pull/56


v1.6.2 (2013-07-18)
-------------------

- `hiddenDays` option ([686])
- bugfix: when `eventRender` returns `false`, incorrect stacking of events ([762])
- bugfix: couldn't change `event.backgroundImage` when calling `updateEvent` (thx stephenharris)

[686]: https://code.google.com/p/fullcalendar/issues/detail?id=686
[762]: https://code.google.com/p/fullcalendar/issues/detail?id=762


v1.6.1 (2013-04-14)
-------------------

- fixed event inner content overflow bug ([1783])
- fixed table header className bug [1772]
- removed text-shadow on events (better for general use, thx tkrotoff)

[1783]: https://code.google.com/p/fullcalendar/issues/detail?id=1783
[1772]: https://code.google.com/p/fullcalendar/issues/detail?id=1772


v1.6.0 (2013-03-18)
-------------------

- visual facelift, with bootstrap-inspired buttons and colors
- simplified HTML/CSS for events and buttons
- `dayRender`, for modifying a day cell ([191], thx althaus)
- week numbers on side of calendar ([295])
	- `weekNumber`
	- `weekNumberCalculation`
	- `weekNumberTitle`
	- `W` formatting variable
- finer snapping granularity for agenda view events ([495], thx ms-doodle-com)
- `eventAfterAllRender` ([753], thx pdrakeweb)
- `eventDataTransform` (thx joeyspo)
- `data-date` attributes on cells (thx Jae)
- expose `$.fullCalendar.dateFormatters`
- when clicking fast on buttons, prevent text selection
- bundled with latest jQuery (1.9.1) and jQuery UI (1.10.2)
- Grunt/Lumbar build system for internal development
- build for Bower package manager
- build for jQuery plugin site

[191]: https://code.google.com/p/fullcalendar/issues/detail?id=191
[295]: https://code.google.com/p/fullcalendar/issues/detail?id=295
[495]: https://code.google.com/p/fullcalendar/issues/detail?id=495
[753]: https://code.google.com/p/fullcalendar/issues/detail?id=753


v1.5.4 (2012-09-05)
-------------------

- made compatible with jQuery 1.8.* (thx archaeron)
- bundled with jQuery 1.8.1 and jQuery UI 1.8.23


v1.5.3 (2012-02-06)
-------------------

- fixed dragging issue with jQuery UI 1.8.16 ([1168])
- bundled with jQuery 1.7.1 and jQuery UI 1.8.17

[1168]: https://code.google.com/p/fullcalendar/issues/detail?id=1168


v1.5.2 (2011-08-21)
-------------------

- correctly process UTC "Z" ISO8601 date strings ([750])

[750]: https://code.google.com/p/fullcalendar/issues/detail?id=750


v1.5.1 (2011-04-09)
-------------------

- more flexible ISO8601 date parsing ([814])
- more flexible parsing of UNIX timestamps ([826])
- FullCalendar now buildable from source on a Mac ([795])
- FullCalendar QA'd in FF4 ([883])
- upgraded to jQuery 1.5.2 (which supports IE9) and jQuery UI 1.8.11

[814]: https://code.google.com/p/fullcalendar/issues/detail?id=814
[826]: https://code.google.com/p/fullcalendar/issues/detail?id=826
[795]: https://code.google.com/p/fullcalendar/issues/detail?id=795
[883]: https://code.google.com/p/fullcalendar/issues/detail?id=883


v1.5 (2011-03-19)
-----------------

- slicker default styling for buttons
- reworked a lot of the calendar's HTML and accompanying CSS (solves [327] and [395])
- more printer-friendly (fullcalendar-print.css)
- fullcalendar now inherits styles from jquery-ui themes differently.
  styles for buttons are distinct from styles for calendar cells.
  (solves [299])
- can now color events through FullCalendar options and Event-Object properties ([117])
  THIS IS NOW THE PREFERRED METHOD OF COLORING EVENTS (as opposed to using className and CSS)
	- FullCalendar options:
		- eventColor (changes both background and border)
		- eventBackgroundColor
		- eventBorderColor
		- eventTextColor
	- Event-Object options:
		- color (changes both background and border)
		- backgroundColor
		- borderColor
		- textColor
- can now specify an event source as an *object* with a `url` property (json feed) or
  an `events` property (function or array) with additional properties that will
  be applied to the entire event source:
	- color (changes both background and border)
	- backgroudColor
	- borderColor
	- textColor
	- className
	- editable
	- allDayDefault
	- ignoreTimezone
	- startParam (for a feed)
	- endParam   (for a feed)
	- ANY OF THE JQUERY $.ajax OPTIONS
	  allows for easily changing from GET to POST and sending additional parameters ([386])
	  allows for easily attaching ajax handlers such as `error` ([754])
	  allows for turning caching on ([355])
- Google Calendar feeds are now specified differently:
	- specify a simple string of your feed's URL
	- specify an *object* with a `url` property of your feed's URL.
	  you can include any of the new Event-Source options in this object.
	- the old `$.fullCalendar.gcalFeed` method still works
- no more IE7 SSL popup ([504])
- remove `cacheParam` - use json event source `cache` option instead
- latest jquery/jquery-ui

[327]: https://code.google.com/p/fullcalendar/issues/detail?id=327
[395]: https://code.google.com/p/fullcalendar/issues/detail?id=395
[299]: https://code.google.com/p/fullcalendar/issues/detail?id=299
[117]: https://code.google.com/p/fullcalendar/issues/detail?id=117
[386]: https://code.google.com/p/fullcalendar/issues/detail?id=386
[754]: https://code.google.com/p/fullcalendar/issues/detail?id=754
[355]: https://code.google.com/p/fullcalendar/issues/detail?id=355
[504]: https://code.google.com/p/fullcalendar/issues/detail?id=504


v1.4.11 (2011-02-22)
--------------------

- fixed rerenderEvents bug ([790])
- fixed bug with faulty dragging of events from all-day slot in agenda views
- bundled with jquery 1.5 and jquery-ui 1.8.9

[790]: https://code.google.com/p/fullcalendar/issues/detail?id=790


v1.4.10 (2011-01-02)
--------------------

- fixed bug with resizing event to different week in 5-day month view ([740])
- fixed bug with events not sticking after a removeEvents call ([757])
- fixed bug with underlying parseTime method, and other uses of parseInt ([688])

[740]: https://code.google.com/p/fullcalendar/issues/detail?id=740
[757]: https://code.google.com/p/fullcalendar/issues/detail?id=757
[688]: https://code.google.com/p/fullcalendar/issues/detail?id=688


v1.4.9 (2010-11-16)
-------------------

- new algorithm for vertically stacking events ([111])
- resizing an event to a different week ([306])
- bug: some events not rendered with consecutive calls to addEventSource ([679])

[111]: https://code.google.com/p/fullcalendar/issues/detail?id=111
[306]: https://code.google.com/p/fullcalendar/issues/detail?id=306
[679]: https://code.google.com/p/fullcalendar/issues/detail?id=679


v1.4.8 (2010-10-16)
-------------------

- ignoreTimezone option (set to `false` to process UTC offsets in ISO8601 dates)
- bugfixes
	- event refetching not being called under certain conditions ([417], [554])
	- event refetching being called multiple times under certain conditions ([586], [616])
	- selection cannot be triggered by right mouse button ([558])
	- agenda view left axis sized incorrectly ([465])
	- IE js error when calendar is too narrow ([517])
	- agenda view looks strange when no scrollbars ([235])
	- improved parsing of ISO8601 dates with UTC offsets
- $.fullCalendar.version
- an internal refactor of the code, for easier future development and modularity

[417]: https://code.google.com/p/fullcalendar/issues/detail?id=417
[554]: https://code.google.com/p/fullcalendar/issues/detail?id=554
[586]: https://code.google.com/p/fullcalendar/issues/detail?id=586
[616]: https://code.google.com/p/fullcalendar/issues/detail?id=616
[558]: https://code.google.com/p/fullcalendar/issues/detail?id=558
[465]: https://code.google.com/p/fullcalendar/issues/detail?id=465
[517]: https://code.google.com/p/fullcalendar/issues/detail?id=517
[235]: https://code.google.com/p/fullcalendar/issues/detail?id=235


v1.4.7 (2010-07-05)
-------------------

- "dropping" external objects onto the calendar
	- droppable (boolean, to turn on/off)
	- dropAccept (to filter which events the calendar will accept)
	- drop (trigger)
- selectable options can now be specified with a View Option Hash
- bugfixes
	- dragged & reverted events having wrong time text ([406])
	- bug rendering events that have an endtime with seconds, but no hours/minutes ([477])
	- gotoDate date overflow bug ([429])
	- wrong date reported when clicking on edge of last column in agenda views [412]
- support newlines in event titles
- select/unselect callbacks now passes native js event

[406]: https://code.google.com/p/fullcalendar/issues/detail?id=406
[477]: https://code.google.com/p/fullcalendar/issues/detail?id=477
[429]: https://code.google.com/p/fullcalendar/issues/detail?id=429
[412]: https://code.google.com/p/fullcalendar/issues/detail?id=412


v1.4.6 (2010-05-31)
-------------------

- "selecting" days or timeslots
	- options: selectable, selectHelper, unselectAuto, unselectCancel
	- callbacks: select, unselect
	- methods: select, unselect
- when dragging an event, the highlighting reflects the duration of the event
- code compressing by Google Closure Compiler
- bundled with jQuery 1.4.2 and jQuery UI 1.8.1


v1.4.5 (2010-02-21)
-------------------

- lazyFetching option, which can force the calendar to fetch events on every view/date change
- scroll state of agenda views are preserved when switching back to view
- bugfixes
	- calling methods on an uninitialized fullcalendar throws error
	- IE6/7 bug where an entire view becomes invisible ([320])
	- error when rendering a hidden calendar (in jquery ui tabs for example) in IE ([340])
	- interconnected bugs related to calendar resizing and scrollbars
		- when switching views or clicking prev/next, calendar would "blink" ([333])
		- liquid-width calendar's events shifted (depending on initial height of browser) ([341])
		- more robust underlying algorithm for calendar resizing

[320]: https://code.google.com/p/fullcalendar/issues/detail?id=320
[340]: https://code.google.com/p/fullcalendar/issues/detail?id=340
[333]: https://code.google.com/p/fullcalendar/issues/detail?id=333
[341]: https://code.google.com/p/fullcalendar/issues/detail?id=341


v1.4.4 (2010-02-03)
-------------------

- optimized event rendering in all views (events render in 1/10 the time)
- gotoDate() does not force the calendar to unnecessarily rerender
- render() method now correctly readjusts height


v1.4.3 (2009-12-22)
-------------------

- added destroy method
- Google Calendar event pages respect currentTimezone
- caching now handled by jQuery's ajax	
- protection from setting aspectRatio to zero
- bugfixes
	- parseISO8601 and DST caused certain events to display day before
	- button positioning problem in IE6
	- ajax event source removed after recently being added, events still displayed
	- event not displayed when end is an empty string
	- dynamically setting calendar height when no events have been fetched, throws error


v1.4.2 (2009-12-02)
-------------------

- eventAfterRender trigger
- getDate & getView methods
- height & contentHeight options (explicitly sets the pixel height)
- minTime & maxTime options (restricts shown hours in agenda view)
- getters [for all options] and setters [for height, contentHeight, and aspectRatio ONLY! stay tuned..]
- render method now readjusts calendar's size
- bugfixes
	- lightbox scripts that use iframes (like fancybox)
	- day-of-week classNames were off when firstDay=1
	- guaranteed space on right side of agenda events (even when stacked)
	- accepts ISO8601 dates with a space (instead of 'T')


v1.4.1 (2009-10-31)
-------------------

- can exclude weekends with new 'weekends' option
- gcal feed 'currentTimezone' option
- bugfixes
	- year/month/date option sometimes wouldn't set correctly (depending on current date)
	- daylight savings issue caused agenda views to start at 1am (for BST users)
- cleanup of gcal.js code


v1.4 (2009-10-19)
-----------------

- agendaWeek and agendaDay views
- added some options for agenda views:
	- allDaySlot
	- allDayText
	- firstHour
	- slotMinutes
	- defaultEventMinutes
	- axisFormat
- modified some existing options/triggers to work with agenda views:
	- dragOpacity and timeFormat can now accept a "View Hash" (a new concept)
	- dayClick now has an allDay parameter
	- eventDrop now has an an allDay parameter
	  (this will affect those who use revertFunc, adjust parameter list)
- added 'prevYear' and 'nextYear' for buttons in header
- minor change for theme users, ui-state-hover not applied to active/inactive buttons
- added event-color-changing example in docs
- better defaults for right-to-left themed button icons


v1.3.2 (2009-10-13)
-------------------

- Bugfixes (please upgrade from 1.3.1!)
	- squashed potential infinite loop when addMonths and addDays
	  is called with an invalid date
	- $.fullCalendar.parseDate() now correctly parses IETF format
	- when switching views, the 'today' button sticks inactive, fixed
- gotoDate now can accept a single Date argument
- documentation for changes in 1.3.1 and 1.3.2 now on website


v1.3.1 (2009-09-30)
-------------------

- Important Bugfixes (please upgrade from 1.3!)
	- When current date was late in the month, for long months, and prev/next buttons
	  were clicked in month-view, some months would be skipped/repeated
	- In certain time zones, daylight savings time would cause certain days
	  to be misnumbered in month-view
- Subtle change in way week interval is chosen when switching from month to basicWeek/basicDay view
- Added 'allDayDefault' option
- Added 'changeView' and 'render' methods


v1.3 (2009-09-21)
-----------------

- different 'views': month/basicWeek/basicDay
- more flexible 'header' system for buttons
- themable by jQuery UI themes
- resizable events (require jQuery UI resizable plugin)
- rescoped & rewritten CSS, enhanced default look
- cleaner css & rendering techniques for right-to-left
- reworked options & API to support multiple views / be consistent with jQuery UI
- refactoring of entire codebase
	- broken into different JS & CSS files, assembled w/ build scripts
	- new test suite for new features, uses firebug-lite
- refactored docs
- Options
	- + date
	- + defaultView
	- + aspectRatio
	- + disableResizing
	- + monthNames      (use instead of $.fullCalendar.monthNames)
	- + monthNamesShort (use instead of $.fullCalendar.monthAbbrevs)
	- + dayNames        (use instead of $.fullCalendar.dayNames)
	- + dayNamesShort   (use instead of $.fullCalendar.dayAbbrevs)
	- + theme
	- + buttonText
	- + buttonIcons
	- x draggable           -> editable/disableDragging
	- x fixedWeeks          -> weekMode
	- x abbrevDayHeadings   -> columnFormat
	- x buttons/title       -> header
	- x eventDragOpacity    -> dragOpacity
	- x eventRevertDuration -> dragRevertDuration
	- x weekStart           -> firstDay
	- x rightToLeft         -> isRTL
	- x showTime (use 'allDay' CalEvent property instead)
- Triggered Actions
	- + eventResizeStart
	- + eventResizeStop
	- + eventResize
	- x monthDisplay -> viewDisplay
	- x resize       -> windowResize
	- 'eventDrop' params changed, can revert if ajax cuts out
- CalEvent Properties
	- x showTime  -> allDay
	- x draggable -> editable
	- 'end' is now INCLUSIVE when allDay=true
	- 'url' now produces a real <a> tag, more native clicking/tab behavior
- Methods:
	- + renderEvent
	- x prevMonth         -> prev
	- x nextMonth         -> next
	- x prevYear/nextYear -> moveDate
	- x refresh           -> rerenderEvents/refetchEvents
	- x removeEvent       -> removeEvents
	- x getEventsByID     -> clientEvents
- Utilities:
	- 'formatDate' format string completely changed (inspired by jQuery UI datepicker + datejs)
	- 'formatDates' added to support date-ranges
- Google Calendar Options:
	- x draggable -> editable
- Bugfixes
	- gcal extension fetched 25 results max, now fetches all


v1.2.1 (2009-06-29)
-------------------

- bugfixes
	- allows and corrects invalid end dates for events
	- doesn't throw an error in IE while rendering when display:none
	- fixed 'loading' callback when used w/ multiple addEventSource calls
	- gcal className can now be an array


v1.2 (2009-05-31)
-----------------

- expanded API
	- 'className' CalEvent attribute
	- 'source' CalEvent attribute
	- dynamically get/add/remove/update events of current month
	- locale improvements: change month/day name text
	- better date formatting ($.fullCalendar.formatDate)
	- multiple 'event sources' allowed
		- dynamically add/remove event sources
- options for prevYear and nextYear buttons
- docs have been reworked (include addition of Google Calendar docs)
- changed behavior of parseDate for number strings
  (now interpets as unix timestamp, not MS times)
- bugfixes
	- rightToLeft month start bug
	- off-by-one errors with month formatting commands
	- events from previous months sticking when clicking prev/next quickly
- Google Calendar API changed to work w/ multiple event sources
	- can also provide 'className' and 'draggable' options
- date utilties moved from $ to $.fullCalendar
- more documentation in source code
- minified version of fullcalendar.js
- test suit (available from svn)
- top buttons now use `<button>` w/ an inner `<span>` for better css cusomization
	- thus CSS has changed. IF UPGRADING FROM PREVIOUS VERSIONS,
	  UPGRADE YOUR FULLCALENDAR.CSS FILE


v1.1 (2009-05-10)
-----------------

- Added the following options:
	- weekStart
	- rightToLeft
	- titleFormat
	- timeFormat
	- cacheParam
	- resize
- Fixed rendering bugs
	- Opera 9.25 (events placement & window resizing)
	- IE6 (window resizing)
- Optimized window resizing for ALL browsers
- Events on same day now sorted by start time (but first by timespan)
- Correct z-index when dragging
- Dragging contained in overflow DIV for IE6
- Modified fullcalendar.css
	- for right-to-left support
	- for variable start-of-week
	- for IE6 resizing bug
	- for THEAD and TBODY (in 1.0, just used TBODY, restructured in 1.1)
	- IF UPGRADING FROM FULLCALENDAR 1.0, YOU MUST UPGRADE FULLCALENDAR.CSS
