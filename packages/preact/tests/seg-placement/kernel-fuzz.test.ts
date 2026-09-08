import { describe, it } from 'vitest'
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
  isPartialSlice,
  placeExtraSlicesInLevels,
} from '../../src/seg-placement/kernel'

type TestSeg = SourceSeg & { id: string }

describe('pure positioning kernel fuzzing', () => {
  it('preserves level, tax, order, and coverage invariants when repacking', () => {
    for (let seed = 1; seed <= 300; seed++) {
      const sources = buildScenario(seed)
      const maxLevels = 1 + seed % 3
      const strict = seed % 2 === 0
      const slicing = seed % 3 !== 0
      const tax = seed % 2
      const built = buildSegLevels(sources, strict, maxLevels)
      invariant(
        built.excludedSegs.every((seg, i) =>
          i === 0 ||
          built.excludedSegs[i - 1].orderIndex < seg.orderIndex,
        ),
        'exclusions lost source order',
        String(seed),
      )

      const placement = placeExtraSlicesInLevels(
        convertSegLevelsToWholeSlices(built.segLevels),
        convertSegsToWholeSlices(built.excludedSegs),
        strict,
        slicing,
        tax,
      )
      const label = JSON.stringify({ seed, maxLevels, strict, slicing, tax })
      const hiddenGroups = groupLaterallyIntersecting(placement.hiddenSlices)
      auditLevels(placement.sliceLevels, strict, label)
      auditGroups(hiddenGroups, label)
      auditCoverage(sources, placement.sliceLevels, placement.hiddenSlices, label)

      if (tax && placement.sliceLevels.length) {
        const bottomLevel =
          placement.sliceLevels[placement.sliceLevels.length - 1]
        for (const slice of bottomLevel) {
          invariant(
            !hiddenGroups.some((group) => intersects(group, slice)),
            'bottom-level slice overlaps taxed link coverage',
            label,
          )
        }
      }
    }
  })

  it('keeps fully measured pixel layouts in budget and out of the link band', () => {
    for (let seed = 1; seed <= 250; seed++) {
      const sources = buildScenario(seed)
      const random = createRandom(seed * 65_537)
      const heights = buildAllSliceHeights(sources, random)
      const maxPixels = 12 + random() * 30
      const moreLinkHeight = 3 + random() * 6
      const frontier = 1 + seed % 5
      const strict = seed % 2 === 0
      const slicing = seed % 3 !== 0
      const layout = buildPixelLimitedLayout(
        sources,
        strict,
        slicing,
        heights,
        maxPixels,
        frontier,
        moreLinkHeight,
      )
      const label = JSON.stringify({ seed, maxPixels, moreLinkHeight, frontier, strict, slicing })

      auditGroups(groupLaterallyIntersecting(layout.hiddenSlices), label)
      auditPixelPlacement(layout, heights, maxPixels, moreLinkHeight, label)
      auditAccountability(sources, layout, label)
      auditRenderSet(layout, heights, label)

      const rerun = buildPixelLimitedLayout(
        sources,
        strict,
        slicing,
        heights,
        maxPixels,
        frontier,
        moreLinkHeight,
      )
      invariant(
        projectLayout(rerun) === projectLayout(layout),
        'pixel layout is not deterministic',
        label,
      )
    }
  })

  it('holds pixel invariants under partial measurement', () => {
    for (let seed = 1; seed <= 250; seed++) {
      const sources = buildScenario(seed)
      const random = createRandom(seed * 92_821)
      const allHeights = buildAllSliceHeights(sources, random)
      const heights = new Map<string, number>()
      for (const [key, height] of allHeights) {
        if (random() < 0.7) {
          heights.set(key, height)
        }
      }
      const maxPixels = 12 + random() * 30
      const moreLinkHeight = 3 + random() * 6
      const strict = seed % 2 === 0
      const frontier = 1 + seed % 5
      const layout = buildPixelLimitedLayout(
        sources,
        strict,
        seed % 3 !== 0,
        heights,
        maxPixels,
        frontier,
        moreLinkHeight,
      )
      const frontierKeys = new Set(
        buildSegLevels(sources, strict, frontier).segLevels.flat()
          .map((seg) => seg.key),
      )
      const label = JSON.stringify({ seed, maxPixels, moreLinkHeight })

      auditPixelPlacement(layout, heights, maxPixels, moreLinkHeight, label)
      auditGroups(groupLaterallyIntersecting(layout.hiddenSlices), label)
      auditRenderSet(layout, heights, label)

      // A pending slice is a mounted slice without a measurement.
      for (const slice of layout.renderSlices) {
        const key = getSliceKey(slice)
        if (heights.has(key)) {
          continue
        }
        invariant(
          !layout.sliceCoords.has(key),
          'unmeasured slice received a coordinate',
          label,
        )
        // An unmeasured frontier whole has an undetermined fate: it must not
        // be represented by any more link. A beyond-frontier whole is
        // different: the candidate may mount it as a donor while the safe
        // plan legitimately keeps it hidden.
        if (!isPartialSlice(slice) && frontierKeys.has(key)) {
          invariant(
            !layout.hiddenSlices.some((hidden) =>
              hidden.sourceSeg === slice.sourceSeg,
            ),
            'pending whole leaked into a more link',
            label,
          )
        }
      }
    }
  })
})

