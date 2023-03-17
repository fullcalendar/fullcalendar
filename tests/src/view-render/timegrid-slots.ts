describe('timegrid slots', () => {
  // https://github.com/fullcalendar/fullcalendar/issues/5952
  it('can render a single big slot without error', () => {
    initCalendar({
      initialView: 'timeGridDay',
      slotDuration: '24:00',
    })
  })
})
