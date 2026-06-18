import { EventRangeProps } from './component-util/event-rendering'
import { computeEarliestStart, CoordRange, doCoordRangesIntersect, getCoordRangeEnd, intersectCoordRanges, joinCoordRanges, SlicedCoordRange } from './coord-range'
import { buildIsoString } from '@full-ui/headless-calendar'

/*
for INPUT
*/
export type EventSeg<R extends SlicedCoordRange> = R & EventRangeProps & {
  isSlice?: boolean // output will retain this
}

/*
for INTERNAL storage and OUTPUT
QUESTION: won't depth change based on reslicing Fragments, which might make contact?
*/
export type EventPlacement<R extends SlicedCoordRange> = EventSeg<R> & {
  thickness: number
  depth: number
  isSlice: boolean
  isZombie: boolean
}

/*
for POTENTIAL insertion
*/
export interface EventInsertion<R extends SlicedCoordRange> {
  // All segs witin a single "level" share the same levelCoord
  // As segs accumulate, new interstitial levels can be added
  // Thus, levelIndex might become stale
  levelIndex: number
  levelCoord: number

  // index WITHIN the level
  // -1 if requesting to create a new level at levelIndex with the new levelCoord
  lateralIndex: number

  // information about the EventCoordRange in the prior level this EventCoordRange is touching
  touchingPlacement: EventPlacement<R> | undefined

  // the max traversal depth through touching-seg chain in prior levels
  depth: number
}

export class SegHierarchy<R extends SlicedCoordRange> {
  placementsByLevel: EventPlacement<R>[][] = []
  levelCoords: number[] = [] // parallel with placementsByLevel
  hiddenSegs: EventSeg<R>[] = []

  constructor(
    segs: EventSeg<R>[],
    private getSegThickness = (seg: EventSeg<R>): number | undefined => {
      return 1
    },
    public strictOrder: boolean = false, // HACK
    private maxCoord: number | undefined,
    private maxDepth: number | undefined,
    private hiddenConsumes = false, // hidden segs also hide the touchingPlacement?
    private allowSlicing = false,
  ) {
    for (const seg of segs) {
      this.insertSeg(seg, this.getSegThickness(seg))
    }
  }

  private insertSeg(
    seg: EventSeg<R>,
    segThickness: number | undefined,
    isSlice?: boolean,
  ): void {
    if (segThickness != null) {
      const insertion = this.findInsertion(seg, segThickness)

      if (this.isInsertionValid(insertion, segThickness)) {
        this.insertSegAt(seg, insertion, segThickness, isSlice)
      } else {
        const { touchingPlacement } = insertion

        // is there a touching-seg?
        if (touchingPlacement) {

          // should we hide or reslice touchingPlacement?
          if (this.hiddenConsumes && !touchingPlacement.isZombie) {
            touchingPlacement.isZombie = true // edit in-place
            this.hiddenSegs.push(touchingPlacement)

            if (this.allowSlicing) {
              const newSeg: EventSeg<R> = Object.assign({}, touchingPlacement) // copy

              // slice touchingPlacement in-place
              Object.assign(touchingPlacement, intersectCoordRanges(touchingPlacement, seg))
              touchingPlacement.isSlice = true

              // try to reinsert touchingPlacement's seg
              this.splitSeg(newSeg, touchingPlacement.thickness, touchingPlacement)
            }
          }

          // record seg as hidden, potentially split by touchingPlacement
          if (this.allowSlicing) {
            this.hiddenSegs.push({
              ...seg,
              ...intersectCoordRanges(seg, touchingPlacement),
            })
            this.splitSeg(seg, segThickness, touchingPlacement)
          } else {
            this.hiddenSegs.push(seg)
          }

        // not touching anything
        } else {
          this.hiddenSegs.push(seg)
        }
      }
    }
  }

  /*
  TODO: inline?
  */
  private isInsertionValid(insertion: EventInsertion<R>, thickness: number): boolean {
    return (this.maxCoord == null || insertion.levelCoord + thickness <= this.maxCoord) &&
      (this.maxDepth == null || insertion.depth < this.maxDepth)
  }

