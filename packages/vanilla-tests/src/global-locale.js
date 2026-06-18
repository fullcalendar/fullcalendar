
describe('FullCalendar single locale', () => {
  it('loads correctly', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    const calendar = new FullCalendar.Calendar(el)
    const availableLocales = calendar.getAvailableLocaleCodes()

    expect(availableLocales.indexOf('ar') !== -1).toBe(true)

    calendar.destroy()
    document.body.removeChild(el)
  })
})
