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
  level: number // will have an equal coord, or slightly before, entries in existing level
  levelCoord: number
  lateralStart: number // within the previous level
  lateralEnd: number // within the previous level
  touchingLevel: number // is -1 if no touching
  touchingEntry: SegEntry // the last touching entry in the level
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

  isInsertionValid(insertion: SegInsertion, entry: SegEntry): boolean {
    return (this.maxCoord === -1 || insertion.levelCoord + entry.thickness <= this.maxCoord) &&
      (this.maxStackCnt === -1 || insertion.stackCnt < this.maxStackCnt)
  }

  // returns number of new entries inserted
  handleInvalidInsertion(insertion: SegInsertion, entry: SegEntry, hiddenEntries: SegEntry[]): number {
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

    if (entrySpan.end > barrierSpan.end) {
      partCnt += this.insertEntry({
        index: entry.index,
        thickness: entry.thickness,
        span: { start: barrierSpan.end, end: entrySpan.end },
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
    let { entriesByLevel, levelCoords } = this
    let destLevel = insertion.level

    if (
      destLevel >= levelCoords.length || // level doesn't exist yet
      levelCoords[destLevel] > insertion.levelCoord // destLevel needs to be pushed forward to make way
    ) {
      // create a new level
      insertAt(levelCoords, destLevel, insertion.levelCoord)
      insertAt(entriesByLevel, destLevel, [entry])
    } else {
      // insert into existing level
      insertAt(entriesByLevel[destLevel], insertion.lateralEnd, entry)
    }

    this.stackCnts[buildEntryKey(entry)] = insertion.stackCnt
  }

  findInsertion(newEntry: SegEntry): SegInsertion {
    let { levelCoords, entriesByLevel, stackCnts, strictOrder } = this
    let levelCnt = levelCoords.length
    let resLevelCoord = 0
    let resLevel = 0
    let lateralStart = 0
    let lateralEnd = 0
    let touchingLevel = -1
    let touchingEntry: SegEntry = null // last touch entry

    for (let level = 0; level < levelCnt; level += 1) {
      let levelCoord = levelCoords[level]

      // if the current level is past the placed entry, we have found a good empty space and can stop.
      // if strictOrder, keep finding more lateral intersections.
      if (!strictOrder && levelCoord >= resLevelCoord + newEntry.thickness) {
        break
      }

      let entries = entriesByLevel[level]
      let entry: SegEntry
      let searchRes = binarySearch(entries, newEntry.span.start, getEntrySpanEnd)
      lateralStart = searchRes[0] + searchRes[1] // if exact match (which doesn't collide), go to next one
      lateralEnd = lateralStart // also functions as a moving index

      while ( // loop through entries that horizontally intersect
        (entry = entries[lateralEnd]) && // but not past the whole entry list
        entry.span.start < newEntry.span.end // and not entirely past newEntry
      ) {
        if (
          strictOrder || // strict-mode doesn't care about vert intersection. record touch and keep pushing down
          ( // vertically intersects?
            resLevelCoord < levelCoord + entry.thickness &&
            resLevelCoord + newEntry.thickness > levelCoord
          )
        ) {
          // push down the potential destination
          resLevelCoord = levelCoord + entry.thickness // move to bottom of colliding entry
          touchingLevel = level
          touchingEntry = entry
        }
        lateralEnd += 1
      }

      // regardless of whether there were collisions in the current level,
      // keep updating the final-destination level until it goes past the final-destination coord.
      if (levelCoord < resLevelCoord) {
        resLevel = level + 1
      }
    }

    return {
      level: resLevel,
      levelCoord: resLevelCoord,
      lateralStart,
      lateralEnd,
      touchingLevel,
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
