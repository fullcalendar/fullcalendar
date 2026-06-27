import { SegHierarchy, SegGroup, groupIntersectingSegs, EventPlacement, binarySearch } from '../seg-hierarchy'
import { getCoordRangeEnd, SlicedCoordRange } from '../coord-range'
import { EventRangeProps, getEventKey } from '../component-util/event-rendering'
import { TimeGridCoordRange, TimeGridRange } from './TimeColsSeg'
import { TimeGridSegVertical } from './event-placement'

/*
Output for buildWeb
*/
type SegNode = SlicedCoordRange & EventRangeProps & {
  thickness: number
  nextLevelNodes: SegNode[] // with highest-pressure first
}

/*
Used internally within buildWeb
*/
type SegNodeAndPressure = [ SegNode, number ]

/*
Internal structure. Result from `findNextLevelSegs`
Will ALWAYS have span of 1 or more items. if not, will be null
*/
interface SegSiblingRange {
  level: number
  lateralStart: number
  lateralEnd: number
}

/*
For final output
*/
export type SegWebRect = SlicedCoordRange & EventRangeProps & {
  thickness: number
  levelCoord: number
  stackDepth: number
  stackForward: number
}

/*
segs assumed sorted
*/
export function buildWebPositioning(
  segs: (TimeGridRange & EventRangeProps)[],
  segVerticals: TimeGridSegVertical[],
  strictOrder?: boolean,
  maxDepth?: number,
): [
  segRects: Map<string, SegWebRect>,
  hiddenGroups: SegGroup<TimeGridCoordRange>[]
] {
  const segRanges: (TimeGridCoordRange & EventRangeProps)[] = []

  // isn't it true that there will either be ALL hcoords or NONE? can optimize
  for (let i = 0; i < segs.length; i++) {
    const segVertical = segVerticals[i]
    if (segVertical) {
      segRanges.push({
        ...segs[i],
        start: segVertical.start,
        end: segVertical.end,
      })
    }
  }

  const hierarchy = new SegHierarchy<TimeGridCoordRange>(
    segRanges,
    undefined, // 1 thickness for all segs
    strictOrder,
    undefined, // maxCoord
    maxDepth,
  )

  let web = buildWeb(hierarchy)
  web = stretchWeb(web, 1) // all levelCoords/thickness will have 0.0-1.0
  const segRects = webToRects(web)

  const hiddenGroups = groupIntersectingSegs(hierarchy.hiddenSegs)
  return [segRects, hiddenGroups]
}

/*
TODO: use SegHierarchy::traverseSegs for this?
*/
function buildWeb(hierarchy: SegHierarchy<TimeGridCoordRange>): SegNode[] {
  const { placementsByLevel } = hierarchy

  const buildNode = cacheable(
    (level: number, lateral: number) => level + ':' + lateral,
    (level: number, lateral: number): SegNodeAndPressure => {
      let siblingRange = findNextLevelSegs(hierarchy, level, lateral)
      let [nextLevelNodes, maxPressure] = buildNodes(siblingRange, buildNode)
      let segPlacement = placementsByLevel[level][lateral]

      return [
        { ...segPlacement, nextLevelNodes },
        segPlacement.thickness + maxPressure, // the pressure builds
      ]
    },
  )

  const [topLevelNodes] = buildNodes(
    placementsByLevel.length
      ? { level: 0, lateralStart: 0, lateralEnd: placementsByLevel[0].length }
      : null,
    buildNode,
  )

  return topLevelNodes
}

function buildNodes(
  siblingRange: SegSiblingRange | null,
  buildNode: (level: number, lateral: number) => SegNodeAndPressure,
): [
  nodes: SegNode[],
  maxPressure: number,
] {
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
    pairs.map(extractNode), // nodes
    pairs[0][1], // first item's pressure
  ]
}

function cmpDescPressures(a: SegNodeAndPressure, b: SegNodeAndPressure) { // sort pressure high -> low
  return b[1] - a[1]
}

function extractNode(a: SegNodeAndPressure): SegNode {
  return a[0]
}

function findNextLevelSegs(hierarchy: SegHierarchy<TimeGridCoordRange>, subjectLevel: number, subjectLateral: number): SegSiblingRange | null {
  let { levelCoords, placementsByLevel } = hierarchy
  let subjectPlacement = placementsByLevel[subjectLevel][subjectLateral]
  let afterSubject = levelCoords[subjectLevel] + subjectPlacement.thickness
  let levelCnt = levelCoords.length
  let level = subjectLevel

  // skip past levels that are too high up
  for (; level < levelCnt && levelCoords[level] < afterSubject; level += 1) ; // do nothing

  for (; level < levelCnt; level += 1) {
    let placements = placementsByLevel[level]
    let placement: EventPlacement<TimeGridCoordRange>
    let searchIndex = binarySearch(placements, subjectPlacement.start, getCoordRangeEnd)
    let lateralStart = searchIndex[0] + searchIndex[1] // if exact match (which doesn't collide), go to next one
    let lateralEnd = lateralStart

    while ( // loop through placements that horizontally intersect
      (placement = placements[lateralEnd]) && // but not past the whole seg list
      placement.start < subjectPlacement.end
    ) { lateralEnd += 1 }

    if (lateralStart < lateralEnd) {
      return { level, lateralStart, lateralEnd }
    }
  }

  return null
}

function stretchWeb(topLevelNodes: SegNode[], totalThickness: number): SegNode[] {
  const stretchNode = cacheable(
    (node: SegNode, startCoord: number, prevThickness: number) => getEventKey(node),
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
function webToRects(topLevelNodes: SegNode[]): Map<string, SegWebRect> {
  let rectMap = new Map<string, SegWebRect>()

  /*
  Returns max stackForward of the node's forward children
  */
  const processNode = cacheable(
    (node: SegNode, levelCoord: number, stackDepth: number) => getEventKey(node),
    (node: SegNode, levelCoord: number, stackDepth: number) => {
      let rect: SegWebRect = {
        ...node,
        levelCoord,
        stackDepth,
        stackForward: 0, // will assign after recursing
      }
      rectMap.set(rect.eventRange.instance.instanceId, rect)

      return (
        rect.stackForward = processNodes(node.nextLevelNodes, levelCoord + node.thickness, stackDepth + 1)
      )
    },
  )

  /*
  Returns max stackForward of all `nodes`
  */
  function processNodes(nodes: SegNode[], levelCoord: number, stackDepth: number) {
    let stackForward = 0
    for (let node of nodes) {
      stackForward = Math.max(processNode(node, levelCoord, stackDepth) + 1, stackForward)
    }
    return stackForward
  }

  processNodes(topLevelNodes, 0, 0)
  return rectMap
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
