import {
  SegSpan,
  SegEntry,
  SegHierarchy,
  SegRect,
  buildEntryKey,
  getEntrySpanEnd,
  binarySearch,
  SegEntryGroup,
  groupIntersectingEntries,
  DateMarker,
} from '@fullcalendar/common'
import { TimeColsSeg } from './TimeColsSeg'
import { TimeColsSlatsCoords } from './TimeColsSlatsCoords'

// public interface
// ------------------------------------------------------------------------------------------

export interface TimeColFgSegPlacement {
  seg: TimeColsSeg
  rect: WebSegRect | null
}

export function computeSegVCoords(
  segs: TimeColsSeg[],
  colDate: DateMarker,
  slatCoords: TimeColsSlatsCoords = null,
  eventMinHeight: number = 0, // might be null/undefined :(
): SegSpan[] {
  let vcoords: SegSpan[] = []

  if (slatCoords) {
    for (let i = 0; i < segs.length; i += 1) {
      let seg = segs[i]
      let spanStart = slatCoords.computeDateTop(seg.start, colDate)
      let spanEnd = Math.max(
        spanStart + (eventMinHeight || 0), // :(
        slatCoords.computeDateTop(seg.end, colDate),
      )
      vcoords.push({
        start: Math.round(spanStart), // for barely-overlapping collisions
        end: Math.round(spanEnd), //
      })
    }
  }

  return vcoords
}

// TODO: lots of conversion between objects in here
//   change internals to accept public objects
export function computeFgSegPlacements(
  segs: TimeColsSeg[],
  segVCoords: SegSpan[], // might not have for every seg
  eventOrderStrict?: boolean,
  eventMaxStack?: number,
): { segPlacements: TimeColFgSegPlacement[], hiddenGroups: SegEntryGroup[] } {
  let segInputs: SegEntry[] = []
  let dumbSegs: TimeColsSeg[] = [] // segs without coords

  for (let i = 0; i < segs.length; i += 1) {
    let vcoords = segVCoords[i]
    if (vcoords) {
      segInputs.push({
        index: i,
        thickness: 1,
        span: vcoords,
      })
    } else {
      dumbSegs.push(segs[i])
    }
  }

  let { segRects, hiddenGroups } = buildPositioning(segInputs, eventOrderStrict, eventMaxStack)
  let segPlacements: TimeColFgSegPlacement[] = []

  for (let segRect of segRects) {
    segPlacements.push({
      seg: segs[segRect.index],
      rect: segRect,
    })
  }

  for (let dumbSeg of dumbSegs) {
    segPlacements.push({ seg: dumbSeg, rect: null })
  }

  return { segPlacements, hiddenGroups }
}








// internals
// ------------------------------------------------------------------------------------------

interface SegNode extends SegEntry {
  nextLevelNodes: SegNode[] // with highest-pressure first
}

type SegNodeAndPressure = [ SegNode, number ]

interface SegSiblingRange { // will ALWAYS have span of 1 or more items. if not, will be null
  level: number
  lateralStart: number
  lateralEnd: number
}

export interface WebSegRect extends SegRect {
  stackDepth: number
  stackForward: number
}

// segInputs assumed sorted
function buildPositioning(
  segInputs: SegEntry[],
  strictOrder?: boolean,
  maxStackCnt?: number,
): { segRects: WebSegRect[], hiddenGroups: SegEntryGroup[] } {
  let hierarchy = new SegHierarchy()
  if (strictOrder != null) {
    hierarchy.strictOrder = strictOrder
  }
  if (maxStackCnt != null) {
    hierarchy.maxStackCnt = maxStackCnt
  }

  let hiddenEntries = hierarchy.addSegs(segInputs)
  let hiddenGroups = groupIntersectingEntries(hiddenEntries)

  let web = buildWeb(hierarchy)
  web = stretchWeb(web, 1) // all levelCoords/thickness will have 0.0-1.0
  let segRects = webToRects(web)

  return { segRects, hiddenGroups }
}

function buildWeb(hierarchy: SegHierarchy): SegNode[] {
  const { entriesByLevel } = hierarchy

  const buildNode = cacheable(
    (level: number, lateral: number) => level + ':' + lateral,
    (level: number, lateral: number): SegNodeAndPressure => {
      let siblingRange = findNextLevelSegs(hierarchy, level, lateral)
      let nextLevelRes = buildNodes(siblingRange, buildNode)
      let entry = entriesByLevel[level][lateral]

      return [
        { ...entry, nextLevelNodes: nextLevelRes[0] },
        entry.thickness + nextLevelRes[1], // the pressure builds
      ]
    },
  )

  return buildNodes(
    entriesByLevel.length
      ? { level: 0, lateralStart: 0, lateralEnd: entriesByLevel[0].length }
      : null,
    buildNode,
  )[0]
}

