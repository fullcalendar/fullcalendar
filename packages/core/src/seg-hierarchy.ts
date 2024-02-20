export interface SegSpan {
  start: number
  end: number
}

export interface SegEntry {
  index: number
  thickness?: number // should be an integer
  span: SegSpan
}

// used internally. exposed for subclasses of SegHierarchy
export interface SegInsertion {
  level: number // will have an equal coord, or slightly before, entries in existing level
  levelCoord: number
  lateral: number // where to insert in the existing level. -1 if creating a new level
  touchingLevel: number // -1 if no touching
  touchingLateral: number // -1 if no touching
  touchingEntry: SegEntry // the last touching entry in the level
  stackCnt: number
}

export interface SegRect extends SegEntry {
  thickness: number
  levelCoord: number
}

export interface SegEntryGroup {
  entries: SegEntry[]
  span: SegSpan
}

export class SegHierarchy {
  // settings
  strictOrder: boolean = false
  allowReslicing: boolean = false
  maxCoord: number = -1 // -1 means no max
  maxStackCnt: number = -1 // -1 means no max

  levelCoords: number[] = [] // ordered
  entriesByLevel: SegEntry[][] = [] // parallel with levelCoords
  stackCnts: { [entryId: string]: number } = {} // TODO: use better technique!?

  constructor(
    private getEntryThickness = (entry: SegEntry): number => {
      // if no thickness known, assume 1 (if 0, so small it always fits)
      return entry.thickness || 1
    },
  ) {}

  addSegs(inputs: SegEntry[]): SegEntry[] {
    let hiddenEntries: SegEntry[] = []

    for (let input of inputs) {
      this.insertEntry(input, hiddenEntries)
    }

    return hiddenEntries
  }

  insertEntry(entry: SegEntry, hiddenEntries: SegEntry[]): void {
    let insertion = this.findInsertion(entry)

    if (this.isInsertionValid(insertion, entry)) {
      this.insertEntryAt(entry, insertion)
    } else {
      this.handleInvalidInsertion(insertion, entry, hiddenEntries)
    }
  }

  isInsertionValid(insertion: SegInsertion, entry: SegEntry): boolean {
    return (this.maxCoord === -1 || insertion.levelCoord + this.getEntryThickness(entry) <= this.maxCoord) &&
      (this.maxStackCnt === -1 || insertion.stackCnt < this.maxStackCnt)
  }

  handleInvalidInsertion(insertion: SegInsertion, entry: SegEntry, hiddenEntries: SegEntry[]): void {
    if (this.allowReslicing && insertion.touchingEntry) {
      const hiddenEntry = {
        ...entry,
        span: intersectSpans(entry.span, insertion.touchingEntry.span),
      }

      hiddenEntries.push(hiddenEntry)
      this.splitEntry(entry, insertion.touchingEntry, hiddenEntries)
    } else {
      hiddenEntries.push(entry)
    }
  }

  /*
  Does NOT add what hit the `barrier` into hiddenEntries. Should already be done.
  */
  splitEntry(entry: SegEntry, barrier: SegEntry, hiddenEntries: SegEntry[]): void {
    let entrySpan = entry.span
    let barrierSpan = barrier.span

    if (entrySpan.start < barrierSpan.start) {
      this.insertEntry({
        index: entry.index,
        thickness: entry.thickness,
        span: { start: entrySpan.start, end: barrierSpan.start },
      }, hiddenEntries)
    }

    if (entrySpan.end > barrierSpan.end) {
      this.insertEntry({
        index: entry.index,
        thickness: entry.thickness,
        span: { start: barrierSpan.end, end: entrySpan.end },
      }, hiddenEntries)
    }
  }

  insertEntryAt(entry: SegEntry, insertion: SegInsertion): void {
    let { entriesByLevel, levelCoords } = this

    if (insertion.lateral === -1) {
      // create a new level
      insertAt(levelCoords, insertion.level, insertion.levelCoord)
      insertAt(entriesByLevel, insertion.level, [entry])
    } else {
      // insert into existing level
      insertAt(entriesByLevel[insertion.level], insertion.lateral, entry)
    }

    this.stackCnts[buildEntryKey(entry)] = insertion.stackCnt
  }

