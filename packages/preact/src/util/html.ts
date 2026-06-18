
type ClassValue = string | undefined | null | false | number /* number ~ 0 */

export function joinClassNames(...args: ClassValue[]): string {
  return args.filter(Boolean).join(' ')
}

/*
TODO: dedup with @full-ui/headless-grid somehow
*/
export function fracToCssDim(frac: number): string {
  return frac * 100 + '%'
}