function buildNodes(
  siblingRange: SegSiblingRange | null,
  buildNode: (level: number, lateral: number) => SegNodeAndPressure,
): [SegNode[], number] { // number is maxPressure
  if (!siblingRange) {
    return [[], 0]
  }

  let { level, lateralStart, lateralEnd } = siblingRange
  let lateral = lateralStart
  let pairs: SegNodeAndPressure[] = []

  while (lateral < lateralEnd) {
    pairs.push(buildNode(level, lateral))
    lateral += 1
  }

  pairs.sort(cmpDescPressures)

  return [
    pairs.map(extractNode),
    pairs[0][1], // first item's pressure
  ]
}

function cmpDescPressures(a: SegNodeAndPressure, b: SegNodeAndPressure) { // sort pressure high -> low
  return b[1] - a[1]
}

function extractNode(a: SegNodeAndPressure): SegNode {
  return a[0]
}

function findNextLevelSegs(hierarchy: SegHierarchy, subjectLevel: number, subjectLateral: number): SegSiblingRange | null {
  let { levelCoords, entriesByLevel } = hierarchy
  let subjectEntry = entriesByLevel[subjectLevel][subjectLateral]
  let afterSubject = levelCoords[subjectLevel] + subjectEntry.thickness
  let levelCnt = levelCoords.length
  let level = subjectLevel

  // skip past levels that are too high up
  for (; level < levelCnt && levelCoords[level] < afterSubject; level += 1) ; // do nothing

  for (; level < levelCnt; level += 1) {
    let entries = entriesByLevel[level]
    let entry: SegEntry
    let searchIndex = binarySearch(entries, subjectEntry.span.start, getEntrySpanEnd)
    let lateralStart = searchIndex[0] + searchIndex[1] // if exact match (which doesn't collide), go to next one
    let lateralEnd = lateralStart

    while ( // loop through entries that horizontally intersect
      (entry = entries[lateralEnd]) && // but not past the whole seg list
      entry.span.start < subjectEntry.span.end
    ) { lateralEnd += 1 }

    if (lateralStart < lateralEnd) {
      return { level, lateralStart, lateralEnd }
    }
  }

  return null
}

function stretchWeb(topLevelNodes: SegNode[], totalThickness: number): SegNode[] {
  const stretchNode = cacheable(
    (node: SegNode, startCoord: number, prevThickness: number) => buildEntryKey(node),
    (node: SegNode, startCoord: number, prevThickness: number): [number, SegNode] => { // [startCoord, node]
      let { nextLevelNodes, thickness } = node
      let allThickness = thickness + prevThickness
      let thicknessFraction = thickness / allThickness
      let endCoord: number
      let newChildren: SegNode[] = []

      if (!nextLevelNodes.length) {
        endCoord = totalThickness
      } else {
        for (let childNode of nextLevelNodes) {
          if (endCoord === undefined) {
            let res = stretchNode(childNode, startCoord, allThickness)
            endCoord = res[0]
            newChildren.push(res[1])
          } else {
            let res = stretchNode(childNode, endCoord, 0)
            newChildren.push(res[1])
          }
        }
      }

      let newThickness = (endCoord - startCoord) * thicknessFraction
      return [endCoord - newThickness, {
        ...node,
        thickness: newThickness,
        nextLevelNodes: newChildren,
      }]
    },
  )

  return topLevelNodes.map((node: SegNode) => stretchNode(node, 0, 0)[1])
}

// not sorted in any particular order
function webToRects(topLevelNodes: SegNode[]): WebSegRect[] {
  let rects: WebSegRect[] = []

  const processNode = cacheable(
    (node: SegNode, levelCoord: number, stackDepth: number) => buildEntryKey(node),
    (node: SegNode, levelCoord: number, stackDepth: number) => { // returns forwardPressure
      let rect: WebSegRect = {
        ...node,
        levelCoord,
        stackDepth,
        stackForward: 0, // will assign after recursing
      }
      rects.push(rect)

      return (
        rect.stackForward = processNodes(node.nextLevelNodes, levelCoord + node.thickness, stackDepth + 1) + 1
      )
    },
  )

  function processNodes(nodes: SegNode[], levelCoord: number, stackDepth: number) { // returns stackForward
    let stackForward = 0
    for (let node of nodes) {
      stackForward = Math.max(processNode(node, levelCoord, stackDepth), stackForward)
    }
    return stackForward
  }

  processNodes(topLevelNodes, 0, 0)
  return rects // TODO: sort rects by levelCoord to be consistent with toRects?
}

// TODO: move to general util

function cacheable<Args extends any[], Res>(
  keyFunc: (...args: Args) => string,
  workFunc: (...args: Args) => Res,
): ((...args: Args) => Res) {
  const cache: { [key: string]: Res } = {}

  return (...args: Args) => {
    let key = keyFunc(...args)
    return (key in cache)
      ? cache[key]
      : (cache[key] = workFunc(...args))
  }
}
