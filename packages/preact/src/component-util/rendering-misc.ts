
export function isDimsEqual(v0: number | undefined, v1: number): boolean {
  return v0 != null && (v0 === v1 || Math.abs(v0 - v1) < 0.01)
}
