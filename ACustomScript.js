

// CHECK THE FIDDLE BELOW   // HOW CAN WE RENDER EVENTS AS PROGRESS BAR  OR  SHOW PROGRESS OF EVENTS

//     http://jsfiddle.net/Manoj_89/tda7obtb/2/


(function ($) {
    $(document).ready(function () {

        // page is now ready, initialize the calendar...
        var sourceFullView = { url: '/Events/GetCalDispEvents/' };
        var sourceSummaryView = { url: '/Home/GetDiarySummary/' };
        var CalLoading = true;

        $("#divHtml").dialog({
            autoOpen: false,
            maxWidth: 850,
            maxHeight: 650,
            width: 850,
            height: 650,
            buttons: {
                Ok: function () {
                    $(this).dialog("close");
                }
            },
            show: {
                effect: "blind",
                duration: 1000
            },
            hide: {
                effect: "explode",
                duration: 1000
            }
        });
              
        $('.progressbar').each(function () {
            var $el = $(this);
            $el.progressbar({
                value: $el.data("progress-value")
            });
        });
     $('#calendr').fullCalendar({
            customButtons: {
                addAnEvent: {
                    text: 'Add Order',
                    click: function () {
                        //Not working
                        $("#divHtml").dialog("open");
                        // $("#opener").on("click", function () {
                        //      $("#dialog").dialog("open");
                        // });
                    }
                }
            },
            currentTimeMarker: {
                updateInterval: 100,
            },
            minTime: '09:00:00',
            maxTime: '18:00:00',           
            selectable: true,
            dayRender: function (date, cell) {
                /// Check for holidays and weekends
                // if (date == ) {
                //      $(cell).addClass('disabled');
                //  }
            },
            overlap: false,
            header: {
                left: 'prev,next today,addAnEvent',
                center: 'title',
                right: 'month,agendaWeek,agendaDay,listMonth,listWeek'
            },
            defaultView: 'month',
            editable: true,    /// Set to false if events are not dragable
            eventConstraint: {
                dow: [1, 2, 3, 4, 5, 6],
                start: moment().format('YYYY-MM-DD 09:00:00'),
                end: '18:00' // Event ends at 6pm everyday
            },
            businessHours: {
                // days of week. an array of0 zero-based day of week integers (0=Sunday)
                dow: [1, 2, 3, 4, 5, 6], // Monday - Saturday
                start: moment().format('HH:mm'), /* Current Hour/Minute 24H format */
                end: '18:00', // an end time (6pm in this example)
            },
            eventRender: function (event, element) {
              //eventElement.addClass('progressbar');
                element.attr('title', event.tooltip);
               /* if (event.title == "Booked") {                    
                    console.log(event.backgroundColor)
                    
                    //document.getElementByClassName("a.fc-content").css('background-color', 'green');
                   // this.event.progressbar
                   // alert("Found you");
                }*/
                //element.attr("categories")
                var dataHoje = new Date();
                if(event.start < dataHoje && event.end > dataHoje) {
                    //event.color = "#FFB347"; //Em andamento
                    element.css('background-color', '#FFB347');
                    /*<div class="progressbar" data-progress-value="33"> */
                } else if (event.start < dataHoje && event.end < dataHoje) {
                    //event.color = "#77DD77"; //Concluído OK
                    element.css('background-color', '#77DD77');
                } else if (event.start > dataHoje && event.end > dataHoje) {
                    //event.color = "#AEC6CF"; //Não iniciado
                    element.css('background-color', '#AEC6CF');
                }
            },
          //  events: '/Events/GetCalDispEvents/',
        events:
               [{
                   title: 'Booked',
                   start: '2017-11-07T15:30:00',
                   allDay: false,
                   color: 'Blue',
                   className: 'progressbar',
                   value: '45',
               },{
                    title: 'Example Event Addition',
                    start: '2017-11-13T14:30:00',
                    allDay: false,
                    color: 'Red',
               }, {
                   title: 'Example Event 2',
                   start: '2017-11-06T09:30:00',
                   allDay: false,
                   color:'Green',
                   }
              ],

            /// Event click opens a page and display the results in calendar
            eventClick: function (calEvent, jsEvent, view) {
                var baseUrl = 'http://localhost:56177/Events';
               // window.location = '@Url.Action("Details", "Events", new { id = calEvent.id})';
               // window.location.href = '@Url.Action("Details", "Events")?id=' + calEvent.id + '&name=' + username;
                location.href = baseUrl +'/Details?id=' +calEvent.id;
             },

            /*eventClick: function (calEvent, jsEvent, view) {
                alert('You clicked on event id: ' + calEvent.id
                    + "\nSpecial ID: " + calEvent.allDay
                    + "\nAnd the title is: " + calEvent.start);
            },
            */

            eventMouseover: function (date, jsEvent, element, event)
            {
                // Change alert to SomeMouseOver, details of events
                //alert(date);
              
            },

            dayClick: function (date, allDay, jsEvent, view) {
                //alert('Clicked on: ' + date.format());
                //Will get the list of events for that day
                var view = $('#calendar').fullCalendar('getView');
                if (view.name == 'month' || view.name == 'agendaWeek') {
                    $('#calendar').fullCalendar('changeView', 'agendaDay');
                    $('#calendar').fullCalendar('gotoDate', date);
                }
                // $('#eventTitle').val("");
                // $('#eventDate').val($.fullCalendar.formatDate(date, 'dd/MM/yyyy'));
                // $('#eventTime').val($.fullCalendar.formatDate(date, 'HH:mm'));
                // ShowEventPopup(date);
            },

            viewRender: function (view, element) {
                if (!CalLoading) {
                    if (view.name == 'month') {
                        $('#calendar').fullCalendar('removeEventSource', sourceFullView);
                        $('#calendar').fullCalendar('removeEvents');
                        $('#calendar').fullCalendar('addEventSource', sourceSummaryView);
                    }
                    else {
                        $('#calendar').fullCalendar('removeEventSource', sourceSummaryView);
                        $('#calendar').fullCalendar('removeEvents');
                        $('#calendar').fullCalendar('addEventSource', sourceFullView);
                    }
                }
            }
            /// SET callLoading to FALSE here

            // put your options and callbacks here
        })

    });
    
    function ShowEventPopup(date) {
        ClearPopupFormValues();
        $('#popupEventForm').show();
        $('#eventTitle').focus();
    }

    function ClearPopupFormValues() {
        $('#eventID').val("");
        $('#eventTitle').val("");
        $('#eventDateTime').val("");
        $('#eventDuration').val("");
    }

    function UpdateEvent(EventID, EventStart, EventEnd) {

        var dataRow = {
            'ID': EventID,
            'NewEventStart': EventStart,
            'NewEventEnd': EventEnd
        }

        $.ajax({
            type: 'POST',
          //  url: "/Events/Create",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(dataRow)
        });
    }
    $('.fc-AddCustomButton-button').append('< i class="glyphicon glyphicon-plus" ></i>');
})(jQuery);