  /*
  does not care about limits
  */
  findInsertion(newEntry: SegEntry): SegInsertion {
    let { levelCoords, entriesByLevel, strictOrder, stackCnts } = this
    let levelCnt = levelCoords.length
    let candidateCoord = 0
    let touchingLevel: number = -1
    let touchingLateral: number = -1
    let touchingEntry: SegEntry = null
    let stackCnt = 0

    for (let trackingLevel = 0; trackingLevel < levelCnt; trackingLevel += 1) {
      const trackingCoord = levelCoords[trackingLevel]

      // if the current level is past the placed entry, we have found a good empty space and can stop.
      // if strictOrder, keep finding more lateral intersections.
      if (!strictOrder && trackingCoord >= candidateCoord + this.getEntryThickness(newEntry)) {
        break
      }

      let trackingEntries = entriesByLevel[trackingLevel]
      let trackingEntry: SegEntry
      let searchRes = binarySearch(trackingEntries, newEntry.span.start, getEntrySpanEnd) // find first entry after newEntry's end
      let lateralIndex = searchRes[0] + searchRes[1] // if exact match (which doesn't collide), go to next one

      while ( // loop through entries that horizontally intersect
        (trackingEntry = trackingEntries[lateralIndex]) && // but not past the whole entry list
        trackingEntry.span.start < newEntry.span.end // and not entirely past newEntry
      ) {
        let trackingEntryBottom = trackingCoord + this.getEntryThickness(trackingEntry)
        // intersects into the top of the candidate?
        if (trackingEntryBottom > candidateCoord) {
          candidateCoord = trackingEntryBottom
          touchingEntry = trackingEntry
          touchingLevel = trackingLevel
          touchingLateral = lateralIndex
        }
        // butts up against top of candidate? (will happen if just intersected as well)
        if (trackingEntryBottom === candidateCoord) {
          // accumulate the highest possible stackCnt of the trackingEntries that butt up
          stackCnt = Math.max(stackCnt, stackCnts[buildEntryKey(trackingEntry)] + 1)
        }
        lateralIndex += 1
      }
    }

    // the destination level will be after touchingEntry's level. find it
    let destLevel = 0
    if (touchingEntry) {
      destLevel = touchingLevel + 1
      while (destLevel < levelCnt && levelCoords[destLevel] < candidateCoord) {
        destLevel += 1
      }
    }

    // if adding to an existing level, find where to insert
    let destLateral = -1
    if (destLevel < levelCnt && levelCoords[destLevel] === candidateCoord) {
      destLateral = binarySearch(entriesByLevel[destLevel], newEntry.span.end, getEntrySpanEnd)[0]
    }

    return {
      touchingLevel,
      touchingLateral,
      touchingEntry,
      stackCnt,
      levelCoord: candidateCoord,
      level: destLevel,
      lateral: destLateral,
    }
  }

  // sorted by levelCoord (lowest to highest)
  toRects(): SegRect[] {
    let { entriesByLevel, levelCoords } = this
    let levelCnt = entriesByLevel.length
    let rects: SegRect[] = []

    for (let level = 0; level < levelCnt; level += 1) {
      let entries = entriesByLevel[level]
      let levelCoord = levelCoords[level]

      for (let entry of entries) {
        rects.push({
          ...entry,
          thickness: this.getEntryThickness(entry),
          levelCoord,
        })
      }
    }

    return rects
  }
}

export function getEntrySpanEnd(entry: SegEntry) {
  return entry.span.end
}

export function buildEntryKey(entry: SegEntry) { // TODO: use Map instead?
  return entry.index + ':' + entry.span.start
}

// returns groups with entries sorted by input order
export function groupIntersectingEntries(entries: SegEntry[]): SegEntryGroup[] {
  let merges: SegEntryGroup[] = []

  for (let entry of entries) {
    let filteredMerges: SegEntryGroup[] = []
    let hungryMerge: SegEntryGroup = { // the merge that will eat what it collides with
      span: entry.span,
      entries: [entry],
    }

    for (let merge of merges) {
      if (intersectSpans(merge.span, hungryMerge.span)) {
        hungryMerge = {
          entries: merge.entries.concat(hungryMerge.entries), // keep preexisting merge's items first. maintains order
          span: joinSpans(merge.span, hungryMerge.span),
        }
      } else {
        filteredMerges.push(merge)
      }
    }

    filteredMerges.push(hungryMerge)
    merges = filteredMerges
  }

  return merges
}

export function joinSpans(span0: SegSpan, span1: SegSpan): SegSpan {
  return {
    start: Math.min(span0.start, span1.start),
    end: Math.max(span0.end, span1.end),
  }
}

export function intersectSpans(span0: SegSpan, span1: SegSpan): SegSpan | null {
  let start = Math.max(span0.start, span1.start)
  let end = Math.min(span0.end, span1.end)

  if (start < end) {
    return { start, end }
  }

  return null
}

// general util
// ---------------------------------------------------------------------------------------------------------------------

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
