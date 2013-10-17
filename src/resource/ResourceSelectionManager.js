function ResourceSelectionManager(t) {
    var t = this;
    var trigger = t.trigger;
    var getResource = t.getResource;
    var sm = SelectionManager.call(t);
    t.sm_reportSelection = t.reportSelection;
    t.reportSelection = resourceReportSelection;
    t.sm_reportDayClick = t.reportDayClick;
    t.reportDayClick = resourceReportDayClick;

    function resourceReportSelection(startDate, endDate, allDay, ev) {
        var col = Math.round((startDate - t.start) / 1000 / 60 / 60 / 24);
        ev.resource_id = getResource(col).id;
        t.sm_reportSelection(startDate, endDate, allDay, ev);
    }

    function resourceReportDayClick(date, allDay, ev) {
        var col = Math.round((date - t.start) / 1000 / 60 / 60 / 24);
        ev.resource_id = getResource(col).id;
        t.sm_reportDayClick(date, allDay, ev);
    }
}