function buildScenario(seed: number): TestSeg[] {
  const random = createRandom(seed)
  const count = 6 + Math.floor(random() * 18)
  return Array.from({ length: count }, (_, orderIndex) => {
    const start = Math.floor(random() * 7)
    const end = Math.min(7, start + 1 + Math.floor(random() * 4))
    const id = `${seed}:${orderIndex}`
    return {
      key: `${id}:${start}`,
      id,
      start,
      end,
      isStart: true,
      isEnd: true,
      orderIndex,
    }
  })
}

/** Random heights for every whole and every integer-started fragment key. */
function buildAllSliceHeights(
  sources: readonly TestSeg[],
  random: () => number,
): Map<string, number> {
  const heights = new Map<string, number>()
  for (const source of sources) {
    heights.set(source.key, 5 + random() * 10)
    for (let start = source.start; start < source.end; start += 1) {
      heights.set(`${source.key}:${start}:slice`, 5 + random() * 10)
    }
  }
  return heights
}

function auditLevels(
  levels: readonly (readonly Slice<TestSeg>[])[],
  strict: boolean,
  label: string,
): void {
  levels.forEach((level, levelIndex) => {
    for (let i = 1; i < level.length; i++) {
      invariant(
        level[i - 1].end <= level[i].start,
        `level ${levelIndex} overlaps laterally`,
        label,
      )
    }
  })

  if (strict) {
    const entries = levels.flatMap((level, levelIndex) =>
      level.map((slice) => ({ slice, levelIndex })),
    )
    for (const left of entries) {
      for (const right of entries) {
        if (
          left.slice.sourceSeg !== right.slice.sourceSeg &&
          left.slice.sourceSeg.orderIndex < right.slice.sourceSeg.orderIndex &&
          intersects(left.slice, right.slice)
        ) {
          invariant(
            left.levelIndex < right.levelIndex,
            'strict event order inverted',
            label,
          )
        }
      }
    }
  }
}

function auditGroups(
  groups: readonly HiddenSliceGroup<TestSeg>[],
  label: string,
): void {
  for (let left = 0; left < groups.length; left++) {
    for (let right = left + 1; right < groups.length; right++) {
      invariant(
        !intersects(groups[left], groups[right]),
        'hidden groups intersect each other',
        label,
      )
    }
  }

  for (const group of groups) {
    invariant(group.hiddenSlices.length > 0, 'empty hidden group', label)
    invariant(
      group.key === getSliceKey(group.hiddenSlices[0]),
      'group key does not match its first slice',
      label,
    )
    const seenSources = new Set<TestSeg>()
    let previousOrder = -1
    for (const slice of group.hiddenSlices) {
      invariant(
        !seenSources.has(slice.sourceSeg),
        'group lists one source twice despite hull merging',
        label,
      )
      seenSources.add(slice.sourceSeg)
      invariant(
        slice.sourceSeg.orderIndex >= previousOrder,
        'group members out of event order',
        label,
      )
      previousOrder = slice.sourceSeg.orderIndex
      invariant(
        slice.start >= group.start && slice.end <= group.end,
        'group member escapes the group span',
        label,
      )
      invariant(
        slice.isStart ===
          (slice.sourceSeg.isStart && slice.start === slice.sourceSeg.start) &&
        slice.isEnd ===
          (slice.sourceSeg.isEnd && slice.end === slice.sourceSeg.end),
        'group member carries bad continuity flags',
        label,
      )
    }
  }
}

/** A mounted slice is visible exactly when its key holds a coordinate. */
function visibleSlices(
  layout: {
    renderSlices: Slice<TestSeg>[]
    sliceCoords: ReadonlyMap<string, number>
  },
): Slice<TestSeg>[] {
  return layout.renderSlices.filter((slice) =>
    layout.sliceCoords.has(getSliceKey(slice)),
  )
}

/**
 * Every visible bottom respects the budget, those under links respect the
 * band, and no two visible slices paint over each other.
 */
