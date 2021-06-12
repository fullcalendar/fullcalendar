
export interface SegSpan {
  start: number
  end: number
}

export interface SegEntry {
  index: number
  thickness: number // should be an integer
  span: SegSpan
}

// used internally. exposed for subclasses of SegHierarchy
export interface SegInsertion {
  levelCoord: number
  nextLevel: number
  lateralStart: number // within the previous level
  lateralEnd: number // within the previous level
  touchingEntry: SegEntry
  stackCnt: number
}

export interface SegRect extends SegEntry {
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

  addSegs(inputs: SegEntry[]): SegEntry[] {
    let hiddenEntries: SegEntry[] = []

    for (let input of inputs) {
      this.insertEntry(input, hiddenEntries)
    }

    return hiddenEntries
  }

  insertEntry(entry: SegEntry, hiddenEntries: SegEntry[]): number {
    let insertion = this.findInsertion(entry)

    if (this.isInsertionValid(insertion, entry)) {
      this.insertEntryAt(entry, insertion)
      return 1
    }

    return this.handleInvalidInsertion(insertion, entry, hiddenEntries)
  }

  isInsertionValid(insertion: SegInsertion, entry: SegEntry) {
    return (this.maxCoord === -1 || insertion.levelCoord + entry.thickness <= this.maxCoord) &&
      (this.maxStackCnt === -1 || insertion.stackCnt < this.maxStackCnt)
  }

  handleInvalidInsertion(insertion: SegInsertion, entry: SegEntry, hiddenEntries: SegEntry[]) {
    if (this.allowReslicing && insertion.touchingEntry) {
      return this.splitEntry(entry, insertion.touchingEntry, hiddenEntries)
    }

    hiddenEntries.push(entry)
    return 0
  }

  splitEntry(entry: SegEntry, barrier: SegEntry, hiddenEntries: SegEntry[]): number {
    let partCnt = 0
    let splitHiddenEntries: SegEntry[] = []
    let entrySpan = entry.span
    let barrierSpan = barrier.span

    if (entrySpan.start < barrierSpan.start) {
      partCnt += this.insertEntry({
        index: entry.index,
        thickness: entry.thickness,
        span: { start: entrySpan.start, end: barrierSpan.start },
      }, splitHiddenEntries)
    }

    if (barrierSpan.end < entrySpan.end) {
      partCnt += this.insertEntry({
        index: entry.index,
        thickness: entry.thickness,
        span: { start: entrySpan.start, end: barrierSpan.start },
      }, splitHiddenEntries)
    }

    if (partCnt) {
      hiddenEntries.push({
        index: entry.index,
        thickness: entry.thickness,
        span: intersectSpans(barrierSpan, entrySpan), // guaranteed to intersect
      }, ...splitHiddenEntries)
      return partCnt
    }

    hiddenEntries.push(entry)
    return 0
  }

  insertEntryAt(entry: SegEntry, insertion: SegInsertion): void {
    let { nextLevel } = insertion

    // create a new level
    if (!nextLevel || this.levelCoords[nextLevel - 1] < insertion.levelCoord) {
      insertAt(this.levelCoords, nextLevel, insertion.levelCoord)
      insertAt(this.entriesByLevel, nextLevel, [entry])
    // insert into existing level
    } else {
      insertAt(this.entriesByLevel[nextLevel - 1], insertion.lateralEnd, entry)
    }

    this.stackCnts[buildEntryKey(entry)] = insertion.stackCnt
  }

  findInsertion(newEntry: SegEntry): SegInsertion {
    let { levelCoords, entriesByLevel, stackCnts, strictOrder } = this
    let levelCnt = levelCoords.length
    let level // running value while iterating all segs
    let levelCoord // "
    let lateralStart = 0 // "
    let lateralEnd = 0 // "
    let resCoord = 0 // the levelCoord for newSeg
    let touchingEntry: SegEntry = null

    for (level = 0; level < levelCnt; level += 1) {
      levelCoord = levelCoords[level]

      // if the current level is past the placed entry, we have found a good
      // empty space and can stop. only if not strict-ordering mode.
      if (!strictOrder && levelCoord >= resCoord + newEntry.thickness) {
        break
      }

      let entries = entriesByLevel[level]
      let entry: SegEntry
      let searchRes = binarySearch(entries, newEntry.span.start, getEntrySpanEnd)
      lateralStart = searchRes[0] + searchRes[1] // if exact match (which doesn't collide), go to next one
      lateralEnd = lateralStart

      while ( // loop through entries that horizontally intersect
        (entry = entries[lateralEnd]) && // but not past the whole entry list
        entry.span.start < newEntry.span.end
      ) {
        if (
          strictOrder ||
          ( // vertically intersects?
            resCoord < levelCoord + entry.thickness &&
            resCoord + newEntry.thickness > levelCoord
          )
        ) {
          // push down the potential destination
          touchingEntry = entry
          resCoord = levelCoord + entry.thickness // move to bottom of colliding entry
        }
        lateralEnd += 1
      }
    }

    return {
      levelCoord: resCoord,
      nextLevel: level,
      lateralStart,
      lateralEnd,
      touchingEntry,
      stackCnt: touchingEntry ? stackCnts[buildEntryKey(touchingEntry)] + 1 : 0,
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
        rects.push({ ...entry, levelCoord })
      }
    }

    return rects
  }
}

export function getEntrySpanEnd(entry: SegEntry) {
  return entry.span.end
}

export function buildEntryKey(entry: SegEntry) {
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
    end: Math.max(span0.end, span1.end)
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
