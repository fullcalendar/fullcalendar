(function($) {

	$.fn.gcalFullCalendar = function(options) {
		
		var feedURL;
		if (options && typeof options.events == 'string') {
			feedURL = options.events;
		}
		else return this;
		
		feedURL = feedURL.replace(/\/basic$/, '/full');
		
		$.extend(options, {
		
			events: function(start, end, callback) {
				$.getJSON(feedURL + "?alt=json-in-script&callback=?",
					{
						'start-min': $.ISO8601String(start),
						'start-max': $.ISO8601String(end),
						'singleevents': true
					},
					function(data) {
						var events = [];
						if (data.feed.entry)
							$.each(data.feed.entry, function(i, entry) {
								var url;
								$.each(entry['link'], function(j, link) {
									if (link.type == 'text/html') url = link.href;
								});
								events.push({
									id: entry['gCal$uid']['value'],
									url: url,
									title: entry['title']['$t'],
									start: $.parseISO8601(entry['gd$when'][0]['startTime'], true),
									end: $.parseISO8601(entry['gd$when'][0]['endTime'], true),
									location: entry['gd$where'][0]['valueString'],
									description: entry['content']['$t'],
									allDay: entry['gd$when'][0]['startTime'].indexOf('T') == -1,
									draggable: false
								});
							});
						callback(events);
					});
			},
			
			eventRender: function(event, element) {
				if (!event.allDay) element.addClass('nobg');
			}
			
		});
		
		return this.fullCalendar(options);
	};

})(jQuery);
