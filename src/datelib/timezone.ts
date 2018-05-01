


export type namedTimeZoneOffsetGenerator = (timeZoneName: string, array: number[]) => number

let namedTimeZoneOffsetGeneratorMap = {}


export function registerNamedTimeZoneOffsetGenerator(name, timeZoneOffsetGenerator: namedTimeZoneOffsetGenerator) {
  namedTimeZoneOffsetGeneratorMap[name] = timeZoneOffsetGenerator
}


export function getNamedTimeZoneOffsetGenerator(name) {
  return namedTimeZoneOffsetGeneratorMap[name]
}
