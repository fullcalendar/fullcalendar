import classNames from '../../styles.module.css'

export interface TimeGridAxisEmptyProps {
  isLiquid: boolean
  width: number | undefined
}

export function TimeGridAxisEmpty(props: TimeGridAxisEmptyProps) {
  return (
    <div
      role='gridcell' // is empty so can't be rowheader/columnheader
      className={props.isLiquid ? classNames.liquid : classNames.contentBox}
      style={{ width: props.width }}
    />
  )
}
