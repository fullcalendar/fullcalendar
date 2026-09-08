import { describe, expect, it } from 'vitest'
import {
  type Slice,
  type SourceSeg,
  convertSegsToWholeSlices,
  groupLaterallyIntersecting,
  sortByEventOrder,
} from '../../src/seg-placement/kernel'
import {
  DEFAULT_PRINT_MAX_LEVELS,
  buildPrintEventBands,
  buildPrintMoreLinkBand,
  planPrintDomCandidates,
} from '../../src/seg-placement/print'

type TestSeg = SourceSeg & { id: string }
type UnorderedSeg = Omit<TestSeg, 'orderIndex'>

function stampEventOrder(
  orderedSegs: readonly UnorderedSeg[],
): TestSeg[] {
  return orderedSegs.map((seg, orderIndex) => ({ ...seg, orderIndex }))
}

describe('print event bands', () => {
  it('uses measured thicknesses and the 20px fallback within one level', () => {
    const plan = planPrintDomCandidates(stampEventOrder([
      seg('measured', 0, 1),
      seg('fallback', 1, 2),
    ]), false, false)
    const bands = buildPrintEventBands(
      plan.sliceLevels,
      new Map([['measured', 12]]),
    )

    expect(bands).toHaveLength(1)
    expect(bands[0].slices.map((slice) => slice.sourceSeg.key)).toEqual([
      'measured',
      'fallback',
    ])
    expect(bands[0].thickness).toBe(20)
  })

  it('uses the maximum slice thickness and follows both growth and shrinkage', () => {
    const plan = planPrintDomCandidates(stampEventOrder([
      seg('a', 0, 1),
      seg('b', 1, 2),
      seg('c', 2, 3),
    ]), false, false)

    expect(buildPrintEventBands(
      plan.sliceLevels,
      new Map([['a', 8], ['b', 9], ['c', 7]]),
    )[0].thickness).toBe(9)
    expect(buildPrintEventBands(
      plan.sliceLevels,
      new Map([['a', 12], ['b', 30], ['c', 18]]),
    )[0].thickness).toBe(30)
    expect(buildPrintEventBands(
      plan.sliceLevels,
      new Map([['a', 6], ['b', 8], ['c', 7]]),
    )[0].thickness).toBe(8)
  })

  it('resolves measurements with each adapter\'s slice key', () => {
    const whole = convertSegsToWholeSlices(stampEventOrder([
      seg('split', 0, 3),
    ]))[0]
    const left = { ...whole, end: 1 }
    const right = { ...whole, start: 1 }
    const bands = buildPrintEventBands(
      [[left], [right]],
      new Map([['0:1', 8], ['1:3', 30]]),
      (slice) => `${slice.start}:${slice.end}`,
    )

    expect(bands.map((band) => band.thickness)).toEqual([8, 30])
  })

  it('omits empty and sparse levels while preserving source level indices', () => {
    const sourceLevel = planPrintDomCandidates(
      stampEventOrder([seg('only', 0, 1)]),
      false,
      false,
    ).sliceLevels[0]
    const levels: Slice<TestSeg>[][] = []
    levels[0] = []
    levels[2] = sourceLevel

    const bands = buildPrintEventBands(levels, new Map())

    expect(bands).toHaveLength(1)
    expect(bands[0]).toMatchObject({ levelIndex: 2, thickness: 20 })
    expect(bands[0].slices[0].sourceSeg.key).toBe('only')
  })
})

describe('print DOM planning', () => {
  it('applies the default 200-level safety cap to the complete source list', () => {
    const segs = stampEventOrder(Array.from(
      { length: DEFAULT_PRINT_MAX_LEVELS + 5 },
      (_, index) => seg(String(index), 0, 1),
    ))
    const plan = planPrintDomCandidates(segs, false, false)
    const visibleSlices = plan.sliceLevels.flat()
    const hiddenSlices = sortByEventOrder(plan.hiddenSlices)

    expect(plan.sliceLevels).toHaveLength(DEFAULT_PRINT_MAX_LEVELS)
    expect(visibleSlices).toHaveLength(DEFAULT_PRINT_MAX_LEVELS)
    expect(hiddenSlices).toHaveLength(5)
    expect(new Set(visibleSlices.map((item) => item.sourceSeg.key))).toEqual(
      new Set(segs.slice(0, DEFAULT_PRINT_MAX_LEVELS).map((item) => item.key)),
    )
    expect(visibleSlices.map((item) => item.sourceSeg.key)).toEqual(
      segs.slice(0, DEFAULT_PRINT_MAX_LEVELS).map((item) => item.key),
    )
    expect(hiddenSlices.map((item) => item.sourceSeg.key)).toEqual(
      segs.slice(DEFAULT_PRINT_MAX_LEVELS).map((item) => item.key),
    )
  })
})

describe('Timeline print more-link band', () => {
  it('returns null without hidden groups', () => {
    expect(buildPrintMoreLinkBand([], new Map())).toBeNull()
  })

  it('uses fallback and measured maxima and allows the band to shrink', () => {
    const hiddenSlices = convertSegsToWholeSlices(stampEventOrder([
      seg('left-hidden', 0, 1),
      seg('right-hidden', 2, 3),
    ]))
    const groups = groupLaterallyIntersecting(hiddenSlices)

    expect(buildPrintMoreLinkBand(
      groups,
      new Map([[groups[0].key, 12]]),
    )?.thickness).toBe(20)
    expect(buildPrintMoreLinkBand(
      groups,
      new Map(groups.map((group, index) => [
        group.key,
        28 + index * 4,
      ] as const)),
    )?.thickness).toBe(32)
    expect(buildPrintMoreLinkBand(
      groups,
      new Map(groups.map((group, index) => [
        group.key,
        8 + index,
      ] as const)),
    )?.thickness).toBe(9)
  })

  it('adds a final link band without consuming a capped event level', () => {
    const slices = convertSegsToWholeSlices(stampEventOrder([
      seg('visible-a', 0, 1),
      seg('visible-b', 0, 1),
      seg('hidden', 0, 1),
    ]))
    const eventBands = buildPrintEventBands([[slices[0]], [slices[1]]], new Map())
    const groups = groupLaterallyIntersecting([slices[2]])
    const moreLinkBand = buildPrintMoreLinkBand(groups, new Map())

    expect(eventBands).toHaveLength(2)
    expect(groups).toHaveLength(1)
    expect(moreLinkBand).toMatchObject({ thickness: 20, moreLinkGroups: groups })
  })
})

function seg(
  id: string,
  start: number,
  end: number,
): UnorderedSeg {
  return {
    key: id,
    id,
    start,
    end,
    isStart: true,
    isEnd: true,
  }
}
