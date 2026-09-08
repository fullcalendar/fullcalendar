import { describe, expect, it } from 'vitest'
import {
  GEOMETRY_TOLERANCE,
  type HiddenSliceGroup,
  type Slice,
  type SourceSeg,
  buildPixelLimitedLayout,
  buildSegLevels,
  convertSegLevelsToWholeSlices,
  convertSegsToWholeSlices,
  getSliceKey,
  groupLaterallyIntersecting,
  placeExtraSlicesInLevels,
  resolveLevelCoords,
  sortByEventOrder,
} from '../../src/seg-placement/kernel'

type TestSeg = SourceSeg & { id: string }

describe('pure positioning kernel', () => {
  it('puts wider same-start slices of one event first', () => {
    const [source] = segs([['event', 0, 3]])
    const [whole] = convertSegsToWholeSlices([source])
    const narrower = { ...whole, end: 1, isEnd: false }

    expect(projectSlices(sortByEventOrder([narrower, whole]))).toEqual([
      ['event', 0, 3],
      ['event', 0, 1],
    ])
  })

  it('preserves rejection order and makes strict order part of topology', () => {
    const rejectedScenario = segs([
      ['first', 0, 3],
      ['second', 0, 1],
      ['third', 1, 2],
      ['fourth', 0, 3],
    ])
    const limited = buildSegLevels(rejectedScenario, false, 1)
    expect(limited.excludedSegs.map((seg) => seg.key)).toEqual([
      'second:0',
      'third:1',
      'fourth:0',
    ])

    const topologyScenario = segs([
      ['a', 0, 1],
      ['b', 0, 2],
      ['c', 1, 2],
    ])
    expect(projectSegLevels(
      buildSegLevels(topologyScenario, false).segLevels,
    )).toEqual([['a', 'c'], ['b']])
    expect(projectSegLevels(
      buildSegLevels(topologyScenario, true).segLevels,
    )).toEqual([['a'], ['b'], ['c']])
  })

  it('places the best scored slice plan and hides the remainder', () => {
    const [base, extra] = segs([
      ['base', 1, 2],
      ['extra', 0, 3],
    ])

    const unsliced = placeExtraSlicesInLevels(
      convertSegLevelsToWholeSlices([[base]]),
      convertSegsToWholeSlices([extra]),
      false,
      false,
      0,
    )
    expect(projectSlices(unsliced.sliceLevels.flat())).toEqual([
      ['base', 1, 2],
    ])
    expect(projectSlices(hiddenGroupsOf(unsliced)[0].hiddenSlices)).toEqual([
      ['extra', 0, 3],
    ])

    const sliced = placeExtraSlicesInLevels(
      convertSegLevelsToWholeSlices([[base]]),
      convertSegsToWholeSlices([extra]),
      false,
      true,
      0,
    )
    expect(projectSlices(sliced.sliceLevels.flat())).toEqual([
      ['extra', 0, 1],
      ['base', 1, 2],
      ['extra', 2, 3],
    ])
    expect(projectSlices(hiddenGroupsOf(sliced)[0].hiddenSlices)).toEqual([
      ['extra', 1, 2],
    ])
    expect(projectSlices(sliced.addedSlices)).toEqual([
      ['extra', 0, 1],
      ['extra', 2, 3],
    ])
    auditCoverage([base, extra], sliced.sliceLevels, sliced.hiddenSlices)
  })

  it('reserves the bottom level only under a level tax', () => {
    const [base, extra] = segs([
      ['base', 0, 1],
      ['extra', 0, 1],
    ])

    const untaxed = placeExtraSlicesInLevels(
      convertSegLevelsToWholeSlices([[base]]),
      convertSegsToWholeSlices([extra]),
      false,
      false,
      0,
    )
    expect(projectSlices(untaxed.sliceLevels.flat())).toEqual([['base', 0, 1]])
    expect(projectSlices(hiddenGroupsOf(untaxed)[0].hiddenSlices)).toEqual([
      ['extra', 0, 1],
    ])

    const taxed = placeExtraSlicesInLevels(
      convertSegLevelsToWholeSlices([[base]]),
      convertSegsToWholeSlices([extra]),
      false,
      false,
      1,
    )
    expect(taxed.sliceLevels.flat()).toEqual([])
    expect(hiddenGroupsOf(taxed)[0]).toMatchObject({ start: 0, end: 1 })
    // Group members are in event order, not hiding order.
    expect(hiddenGroupsOf(taxed)[0].hiddenSlices.map((slice) => slice.sourceSeg.id))
      .toEqual(['base', 'extra'])
    auditCoverage([base, extra], taxed.sliceLevels, taxed.hiddenSlices)
  })

  it('makes bounded coordinate exclusion final and non-blocking', () => {
    const [tooTall, later] = segs([
      ['too-tall', 0, 1],
      ['later', 0, 1],
    ])
    const levels = convertSegLevelsToWholeSlices([[tooTall], [later]])
    const heights = new Map([
      [tooTall.key, 12],
      [later.key, 5],
    ])
    const result = resolveLevelCoords(
      levels,
      heights,
      10,
    )

    // The placement structure re-levels around the exclusion.
    expect(result.placementSliceLevels.map(projectSlices)).toEqual([
      [['later', 0, 1]],
    ])
    expect(result.excludedSlices).toEqual([levels[0][0]])
    expect(result.sliceCoords.get(later.key)).toBe(0)
  })

  it('keeps unmeasured slices pending and non-blocking', () => {
    const [pending, measured] = segs([
      ['pending', 0, 1],
      ['measured', 0, 1],
    ])
    const levels = convertSegLevelsToWholeSlices([[pending], [measured]])
    const result = resolveLevelCoords(
      levels,
      new Map([[measured.key, 5]]),
      10,
    )

    expect(result.isSettled).toBe(false)
    expect(result.excludedSlices).toEqual([])
    // The placement structure re-levels around the pending slice.
    expect(result.placementSliceLevels.map(projectSlices)).toEqual([
      [['measured', 0, 1]],
    ])
    expect(result.sliceCoords.get(measured.key)).toBe(0)
  })

  it('uses coordinate tolerance without relaxing lateral intersections', () => {
    const [source] = segs([['source', 0, 2]])
    const whole = convertSegsToWholeSlices([source])[0]
    const slightlyOver = 10 + GEOMETRY_TOLERANCE / 2
    const resolved = resolveLevelCoords(
      [[whole]],
      new Map([[getSliceKey(whole), slightlyOver]]),
      10,
    )
    expect(resolved.placementSliceLevels[0]).toEqual([whole])

    expect(groupLaterallyIntersecting([
      { ...whole, end: 1 },
      { ...whole, start: 1 },
    ])).toHaveLength(2)
  })

  it('accepts a fully measured, in-band pixel candidate wholesale', () => {
    const sources = segs([
      ['a', 0, 1],
      ['b', 0, 1],
      ['c', 0, 1],
    ])
    const layout = buildPixelLimitedLayout(
      sources,
      false,
      false,
      new Map(sources.map((source) => [source.key, 10])),
      25,
      3,
      5,
    )

    // c's bottom would reach 30; it hides, and the survivors' bottoms of 10
    // and 20 both respect the reserved link band of 25 - 5 = 20.
    expect(coordOf(layout, 'a:0')).toBe(0)
    expect(coordOf(layout, 'b:0')).toBe(10)
    expect(coordOf(layout, 'c:0')).toBe(undefined)
    expect(layout.renderSlices.map(getSliceKey)).toEqual(['a:0', 'b:0', 'c:0'])
    expect(hiddenGroupsOf(layout)).toHaveLength(1)
    expect(hiddenGroupsOf(layout)[0].hiddenSlices.map((slice) => slice.sourceSeg.id))
      .toEqual(['c'])
  })

  it('evicts whole slices intruding into the link band via the safe closure', () => {
    const sources = segs([
      ['a', 0, 1],
      ['b', 0, 1],
      ['c', 0, 1],
      ['d', 0, 1],
    ])
    const layout = buildPixelLimitedLayout(
      sources,
      false,
      false,
      new Map(sources.map((source) => [source.key, 10])),
      30,
      4,
      15,
    )

    // All four fit 30 except d (bottom 40). d's link reserves the band below
    // 30 - 15 = 15, so b (bottom 20) and c (bottom 30) are consumed too.
    expect(coordOf(layout, 'a:0')).toBe(0)
    expect(coordOf(layout, 'b:0')).toBe(undefined)
    expect(coordOf(layout, 'c:0')).toBe(undefined)
    expect(coordOf(layout, 'd:0')).toBe(undefined)
    // Consumed wholes stay mounted as invisible measurement donors.
    expect(layout.renderSlices.map(getSliceKey)).toEqual([
      'a:0', 'b:0', 'c:0', 'd:0',
    ])
    expect(hiddenGroupsOf(layout)[0].hiddenSlices.map((slice) => slice.sourceSeg.id))
      .toEqual(['b', 'c', 'd'])
  })

  it('mounts candidate partials while the deepest occupant pays the link tax', () => {
    const sources = segs([
      ['base', 1, 2],
      ['extra', 0, 3],
    ])
    const [base] = sources
    const wholeHeights = new Map([[base.key, 10]])

    // extra never fit the one-level frontier, so its candidate fragments
    // mount invisibly for measurement. Its hidden middle reserves the only
    // occupied level for the link, consuming base by deliberate policy.
    const awaiting = buildPixelLimitedLayout(
      sources,
      false,
      true,
      wholeHeights,
      20,
      1,
      5,
    )
    expect(awaiting.renderSlices.map(getSliceKey)).toEqual([
      'base:1',
      'extra:0:0:slice',
      'extra:0:2:slice',
    ])
    expect(coordOf(awaiting, 'extra:0:0:slice')).toBe(undefined)
    expect(unmeasuredKeys(awaiting, wholeHeights)).toEqual([
      'extra:0:0:slice',
      'extra:0:2:slice',
    ])
    expect(awaiting.isSettled).toBe(false)
    expect(hiddenGroupsOf(awaiting)[0].hiddenSlices.map(projectSlice)).toEqual([
      ['base', 1, 2],
      ['extra', 1, 2],
    ])

    // With both fragment measurements in hand, the fragments become visible;
    // base remains an invisible donor and a member of the link group.
    const accepted = buildPixelLimitedLayout(
      sources,
      false,
      true,
      new Map([
        [base.key, 10],
        ['extra:0:0:slice', 10],
        ['extra:0:2:slice', 10],
      ]),
      20,
      1,
      5,
    )
    expect(coordOf(accepted, 'extra:0:0:slice')).toBe(0)
    expect(coordOf(accepted, 'extra:0:2:slice')).toBe(0)
    expect(coordOf(accepted, 'base:1')).toBe(undefined)
    expect(accepted.isSettled).toBe(true)
    expect(hiddenGroupsOf(accepted)[0].hiddenSlices.map(projectSlice)).toEqual([
      ['base', 1, 2],
      ['extra', 1, 2],
    ])
    expect(hiddenGroupsOf(accepted)[0].hiddenSlices[1]).toMatchObject({
      isStart: false,
      isEnd: false,
    })
  })

  it('keeps unmeasured frontier wholes as donors outside the hidden stream', () => {
    const sources = segs([
      ['measured', 0, 1],
      ['pending', 0, 1],
    ])
    const [measured] = sources
    const heights = new Map([[measured.key, 10]])
    const layout = buildPixelLimitedLayout(
      sources,
      false,
      false,
      heights,
      25,
      2,
      5,
    )

    expect(coordOf(layout, 'measured:0')).toBe(0)
    expect(coordOf(layout, 'pending:0')).toBe(undefined)
    expect(layout.renderSlices.map(getSliceKey)).toEqual([
      'measured:0',
      'pending:0',
    ])
    expect(unmeasuredKeys(layout, heights)).toEqual(['pending:0'])
    expect(layout.isSettled).toBe(false)
    // A pending whole's fate is undetermined: it must not grow any more link.
    expect(hiddenGroupsOf(layout)).toEqual([])
  })

  it('merges hull groups per source event in event order', () => {
    const [first, second, bridge] = convertSegsToWholeSlices(segs([
      ['first', 0, 1],
      ['second', 2, 3],
      ['bridge', 0.5, 2.5],
    ]))
    const groups = groupLaterallyIntersecting([first, second, bridge])
    expect(groups).toHaveLength(1)
    expect(groups[0]).toMatchObject({ start: 0, end: 3 })
    expect(groups[0].key).toBe(getSliceKey(first))
    expect(groups[0].hiddenSlices.map((slice) => slice.sourceSeg.id))
      .toEqual(['first', 'second', 'bridge'])

    // Disconnected fragments of one source stay in separate groups: exact
    // adjacency never merges.
    const [wide, bridger] = convertSegsToWholeSlices(segs([
      ['wide', 0, 4],
      ['bridger', 0.5, 2.5],
    ]))
    expect(groupLaterallyIntersecting([
      { ...wide, end: 1, isEnd: false },
      { ...wide, start: 3, isStart: false },
    ])).toHaveLength(2)

    // When another slice connects two fragments of one source into one group,
    // that source's entries collapse into their lateral hull, with start/end
    // continuity derived from the source's real boundaries.
    const bridged = groupLaterallyIntersecting([
      { ...wide, end: 1, isEnd: false },
      { ...wide, start: 2, end: 3, isStart: false, isEnd: false },
      bridger,
    ])
    expect(bridged).toHaveLength(1)
    expect(projectSlices(bridged[0].hiddenSlices)).toEqual([
      ['wide', 0, 3],
      ['bridger', 0.5, 2.5],
    ])
    expect(bridged[0].hiddenSlices[0]).toMatchObject({
      isStart: true,
      isEnd: false,
    })
  })

  it('widens taxed link coverage through bottom-level consumption', () => {
    const [base, extra] = segs([
      ['base', 0, 3],
      ['extra', 1, 2],
    ])
    const placement = placeExtraSlicesInLevels(
      convertSegLevelsToWholeSlices([[base]]),
      convertSegsToWholeSlices([extra]),
      false,
      false,
      1,
    )
    expect(hiddenGroupsOf(placement)[0]).toMatchObject({ start: 0, end: 3 })
    expect(hiddenGroupsOf(placement)[0].hiddenSlices.map((slice) => slice.sourceSeg.id))
      .toEqual(['base', 'extra'])
    auditCoverage([base, extra], placement.sliceLevels, placement.hiddenSlices)
  })

  it('derives whole keys from the source and partial keys from the slice start', () => {
    const [source] = segs([['event', 2, 5]])
    const whole = convertSegsToWholeSlices([source])[0]
    const shifted = { ...whole, start: 3, isStart: false }
    const narrowed = { ...whole, end: 4, isEnd: false }

    expect(getSliceKey(whole)).toBe('event:2')
    expect(getSliceKey(shifted)).toBe('event:2:3:slice')
    // An end-only re-cut keeps its key, and with it its DOM wrapper.
    expect(getSliceKey(narrowed)).toBe('event:2:2:slice')
  })

  it('respects strict event order when repacking extras', () => {
    // late (order 2) may not sit above early (order 0) where they intersect.
    const [early, unrelated, late] = segs([
      ['early', 0, 2],
      ['unrelated', 2, 3],
      ['late', 0, 2],
    ])
    const looseLevels = convertSegLevelsToWholeSlices([
      [unrelated],
      [early],
    ])
    const loose = placeExtraSlicesInLevels(
      looseLevels,
      convertSegsToWholeSlices([late]),
      false,
      false,
      0,
    )
    expect(projectSlices(loose.sliceLevels[0])).toEqual([
      ['late', 0, 2],
      ['unrelated', 2, 3],
    ])

    const strictLevels = convertSegLevelsToWholeSlices([
      [unrelated],
      [early],
    ])
    const strict = placeExtraSlicesInLevels(
      strictLevels,
      convertSegsToWholeSlices([late]),
      true,
      false,
      0,
    )
    expect(projectSlices(strict.sliceLevels[0])).toEqual([
      ['unrelated', 2, 3],
    ])
    expect(projectSlices(hiddenGroupsOf(strict)[0].hiddenSlices)).toEqual([
      ['late', 0, 2],
    ])
  })
})

