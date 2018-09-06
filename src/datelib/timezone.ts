
export abstract class NamedTimeZoneImpl {

  name: string

  constructor(name: string) {
    this.name = name
  }

  abstract offsetForArray(a: number[]): number
  abstract timestampToArray(ms: number): number[]
}


let namedTimeZonedImpls = {}

export function registerNamedTimeZoneImpl(implName, theClass) {
  namedTimeZonedImpls[implName] = theClass
}

export function createNamedTimeZoneImpl(implName, tzName) {
  let theClass = namedTimeZonedImpls[implName]

  if (theClass) {
    return new theClass(tzName)
  }

  return null
}
