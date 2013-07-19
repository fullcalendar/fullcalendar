// French (fr) Internationalization

(function ( $ ) {

    var i18n = {
	
		allDayText: 'Toute la journée',

		axisFormat: "HH'h'(:mm)",
		timeFormat: {
			'': "HH'h'(:mm)",
			agenda: 'HH:mm{ - HH:mm}'
		},

		titleFormat: {
			month: 'MMMM yyyy',
			week: "d MMM [ yyyy]{ '&#8212;'d [ MMM] yyyy}",
			day: 'dddd, d MMM yyyy'
		},
		columnFormat: {
			month: 'ddd',
			week: 'ddd d MMM',
			day: 'dddd d MMM'
		},

		firstDay: 1,
		monthNames: ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'],
		monthNamesShort: ['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'],
		dayNames: ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'],
		dayNamesShort: ['dim.','lun.','mar.','mer.','jeu.','ven.','sam.'],
		buttonText: {
			prev: '&nbsp;&#9668;&nbsp;',
			next: '&nbsp;&#9658;&nbsp;',
			prevYear: '&nbsp;&lt;&lt;&nbsp;',
			nextYear: '&nbsp;&gt;&gt;&nbsp;',
			today: 'Aujourd\'hui',
			month: 'mois',
			week: 'semaine',
			workweek: 'semaine ouverte',
			day: 'jour'
		}
    };

	$.fullCalendar.setDefaults(i18n);

})( jQuery );
