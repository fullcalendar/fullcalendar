
describe('render method', function() {

  it('updates size of a previously hidden element', function() {
    var $el = $('<div style="display:none" />').appendTo('body')

    initCalendar({
      defaultView: 'month',
      contentHeight: 600
    }, $el)

    $el.show()
    currentCalendar.render()
    expect($('.fc-view-container').outerHeight()).toBeCloseTo(600, 0)

    $el.remove()
  })

})
