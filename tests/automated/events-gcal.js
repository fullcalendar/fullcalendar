
describe('Google Calendar plugin', function() {

	var options;
	var currentRequest;

	beforeEach(function() {
		affix('#cal');

		options = {
			defaultView: 'month',
			defaultDate: '2014-05-01',
			events: 'http://www.google.com/calendar/feeds/notarealfeed/public/basic'
		};

		// workaround. wanted to use mockedAjaxCalls(), but JSONP requests get mangled later on
		currentRequest = null;
		$.mockjaxSettings.log = function(mockHandler, request) {
			currentRequest = currentRequest || $.extend({}, request); // copy
		};

		// fake the JSONP call (which actually calls to /full)
		$.mockjax({
			url: 'http://www.google.com/calendar/feeds/notarealfeed/public/*',
			responseText: JSON.parse(
				'{"version":"1.0","encoding":"UTF-8","feed":{"xmlns":"http://www.w3.org/2005/Atom","xmlns$openSearch"' +
				':"http://a9.com/-/spec/opensearchrss/1.0/","xmlns$gCal":"http://schemas.google.com/gCal/2005","xmlns' +
				'$gd":"http://schemas.google.com/g/2005","id":{"$t":"http://www.google.com/calendar/feeds/usa__en%40h' +
				'oliday.calendar.google.com/public/full"},"updated":{"$t":"2014-05-22T13:00:40.000Z"},"category":[{"s' +
				'cheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.com/g/2005#event"}],"ti' +
				'tle":{"$t":"Holidays in United States","type":"text"},"subtitle":{"$t":"Holidays and Observances in ' +
				'United States","type":"text"},"link":[{"rel":"alternate","type":"text/html","href":"http://www.googl' +
				'e.com/calendar/embed?src=usa__en%40holiday.calendar.google.com"},{"rel":"http://schemas.google.com/g' +
				'/2005#feed","type":"application/atom+xml","href":"http://www.google.com/calendar/feeds/usa__en%40hol' +
				'iday.calendar.google.com/public/full"},{"rel":"http://schemas.google.com/g/2005#batch","type":"appli' +
				'cation/atom+xml","href":"http://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/' +
				'public/full/batch"},{"rel":"self","type":"application/atom+xml","href":"http://www.google.com/calend' +
				'ar/feeds/usa__en%40holiday.calendar.google.com/public/full?alt=json-in-script&max-results=9999&start' +
				'-min=2014-04-27T00%3A00%3A00Z&singleevents=true&start-max=2014-06-08T00%3A00%3A00Z"}],"author":[{"na' +
				'me":{"$t":"Holidays in United States"}}],"generator":{"$t":"Google Calendar","version":"1.0","uri":"' +
				'http://www.google.com/calendar"},"openSearch$totalResults":{"$t":2},"openSearch$startIndex":{"$t":1}' +
				',"openSearch$itemsPerPage":{"$t":9999},"gCal$timezone":{"value":"UTC"},"gCal$timesCleaned":{"value":' +
				'0},"entry":[{"id":{"$t":"http://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/' +
				'public/full/20140511_60o30dr560o30e1g60o30dr4ck"},"published":{"$t":"2014-05-22T13:00:40.000Z"},"upd' +
				'ated":{"$t":"2014-05-22T13:00:40.000Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind' +
				'","term":"http://schemas.google.com/g/2005#event"}],"title":{"$t":"Mothers Day","type":"text"},"cont' +
				'ent":{"$t":"","type":"text"},"link":[{"rel":"alternate","type":"text/html","href":"http://www.google' +
				'.com/calendar/event?eid=MjAxNDA1MTFfNjBvMzBkcjU2MG8zMGUxZzYwbzMwZHI0Y2sgdXNhX19lbkBo","title":"alter' +
				'nate"},{"rel":"self","type":"application/atom+xml","href":"http://www.google.com/calendar/feeds/usa_' +
				'_en%40holiday.calendar.google.com/public/full/20140511_60o30dr560o30e1g60o30dr4ck"}],"author":[{"nam' +
				'e":{"$t":"Holidays in United States"}}],"gd$comments":{"gd$feedLink":{"href":"http://www.google.com/' +
				'calendar/feeds/usa__en%40holiday.calendar.google.com/public/full/20140511_60o30dr560o30e1g60o30dr4ck' +
				'/comments"}},"gd$eventStatus":{"value":"http://schemas.google.com/g/2005#event.confirmed"},"gd$where' +
				'":[{}],"gd$who":[{"email":"usa__en@holiday.calendar.google.com","rel":"http://schemas.google.com/g/2' +
				'005#event.organizer","valueString":"Holidays in United States"}],"gd$when":[{"endTime":"2014-05-12",' +
				'"startTime":"2014-05-11"}],"gd$transparency":{"value":"http://schemas.google.com/g/2005#event.transp' +
				'arent"},"gCal$anyoneCanAddSelf":{"value":"false"},"gCal$guestsCanInviteOthers":{"value":"true"},"gCa' +
				'l$guestsCanModify":{"value":"false"},"gCal$guestsCanSeeGuests":{"value":"true"},"gCal$sequence":{"va' +
				'lue":0},"gCal$uid":{"value":"20140511_60o30dr560o30e1g60o30dr4ck@google.com"}},{"id":{"$t":"http://w' +
				'ww.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/full/20140526_60o30dr56co3' +
				'0e1g60o30dr4ck"},"published":{"$t":"2014-05-22T13:00:40.000Z"},"updated":{"$t":"2014-05-22T13:00:40.' +
				'000Z"},"category":[{"scheme":"http://schemas.google.com/g/2005#kind","term":"http://schemas.google.c' +
				'om/g/2005#event"}],"title":{"$t":"Memorial Day","type":"text"},"content":{"$t":"","type":"text"},"li' +
				'nk":[{"rel":"alternate","type":"text/html","href":"http://www.google.com/calendar/event?eid=MjAxNDA1' +
				'MjZfNjBvMzBkcjU2Y28zMGUxZzYwbzMwZHI0Y2sgdXNhX19lbkBo","title":"alternate"},{"rel":"self","type":"app' +
				'lication/atom+xml","href":"http://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.co' +
				'm/public/full/20140526_60o30dr56co30e1g60o30dr4ck"}],"author":[{"name":{"$t":"Holidays in United Sta' +
				'tes"}}],"gd$comments":{"gd$feedLink":{"href":"http://www.google.com/calendar/feeds/usa__en%40holiday' +
				'.calendar.google.com/public/full/20140526_60o30dr56co30e1g60o30dr4ck/comments"}},"gd$eventStatus":{"' +
				'value":"http://schemas.google.com/g/2005#event.confirmed"},"gd$where":[{}],"gd$who":[{"email":"usa__' +
				'en@holiday.calendar.google.com","rel":"http://schemas.google.com/g/2005#event.organizer","valueStrin' +
				'g":"Holidays in United States"}],"gd$when":[{"endTime":"2014-05-27","startTime":"2014-05-26"}],"gd$t' +
				'ransparency":{"value":"http://schemas.google.com/g/2005#event.transparent"},"gCal$anyoneCanAddSelf":' +
				'{"value":"false"},"gCal$guestsCanInviteOthers":{"value":"true"},"gCal$guestsCanModify":{"value":"fal' +
				'se"},"gCal$guestsCanSeeGuests":{"value":"true"},"gCal$sequence":{"value":0},"gCal$uid":{"value":"201' +
				'40526_60o30dr56co30e1g60o30dr4ck@google.com"}}]}}'
			)
		});
	});

	afterEach(function() {
		$.mockjaxClear();
		$.mockjaxSettings.log = function() { };
	});

	it('sends request correctly when no timezone', function() {
		$('#cal').fullCalendar(options);
		expect(currentRequest.data['start-min']).toEqual('2014-04-27');
		expect(currentRequest.data['start-max']).toEqual('2014-06-08');
		expect(currentRequest.data.ctz).toBeUndefined();
	});

	it('sends request correctly when local timezone', function() {
		options.timezone = 'local';
		$('#cal').fullCalendar(options);
		expect(currentRequest.data['start-min']).toEqual('2014-04-27');
		expect(currentRequest.data['start-max']).toEqual('2014-06-08');
		expect(currentRequest.data.ctz).toBeUndefined();
	});

	it('sends request correctly when UTC timezone', function() {
		options.timezone = 'UTC';
		$('#cal').fullCalendar(options);
		expect(currentRequest.data['start-min']).toEqual('2014-04-27');
		expect(currentRequest.data['start-max']).toEqual('2014-06-08');
		expect(currentRequest.data.ctz).toEqual('UTC');
	});

	it('sends request correctly when custom timezone', function() {
		options.timezone = 'America/Chicago';
		$('#cal').fullCalendar(options);
		expect(currentRequest.data['start-min']).toEqual('2014-04-27');
		expect(currentRequest.data['start-max']).toEqual('2014-06-08');
		expect(currentRequest.data.ctz).toEqual('America/Chicago');
	});

});