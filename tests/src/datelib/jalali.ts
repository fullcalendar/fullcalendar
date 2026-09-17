import { findDayOne } from '@fullcalendar/core/internal'

describe('findDayOne', () => {
  it('finds day 1 from the middle of a normal month', () => {
    let result = findDayOne(new Date(2024, 3, 5)) // 1403/1/17
    expect(result).toEqual(new Date(2024, 2, 20)) // 1403/1/1
  })

  it('returns the same day when already on day 1', () => {
    let result = findDayOne(new Date(2024, 2, 20)) // 1403/1/1
    expect(result).toEqual(new Date(2024, 2, 20))
  })

  it('finds day 1 from the end of a 31-day month', () => {
    let result = findDayOne(new Date(2024, 3, 19)) // 1403/1/31
    expect(result).toEqual(new Date(2024, 2, 20)) // 1403/1/1
  })

  it('finds day 1 from the end of a 30-day month', () => {
    let result = findDayOne(new Date(2024, 9, 21)) // 1403/7/30
    expect(result).toEqual(new Date(2024, 8, 22)) // 1403/7/1
  })

  it('finds day 1 from the end of a 29-day Esfand (normal year)', () => {
    let result = findDayOne(new Date(2024, 2, 19)) // 1402/12/29
    expect(result).toEqual(new Date(2024, 1, 20)) // 1402/12/1
  })

  it('finds day 1 from the end of a 30-day Esfand (leap year)', () => {
    let result = findDayOne(new Date(2025, 2, 20)) // 1403/12/30
    expect(result).toEqual(new Date(2025, 1, 19)) // 1403/12/1
  })

  it('handles the Esfand/Farvardin leap-year boundary correctly', () => {
    let lastDayOfYear = findDayOne(new Date(2025, 2, 20)) // still in 1403/12
    let firstDayOfNewYear = findDayOne(new Date(2025, 2, 21)) // 1404/1/1 (Nowruz)
    expect(lastDayOfYear).toEqual(new Date(2025, 1, 19))
    expect(firstDayOfNewYear).toEqual(new Date(2025, 2, 21))
  })

  it('does not mutate the input date', () => {
    let input = new Date(2024, 3, 5, 15, 30, 0)
    let originalTime = input.getTime()
    findDayOne(input)
    expect(input.getTime()).toBe(originalTime)
  })

  it('normalizes a non-midnight input to the start of the day', () => {
    let result = findDayOne(new Date(2024, 3, 5, 15, 30, 0))
    expect(result).toEqual(new Date(2024, 2, 20, 0, 0, 0, 0))
  })
})
