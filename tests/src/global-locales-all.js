
describe('FullCalendar locales-all', () => {
  it('loads correctly', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    const calendar = new FullCalendar.Calendar(el)
    const availableLocales = calendar.getAvailableLocaleCodes()

    expect(availableLocales.indexOf('es') !== -1).toBe(true)
    expect(availableLocales.indexOf('fr') !== -1).toBe(true)

    calendar.destroy()
    document.body.removeChild(el)
  })
})
