/**
 * Slat height assumed on the first render, before the real one is measured.
 *
 * Without it, `computeFgSegVerticals` has no canvas to project onto and returns
 * nothing, so the view paints a frame containing no events at all and the
 * calendar looks empty until measurement lands. Projecting against an assumed
 * height instead means events are present in that very first paint.
 *
 * A flat constant is enough, and deliberately so. Placement compares segs
 * against each other and never against the axis length, so scaling every
 * coordinate by the same factor leaves collisions and level assignment
 * untouched. Guessing wrong rescales the raw geometry; it does not reorganize
 * it. That is why the caller withholds `eventMinHeight` while assuming — a
 * pixel floor applied at the wrong scale would stretch the wrong segs, and
 * stretching is what creates collisions.
 *
 * This is a claim about the raw coordinates only. The measured pass turns
 * `eventMinHeight` back on, and stretching a sub-minimum seg there can make it
 * collide with a neighbor it previously cleared, changing levels and
 * `eventMaxStack` admission. Expect the assumed pass to agree in the common
 * case; do not treat it as final.
 *
 * TimeGrid's caveat list stops there, unlike Timeline's: it places with unit
 * thickness and measures no event wrappers, so nothing about the rendered size
 * can feed back into placement. `isShort` also differs across passes, but that
 * is a styling decision rather than geometry.
 */
export const ESTIMATED_SLAT_HEIGHT = 50
