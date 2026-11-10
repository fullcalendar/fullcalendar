/*
A date (or date-time), optionally in a resource's column/lane. Models accept either form.
*/
export type Spot = string | { date: string, resourceId?: string }

export function parseSpot(spot: Spot): { date: string, resourceId?: string } {
  return typeof spot === 'string' ? { date: spot } : spot
}

export function describeSpot(spot: Spot): string {
  const { date, resourceId } = parseSpot(spot)
  return resourceId ? `${date} (resource ${resourceId})` : date
}

/*
Filters elements to those of the resource, if given.
*/
export function matchesResource(el: Element, resourceId: string | undefined): boolean {
  return resourceId == null || el.getAttribute('data-resource-id') === resourceId
}
