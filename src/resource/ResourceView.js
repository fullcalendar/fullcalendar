
function ResourceView(calendar) {
  AgendaView.call(this, calendar); // call the super-constructor

  this.cellToDate = function () {
    return this.start;
  }
}


ResourceView.prototype = createObject(AgendaView.prototype); // extends AgendaView
$.extend(ResourceView.prototype, {

  resources: function() {
    return this.calendar.fetchResources();
  },

  // Used by the `headHtml` method, via RowRenderer, for rendering the HTML of a day-of-week header cell
  headCellHtml: function(row, col, date) {
    var colFormat = this.opt('columnFormat');
    var resource = this.resources()[col];
    var classes = [
      'fc-day-header',
      this.widgetHeaderClass,
      'fc-' + dayIDs[date.day()]
    ];

    if(resource)
      classes.push(resource.className);

    return '' +
      '<th class="'+ classes.join(' ') +'">' +
        htmlEscape(resource.name) +
      '</th>';
  },

  render: function(colCnt) {
    AgendaView.prototype.render.call(this, colCnt); // call the super-method
    this.el.removeClass('fc-agenda-view').addClass('fc-resource-view');
  }

});
