// new view and its button
fcViews.agendaList = agendaListView;
defaults.buttonText.agendaList = 'list';
defaults.titleFormat.agendaList = 'MMMM yyyy';


defaults.agendaDisType = true;

function agendaListView(element, calendar) {
	var t = this;


	// exports
	t.render = render;

	// imports
	ListView.call(t, element, calendar);
	var opt = t.opt;
	var renderAgendaList = t.renderAgendaList;
	var formatDate = calendar.formatDate;


	function render(date, delta) {
		if (delta) {
			addMonths(date, delta);
			date.setDate(1);
		}
		var start, end, visStart, visEnd;
		start = cloneDate(date, true);
		start.setDate(1);
		end = addMonths(cloneDate(start), 1);
		visStart = cloneDate(start);
		visEnd = cloneDate(end);
		// I will keep all params and discuss with the group about the header 
		// as well as if we should use June 1st or start of the calendar view date
		t.title = formatDate(start, opt('titleFormat'));
		t.start = start;
		t.end = end;
		t.visStart = visStart;
		t.visEnd = visEnd;
		renderAgendaList(false);
	}
}

function ListView(element, calendar) {
	var t = this;


	// exports
	t.renderAgendaList = renderAgendaList;
	t.setHeight = setHeight;
	t.setWidth = setWidth;
	t.renderEvents = renderEvents;
	t.clearEvents = clearEvents;

	t.cellIsAllDay = function () {
		return true
	};

	t.getColWidth = function () {
		return colWidth
	};
	t.getDaySegmentContainer = function () {
		return daySegmentContainer
	};


	// imports
	View.call(t, element, calendar, 'agendaList');
	OverlayManager.call(t);
	SelectionManager.call(t);

	var opt = t.opt;
	var trigger = t.trigger;
	var formatDate = calendar.formatDate;

	// locals
	var updateEvents = t.calendar.updateEvents;
	var body;
	var daySegmentContainer;

	var viewWidth;
	var viewHeight;
	var colWidth;

	var firstDay;
	var eventElementHandlers = t.eventElementHandlers;



	function renderAgendaList() {
		if (!body) {
			buildTable();
		} else {
			clearEvents();
		}
	}


	function buildTable() {
		body = true;
	}


	function setHeight(height) {
		viewHeight = height;
		var bodyHeight = viewHeight;
	}

	function setWidth(width) {
		viewWidth = width;
	}

	//var reportEventClear = t.reportEventClear;
	var getDaySegmentContainer = t.getDaySegmentContainer;


	function renderEvents(events, modifiedEventId) {
		var emptyMonth = true;
		// html
		var html;
		//Start by sorting the events for the month to be displayed
		events.sort(function(a,b) {
					   var  dateA = new Date(a.start); 
					   var dateB = new Date(b.start);
					   return dateA-dateB;
					   });
		
		
		html    = $("<ul class='fc-agendaList'></ul>");
		var mm, dd, tt, dt, lurl, ltitle, em;
		var temp, i = 0;
		var vm = formatDate(t.visStart, 'MM');

		for (i in events) {
			z = i;
			em = formatDate(events[i].start, 'MM');
			// retrieve only current view month events
			if ( em == vm ) {
				emptyMonth = false;
				dd    = formatDate(events[i].start, 'dddd');
				lday   = formatDate(events[i].start, 'MMMM d, yyyy');
				ldescription  = events[i].description || '';
				ltitle  = events[i].title;
				allDay  = events[i].allDay;
				st   = formatDate(events[i].start, 'h(:mm)tt');
				et   = formatDate(events[i].end, 'h(:mm)tt');
				lurl = events[i].url;
				classes = events[i].className;              

				if (lday != temp) {
					$("<li class='fc-agendaList-day-header ui-widget-header'>" +
						"<span class='fc-agendaList-day'>"+dd+"</span>" +
						"<span class='fc-agendaList-date'>"+lday+"</span>" +
					"</li>").appendTo(html);                           
					temp = lday;
				}  
				if (allDay) {
					eventdisplay = $("<li class='fc-agendaList-item'>"+
						"<"+ (lurl ? "a href='"+ lurl +"'" : "div") + " class='fc-agendaList-event fc-event fc-event-all-day "+classes+"'>"+
							"<div class='fc-event-time'>"+
								"All Day"+
							"</div>"+
							"<div class='fc-agendaList-event-details'>"+
								"<div class='fc-event-title'>"+ltitle+"</div>"+
								"<div class='fc-event-description'>"+ldescription+"</div>"+
							"</div>"+
						"</" + (lurl ? "a" : "div") + ">"+ 
					"</li>").appendTo(html);                                      
				} else {
					eventdisplay = $("<li class='fc-agendaList-item'>"+
						"<"+ (lurl ? "a href='"+ lurl +"'" : "div") + " class='fc-agendaList-event fc-event "+classes+"'>"+
							"<div class='fc-event-time'>"+
								"<span class='fc-event-time-start'>"+st+"</span>"+
								(et ? "<span class='fc-event-time-end'>"+et+"</span>" : "")+
							"</div>"+
							"<div class='fc-agendaList-event-details'>"+
								"<div class='fc-event-title'>"+ltitle+"</div>"+
								(ldescription ? "<div class='fc-event-description'>"+ldescription+"</div>" : "")+
							"</div>"+
						"</" + (lurl ? "a" : "div") + ">"+                                        
					"</li>").appendTo(html);   
				}
				eventElementHandlers(events[i], eventdisplay);
			}
		}

		if (emptyMonth == true) {
			html = $("<div class='fc-agendaList-no-events'>No Events Found</div>");
		}

		$(element).html(html);
		trigger('eventAfterAllRender');
	}

	function dayHeaderExists(arr, header) {
		for (var i = 0; i < arr.length; i++) {
			if (arr[i] == header) return true;
		}
		return false;
	}

	function clearEvents() {
		//reportEventClear();
	}
}

;