  /*
  Does not add the portion that intersects with barrier to hiddenSegs
  */
  private splitSeg(
    seg: EventSeg<R>,
    segThickness: number,
    barrier: CoordRange,
  ): void {
    // any leftover seg on the start-side of the barrier?
    if (seg.start < barrier.start) {
      this.insertSeg(
        { ...seg, end: barrier.start, isEnd: false },
        segThickness,
        /* isSlice = */ true,
      )
    }

    // any leftover seg on the end-side of the barrier?
    if (seg.end > barrier.end) {
      this.insertSeg(
        { ...seg, start: barrier.end, isStart: false },
        segThickness,
        /* isSlice = */ true,
      )
    }
  }

  /*
  TODO: inline?
  */
  private insertSegAt(
    seg: EventSeg<R>,
    insertion: EventInsertion<R>,
    segThickness: number,
    isSlice?: boolean,
  ): void {
    const placement: EventPlacement<R> = {
      ...seg,
      thickness: segThickness,
      depth: insertion.depth,
      isSlice: isSlice || seg.isSlice || false,
      isZombie: false,
    }

    if (insertion.lateralIndex === -1) {
      // create a new level
      insertAt(this.placementsByLevel, insertion.levelIndex, [placement])
      insertAt(this.levelCoords, insertion.levelIndex, insertion.levelCoord)
    } else {
      // insert into existing level
      insertAt(this.placementsByLevel[insertion.levelIndex], insertion.lateralIndex, placement)
    }
  }

  /*
  Ignores limits
  */
  findInsertion(
    seg: CoordRange,
    segThickness: number,
  ): EventInsertion<R> {
    let { placementsByLevel, levelCoords } = this
    let levelCnt = placementsByLevel.length
    let candidateCoord = 0 // a tentative levelCoord for seg's placement
    let touchingPlacement: EventPlacement<R> | undefined
    let touchingLevelIndex: number
    let depth = 0

    // iterate through existing levels
    for (let currentLevelIndex = 0; currentLevelIndex < levelCnt; currentLevelIndex += 1) {
      const currentLevelCoord = levelCoords[currentLevelIndex]

      // if the current level has cleared seg's bottom coord, we have found a good empty space and can stop.
      // if strictOrder, keep finding more lateral intersections.
      if (!this.strictOrder && currentLevelCoord >= candidateCoord + segThickness) {
        break
      }

      let currentLevelSegs = placementsByLevel[currentLevelIndex]
      let currentSeg: EventPlacement<R>

      // finds the first possible entry that seg could intersect with
      let [searchIndex, isExact] = binarySearch(currentLevelSegs, seg.start, getCoordRangeEnd) // find first entry after seg's end
      let lateralIndex = searchIndex + isExact // if exact match (which doesn't collide), go to next one

      // loop through entries that horizontally intersect
      while (
        (currentSeg = currentLevelSegs[lateralIndex]) && // but not past the whole entry list
        currentSeg.start < seg.end // and not entirely past seg
      ) {
        let currentEntryBottom = currentLevelCoord + currentSeg.thickness

        // intersects into the top of the candidate?
        if (currentEntryBottom > candidateCoord) {
          // push it downward so doesn't 'vertically' intersect anymore
          candidateCoord = currentEntryBottom

          // tentatively record as touching
          touchingPlacement = currentSeg
          touchingLevelIndex = currentLevelIndex
        }

        // does current entry butt up against top of candidate?
        // will obviously happen if just intersected, but can also happen if pushed down previously
        // because intersected with a sibling
        // TODO: after automated tests hooked up, see if these gate is unnecessary,
        // we might just be able to do this for ALL intersecting currentEntries (this whole loop)
        if (currentEntryBottom === candidateCoord) {
          // accumulate the highest possible depth of the currentLevelSegs that butt up
          depth = Math.max(depth, currentSeg.depth + 1)
        }

        lateralIndex += 1
      }
    }

    // the destination level will be after touchingPlacement's level. find it
    // TODO: can reuse work from above?
    let destLevelIndex = 0
    if (touchingPlacement) {
      destLevelIndex = touchingLevelIndex + 1
      while (destLevelIndex < levelCnt && levelCoords[destLevelIndex] < candidateCoord) {
        destLevelIndex += 1
      }
    }

    // if adding to an existing level, find where to insert
    // TODO: can reuse work from above?
    let destLateralIndex = -1
    if (destLevelIndex < levelCnt && levelCoords[destLevelIndex] === candidateCoord) {
      [destLateralIndex] = binarySearch(placementsByLevel[destLevelIndex], seg.end, getCoordRangeEnd)
    }

    return {
      touchingPlacement,
      levelCoord: candidateCoord,
      levelIndex: destLevelIndex,
      lateralIndex: destLateralIndex,
      depth,
    }
  }

