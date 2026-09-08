import { describe, expect, it } from 'vitest'
import {
  type DayGridEventSeg,
  buildDayGridPopoverSegs,
} from '../../src/daygrid/seg-placement-adapter'
import {
  buildDayGridPrintColumns,
  buildDayGridPrintPlan,
  getDayGridPrintSliceKey,
} from '../../src/daygrid/print-adapter'
import { DEFAULT_PRINT_MAX_LEVELS } from '../../src/seg-placement/print'

describe('DayGrid print planning', () => {
  it('plans from every source and rebuilds never-mounted sources as complete hidden slices', () => {
    const segs = Array.from(
      { length: DEFAULT_PRINT_MAX_LEVELS + 2 },
      (_, index) => makeSeg(`event-${index}`, 0, 1),
    )
    const plan = buildDayGridPrintPlan(segs, false, true, 2)
    const visibleSlices = plan.sliceLevels.flat()
    const { hiddenSlices } = plan

    expect(plan.sourceSegs).toHaveLength(DEFAULT_PRINT_MAX_LEVELS + 2)
    expect(new Set(visibleSlices.map((slice) => slice.sourceSeg.key)))
      .toHaveLength(DEFAULT_PRINT_MAX_LEVELS)
    expect(hiddenSlices).toHaveLength(2)
    expect(hiddenSlices.map((slice) => slice.sourceSeg.key)).toEqual([
      `event-${DEFAULT_PRINT_MAX_LEVELS}:0`,
      `event-${DEFAULT_PRINT_MAX_LEVELS + 1}:0`,
    ])
    expect(hiddenSlices).toMatchObject([
      { start: 0, end: 1 },
      { start: 0, end: 1 },
    ])
    expect(hiddenCountsByColumn(plan)).toEqual([2, 0])
  })

  it('counts distinct hidden sources in intersected columns but not adjacent columns', () => {
    const blockers = Array.from(
      { length: DEFAULT_PRINT_MAX_LEVELS },
      (_, index) => makeSeg(`blocker-${index}`, 0, 3),
    )
    const plan = buildDayGridPrintPlan([
      ...blockers,
      makeSeg('left-hidden', 0, 2),
      makeSeg('right-hidden', 1, 3),
    ], false, true, 3)

    expect(hiddenCountsByColumn(plan)).toEqual([1, 2, 1])
    expect(buildDayGridPopoverSegs(
      plan.sourceSegs,
      plan.hiddenSlices,
      0,
    ).hiddenSegs.map(segId))
      .toEqual(['left-hidden'])
    expect(buildDayGridPopoverSegs(
      plan.sourceSegs,
      plan.hiddenSlices,
      1,
    ).hiddenSegs.map(segId))
      .toEqual(['left-hidden', 'right-hidden'])
    expect(buildDayGridPopoverSegs(
      plan.sourceSegs,
      plan.hiddenSlices,
      2,
    ).hiddenSegs.map(segId))
      .toEqual(['right-hidden'])
  })

  it('retains visible pieces and only the covered hidden column when slicing is enabled', () => {
    const blockers = Array.from(
      { length: DEFAULT_PRINT_MAX_LEVELS },
      (_, index) => makeSeg(`blocker-${index}`, 1, 2),
    )
    const wide = makeSeg('wide', 0, 3)
    const sliced = buildDayGridPrintPlan([...blockers, wide], false, true, 3)
    const unsliced = buildDayGridPrintPlan([...blockers, wide], false, false, 3)
    const slicedVisible = sliced.sliceLevels.flat()
    const unslicedVisible = unsliced.sliceLevels.flat()
    const slicedHidden = sliced.hiddenSlices
    const unslicedHidden = unsliced.hiddenSlices

    expect(slicedVisible.some((slice) => slice.sourceSeg.key === 'wide:0'))
      .toBe(true)
    expect(slicedVisible.filter((slice) =>
      slice.sourceSeg.key === 'wide:0',
    ).map(({ start, end }) => [start, end])).toEqual([[0, 1], [2, 3]])
    expect(slicedHidden.filter((slice) =>
      slice.sourceSeg.key === 'wide:0',
    ).map(({ start, end }) => [start, end])).toEqual([[1, 2]])
    expect(hiddenCountsByColumn(sliced)).toEqual([0, 1, 0])

    expect(unslicedVisible.some((slice) => slice.sourceSeg.key === 'wide:0'))
      .toBe(false)
    expect(unslicedHidden[unslicedHidden.length - 1]).toMatchObject({
      start: 0,
      end: 3,
      sourceSeg: { key: 'wide:0' },
    })
    expect(hiddenCountsByColumn(unsliced)).toEqual([1, 1, 1])
  })
})

