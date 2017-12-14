
export function getTimeAxisInfo() {
  return $('.fc-slats tr[data-time]').map(function(i, tr) {
    return {
      text: $(tr).find('.fc-time').text(),
      isMajor: !$(tr).hasClass('fc-minor')
    }
  }).get()
}


// for https://github.com/fullcalendar/fullcalendar-scheduler/issues/363
export function isStructureValid() {
  return $('.fc-time-grid .fc-content-skeleton').length === 1
}