  traverseSegs(handler: (seg: EventPlacement<R>, levelCoord: number) => void) {
    const { placementsByLevel, levelCoords } = this

    for (let i = 0; i < placementsByLevel.length; i++) {
      const placements = placementsByLevel[i]
      const levelCoord = levelCoords[i]

      for (const placement of placements) {
        if (!placement.isZombie) {
          handler(placement, levelCoord)
        }
      }
    }
  }
}

// Grouping
// -------------------------------------------------------------------------------------------------

interface SegInternalGroup<R extends SlicedCoordRange> extends CoordRange {
  segs: EventSeg<R>[]
}

export interface SegGroup<R extends SlicedCoordRange> extends SegInternalGroup<R> {
  key: string
}

/*
Returns groups with entries sorted by input order
*/
export function groupIntersectingSegs<R extends SlicedCoordRange>(segs: EventSeg<R>[]): SegGroup<R>[] {
  let mergedGroups: SegInternalGroup<R>[] = []

  for (let seg of segs) {
    let filteredGroups: SegInternalGroup<R>[] = []
    let hungryGroup: SegInternalGroup<R> = { // the merge that will eat what it collides with
      segs: [seg],
      start: seg.start,
      end: seg.end,
    }

    for (let mergedGroup of mergedGroups) {
      if (doCoordRangesIntersect(mergedGroup, hungryGroup)) {
        hungryGroup = {
          ...joinCoordRanges(mergedGroup, hungryGroup),
          segs: mergedGroup.segs.concat(hungryGroup.segs) // keep preexisting mergedGroup's items first. maintains order
        }
      } else {
        filteredGroups.push(mergedGroup)
      }
    }

    filteredGroups.push(hungryGroup)
    mergedGroups = filteredGroups
  }

  return mergedGroups.map((mergedGroup) => {
    return {
      key: buildIsoString(computeEarliestStart(mergedGroup.segs)),
      ...mergedGroup
    }
  })
}

// General Utils
// -------------------------------------------------------------------------------------------------

function insertAt<Item>(arr: Item[], index: number, item: Item) {
  arr.splice(index, 0, item)
}

export function binarySearch<Item>(
  a: Item[],
  searchVal: number,
  getItemVal: (item: Item) => number,
): [number, number] { // returns [level, isExactMatch ? 1 : 0]
  let startIndex = 0
  let endIndex = a.length // exclusive

  if (!endIndex || searchVal < getItemVal(a[startIndex])) { // no items OR before first item
    return [0, 0]
  }
  if (searchVal > getItemVal(a[endIndex - 1])) { // after last item
    return [endIndex, 0]
  }

  while (startIndex < endIndex) {
    let middleIndex = Math.floor(startIndex + (endIndex - startIndex) / 2)
    let middleVal = getItemVal(a[middleIndex])

    if (searchVal < middleVal) {
      endIndex = middleIndex
    } else if (searchVal > middleVal) {
      startIndex = middleIndex + 1
    } else { // equal!
      return [middleIndex, 1]
    }
  }

  return [startIndex, 0]
}