describe('DayGrid print band transposition', () => {
  const plan = buildDayGridPrintPlan([
    makeSeg('wide', 0, 2),
    makeSeg('right', 2, 3),
    makeSeg('left-later', 0, 1),
  ], false, true, 3)

  it('gives every column the same slots, including empty ones', () => {
    const columns = buildDayGridPrintColumns(plan, new Map([
      ['wide:0:0:2', 12],
      ['left-later:0:0:1', 7],
    ]))
    const signatures = columns.map((column) => column.map((slot) => ({
      levelIndex: slot.levelIndex,
      thickness: slot.thickness,
    })))

    expect(signatures[1]).toEqual(signatures[0])
    expect(signatures[2]).toEqual(signatures[0])
    expect(signatures[0]).toEqual([
      { levelIndex: 0, thickness: 20 },
      { levelIndex: 1, thickness: 7 },
    ])
    expect(columns[1].every((slot) => slot.slice === null)).toBe(true)
    expect(columns[2][1].slice).toBeNull()
  })

  it('renders a multi-column slice once in its start column while preserving its span', () => {
    const columns = buildDayGridPrintColumns(plan, new Map())
    const wideSlices = columns.flatMap((column) =>
      column.flatMap((slot) =>
        slot.slice?.sourceSeg.key === 'wide:0' ? [slot.slice] : [],
      ),
    )

    expect(wideSlices).toHaveLength(1)
    expect(wideSlices[0]).toMatchObject({ start: 0, end: 2 })
    expect(columns[0][0].slice?.sourceSeg.key).toBe('wide:0')
    expect(columns[1][0].slice).toBeNull()
  })

  it('uses current measurements directly so bands can grow and shrink', () => {
    const sizes = (heights: [number, number, number]) =>
      buildDayGridPrintColumns(plan, new Map([
        ['wide:0:0:2', heights[0]],
        ['right:2:2:3', heights[1]],
        ['left-later:0:0:1', heights[2]],
      ]))[0].map((slot) => slot.thickness)

    expect(sizes([8, 9, 6])).toEqual([9, 6])
    expect(sizes([30, 18, 22])).toEqual([30, 22])
    expect(sizes([6, 8, 7])).toEqual([8, 7])
  })

  it('uses the tallest live slice measurement in a band and follows deletion', () => {
    const slicedPlan = buildDayGridPrintPlan([
      ...Array.from(
        { length: DEFAULT_PRINT_MAX_LEVELS },
        (_, index) => makeSeg(`blocker-${index}`, 1, 2),
      ),
      makeSeg('sliced', 0, 3),
    ], false, true, 3)
    const slices = slicedPlan.sliceLevels.flat().filter((slice) =>
      slice.sourceSeg.key === 'sliced:0',
    )
    const sliceHeights = new Map([
      [getDayGridPrintSliceKey(slices[0]), 22],
      [getDayGridPrintSliceKey(slices[1]), 28],
    ])
    const thickness = () => buildDayGridPrintColumns(
      slicedPlan,
      sliceHeights,
    ).flat().find((slot) =>
      slot.slice?.sourceSeg.key === 'sliced:0',
    )!.thickness

    expect(thickness()).toBe(28)
    sliceHeights.delete(getDayGridPrintSliceKey(slices[1]))
    expect(thickness()).toBe(22)
  })
})

function makeSeg(
  instanceId: string,
  start: number,
  end: number,
): DayGridEventSeg {
  return {
    start,
    end,
    isStart: true,
    isEnd: true,
    eventRange: {
      instance: { instanceId },
    },
  } as DayGridEventSeg
}

function segId(seg: DayGridEventSeg): string {
  return seg.eventRange.instance.instanceId
}

/** The per-column "+N more" counts as production derives them. */
function hiddenCountsByColumn(plan: ReturnType<typeof buildDayGridPrintPlan>): number[] {
  return Array.from(
    { length: plan.columnCount },
    (_, column) => buildDayGridPopoverSegs(
      plan.sourceSegs,
      plan.hiddenSlices,
      column,
    ).hiddenSegs.length,
  )
}
