
module.exports = {

	jquery: {
		js: 'lib/jquery-1.9.1.min.js'
	},

	'jquery-ui': {
		js: 'lib/jquery-ui-1.10.1.custom.min.js'
	},

	fullcalendar: {

		fullcalendar: {
			js: [
				'src/intro.js',
				'src/defaults.js',
				'src/main.js',
				'src/Calendar.js',
				'src/Header.js',
				'src/EventManager.js',
				'src/date_util.js',
				'src/util.js',
				'src/basic/MonthView.js',
				'src/basic/BasicWeekView.js',
				'src/basic/BasicDayView.js',
				'src/basic/BasicView.js',
				'src/basic/BasicEventRenderer.js',
				'src/agenda/AgendaWeekView.js',
				'src/agenda/AgendaDayView.js',
				'src/agenda/AgendaView.js',
				'src/agenda/AgendaEventRenderer.js',
				'src/common/View.js',
				'src/common/DayEventRenderer.js',
				'src/common/SelectionManager.js',
				'src/common/OverlayManager.js',
				'src/common/CoordinateGrid.js',
				'src/common/HoverListener.js',
				'src/common/HorizontalPositionCache.js',
				'src/outro.js'
			],
			css: [
				'src/main.css',
				'src/common/common.css',
				'src/basic/basic.css',
				'src/agenda/agenda.css'
			],
			printCss: 'src/common/print.css'
		},

		gcal: {
			js: 'src/gcal/gcal.js'
		}

	}

};
