export interface SegInput {
  index: number
  spanStart: number
  spanEnd: number
  thickness: number // should be an integer
}

export interface SegEntry { // might be a sliced version of SegInput
  segInput: SegInput
  spanStart: number
  spanEnd: number
  thickness: number
}

export interface SegRect extends SegEntry {
  levelCoord: number
}

export interface SegInsertion {
  levelCoord: number
  nextLevel: number
  lateralStart: number // within the previous level
  lateralEnd: number // within the previous level
  touchingEntry: SegEntry
  stackCnt: number
}

export interface SegEntryGroup { // TODO: extend from something like "SegHCoords" ?
  spanStart: number
  spanEnd: number
  entries: SegEntry[]
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

  addSegs(segInputs: SegInput[]): SegEntry[] {
    let hiddenEntries: SegEntry[] = []

    for (let segInput of segInputs) {
      this.insertEntry({
        segInput,
        spanStart: segInput.spanStart,
        spanEnd: segInput.spanEnd,
        thickness: segInput.thickness,
      }, hiddenEntries)
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

    if (entry.spanStart < barrier.spanStart) {
      partCnt += this.insertEntry({
        ...entry,
        spanStart: entry.spanStart,
        spanEnd: barrier.spanStart,
      }, splitHiddenEntries)
    }

    if (barrier.spanEnd < entry.spanEnd) {
      partCnt += this.insertEntry({
        ...entry,
        spanStart: barrier.spanEnd,
        spanEnd: entry.spanEnd,
      }, splitHiddenEntries)
    }

    if (partCnt) {
      hiddenEntries.push({
        ...entry,
        spanStart: Math.max(barrier.spanStart, entry.spanStart), // intersect
        spanEnd: Math.min(barrier.spanEnd, entry.spanEnd), // intersect
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
      let searchRes = binarySearch(entries, newEntry.spanStart, getEntrySpanEnd)
      lateralStart = searchRes[0] + searchRes[1] // if exact match (which doesn't collide), go to next one
      lateralEnd = lateralStart

      while ( // loop through entries that horizontally intersect
        (entry = entries[lateralEnd]) && // but not past the whole entry list
        entry.spanStart < newEntry.spanEnd
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
  return entry.spanEnd
}

export function buildEntryKey(entry: SegEntry) {
  return entry.segInput.index + ':' + entry.spanStart
}

// returns groups with entries sorted by input order
export function groupIntersectingEntries(entries: SegEntry[]): SegEntryGroup[] {
  let merges: SegEntryGroup[] = []

  for (let entry of entries) {
    let filteredMerges: SegEntryGroup[] = []
    let hungryMerge: SegEntryGroup = { // the merge that will eat what it collides with
      spanStart: entry.spanStart,
      spanEnd: entry.spanEnd,
      entries: [entry],
    }

    for (let merge of merges) {
      if (merge.spanStart < hungryMerge.spanEnd && merge.spanEnd > hungryMerge.spanStart) { // collides?
        hungryMerge = {
          spanStart: Math.min(merge.spanStart, hungryMerge.spanStart),
          spanEnd: Math.max(merge.spanEnd, hungryMerge.spanEnd),
          entries: merge.entries.concat(hungryMerge.entries), // keep preexisting merge's items first. maintains order
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