function segs(
  specs: readonly (readonly [string, number, number])[],
): TestSeg[] {
  return specs.map(([id, start, end], orderIndex) => ({
    key: `${id}:${start}`,
    id,
    start,
    end,
    isStart: true,
    isEnd: true,
    orderIndex,
  }))
}

function projectSegLevels(levels: readonly (readonly TestSeg[])[]) {
  return levels.map((level) => level.map((seg) => seg.id))
}

function projectSlice(slice: Slice<TestSeg>) {
  return [slice.sourceSeg.id, slice.start, slice.end]
}

function projectSlices(slices: readonly Slice<TestSeg>[]) {
  return slices.map(projectSlice)
}

function hiddenGroupsOf(
  result: { hiddenSlices: readonly Slice<TestSeg>[] },
): HiddenSliceGroup<TestSeg>[] {
  return groupLaterallyIntersecting(result.hiddenSlices)
}

function coordOf(
  layout: { sliceCoords: ReadonlyMap<string, number> },
  key: string,
): number | undefined {
  return layout.sliceCoords.get(key)
}

/** Mounted-but-unmeasured donors, derived the way any caller can derive them. */
function unmeasuredKeys(
  layout: { renderSlices: Slice<TestSeg>[] },
  heights: ReadonlyMap<string, number>,
): string[] {
  return layout.renderSlices
    .map(getSliceKey)
    .filter((key) => !heights.has(key))
}

/**
 * Audits exact hidden coverage using the flat hidden list, not the hull-merged
 * groups: every source must be perfectly partitioned into visible and hidden
 * fragments carrying correct continuity flags.
 */
function auditCoverage(
  sources: readonly TestSeg[],
  levels: readonly (readonly Slice<TestSeg>[])[],
  hiddenSlices: readonly Slice<TestSeg>[],
): void {
  const pieces = levels.flat().concat(hiddenSlices)

  for (const source of sources) {
    const sourcePieces = pieces
      .filter((piece) => piece.sourceSeg === source)
      .sort((a, b) => a.start - b.start || a.end - b.end)
    let cursor = source.start
    for (const piece of sourcePieces) {
      expect(piece.start).toBe(cursor)
      expect(piece.end).toBeGreaterThan(piece.start)
      expect(piece.isStart).toBe(source.isStart && piece.start === source.start)
      expect(piece.isEnd).toBe(source.isEnd && piece.end === source.end)
      cursor = piece.end
    }
    expect(cursor).toBe(source.end)
  }
}