function auditPixelPlacement(
  layout: {
    renderSlices: Slice<TestSeg>[]
    hiddenSlices: Slice<TestSeg>[]
    sliceCoords: ReadonlyMap<string, number>
  },
  heights: ReadonlyMap<string, number>,
  maxPixels: number,
  moreLinkHeight: number,
  label: string,
): void {
  const moreLinkEventMax = Math.max(0, maxPixels - moreLinkHeight)
  const visible = visibleSlices(layout)
  const hiddenGroups = groupLaterallyIntersecting(layout.hiddenSlices)

  for (const slice of visible) {
    const key = getSliceKey(slice)
    const coord = layout.sliceCoords.get(key)!
    const height = heights.get(key)
    invariant(height !== undefined, `${key} placed without a measurement`, label)
    invariant(
      coord + height! <= maxPixels + GEOMETRY_TOLERANCE,
      `${key} broke the pixel budget`,
      label,
    )
    if (hiddenGroups.some((group) => intersects(group, slice))) {
      invariant(
        coord + height! <= moreLinkEventMax + GEOMETRY_TOLERANCE,
        `${key} intrudes into the reserved link band`,
        label,
      )
    }
  }

  for (const left of visible) {
    for (const right of visible) {
      if (left === right || !intersects(left, right)) {
        continue
      }
      const leftTop = layout.sliceCoords.get(getSliceKey(left))!
      const leftBottom = leftTop + heights.get(getSliceKey(left))!
      const rightTop = layout.sliceCoords.get(getSliceKey(right))!
      const rightBottom = rightTop + heights.get(getSliceKey(right))!
      invariant(
        leftBottom <= rightTop + GEOMETRY_TOLERANCE ||
        rightBottom <= leftTop + GEOMETRY_TOLERANCE,
        'visible slices paint over each other',
        label,
      )
    }
  }
}

/** Every source is visible, hidden behind a link, or both. */
function auditAccountability(
  sources: readonly TestSeg[],
  layout: {
    renderSlices: Slice<TestSeg>[]
    hiddenSlices: Slice<TestSeg>[]
    sliceCoords: ReadonlyMap<string, number>
  },
  label: string,
): void {
  const accounted = new Set<TestSeg>()
  for (const slice of visibleSlices(layout)) {
    accounted.add(slice.sourceSeg)
  }
  for (const slice of layout.hiddenSlices) {
    accounted.add(slice.sourceSeg)
  }

  for (const source of sources) {
    invariant(accounted.has(source), `${source.key} disappeared`, label)
  }
}

/** The mounted set must own every coordinate and define settledness. */
function auditRenderSet(
  layout: {
    renderSlices: Slice<TestSeg>[]
    sliceCoords: ReadonlyMap<string, number>
    isSettled: boolean
  },
  heights: ReadonlyMap<string, number>,
  label: string,
): void {
  const renderedKeys = new Set(layout.renderSlices.map(getSliceKey))
  invariant(
    renderedKeys.size === layout.renderSlices.length,
    'duplicate mounted slice keys',
    label,
  )

  for (const key of layout.sliceCoords.keys()) {
    invariant(renderedKeys.has(key), `coordinate ${key} has no mounted slice`, label)
  }

  const allMeasured = layout.renderSlices.every(
    (slice) => heights.has(getSliceKey(slice)),
  )
  invariant(
    layout.isSettled === allMeasured,
    'isSettled disagrees with render-slice measurement coverage',
    label,
  )
}

function projectLayout(
  layout: {
    renderSlices: Slice<TestSeg>[]
    sliceCoords: ReadonlyMap<string, number>
    hiddenSlices: Slice<TestSeg>[]
  },
): string {
  const hiddenGroups = groupLaterallyIntersecting(layout.hiddenSlices)

  return JSON.stringify({
    render: layout.renderSlices.map(getSliceKey),
    coords: [...layout.sliceCoords.entries()].sort(),
    hidden: hiddenGroups.map((group) => [
      group.start,
      group.end,
      group.hiddenSlices.map(getSliceKey),
    ]),
  })
}

function auditCoverage(
  sources: readonly TestSeg[],
  levels: readonly (readonly Slice<TestSeg>[])[],
  hiddenSlices: readonly Slice<TestSeg>[],
  label: string,
): void {
  const pieces = levels.flat().concat(hiddenSlices)
  for (const source of sources) {
    const sourcePieces = pieces
      .filter((piece) => piece.sourceSeg === source)
      .sort((a, b) => a.start - b.start || a.end - b.end)
    invariant(sourcePieces.length > 0, `${source.key} disappeared`, label)
    let cursor = source.start
    for (const piece of sourcePieces) {
      invariant(piece.start === cursor, `${source.key} has a gap or overlap`, label)
      invariant(piece.end > piece.start, `${source.key} has an empty piece`, label)
      invariant(
        piece.isStart === (source.isStart && piece.start === source.start),
        `${source.key} has a bad isStart flag`,
        label,
      )
      invariant(
        piece.isEnd === (source.isEnd && piece.end === source.end),
        `${source.key} has a bad isEnd flag`,
        label,
      )
      cursor = piece.end
    }
    invariant(cursor === source.end, `${source.key} has incomplete coverage`, label)
  }
}

function intersects(
  left: { start: number, end: number },
  right: { start: number, end: number },
): boolean {
  return left.start < right.end && right.start < left.end
}

function createRandom(seed: number): () => number {
  let state = seed
  return () => {
    state = (state * 1_664_525 + 1_013_904_223) >>> 0
    return state / 0x1_0000_0000
  }
}

function invariant(condition: boolean, message: string, label: string): void {
  if (!condition) {
    throw new Error(`${message}\n${label}`)
  }
}
