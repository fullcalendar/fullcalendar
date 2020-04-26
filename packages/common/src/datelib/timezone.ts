
export abstract class NamedTimeZoneImpl {

  timeZoneName: string

  constructor(timeZoneName: string) {
    this.timeZoneName = timeZoneName
  }

  abstract offsetForArray(a: number[]): number
  abstract timestampToArray(ms: number): number[]
}

export type NamedTimeZoneImplClass = { new(timeZoneName: string): NamedTimeZoneImpl }
