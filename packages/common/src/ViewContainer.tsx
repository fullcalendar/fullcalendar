import { BaseComponent } from './vdom-util'
import { ComponentChildren, Ref, createElement, VUIEvent } from './vdom'
import { CssDimValue } from './scrollgrid/util'


export interface ViewContainerProps {
  liquid?: boolean
  height?: CssDimValue
  aspectRatio?: number
  onClick?: (ev: VUIEvent) => void
  elRef?: Ref<HTMLDivElement>
  children?: ComponentChildren
}


// TODO: do function component?
export class ViewContainer extends BaseComponent<ViewContainerProps> {

  render() {
    let { props } = this
    let { aspectRatio } = props

    let classNames = [
      'fc-view-harness',
      (aspectRatio || props.liquid || props.height)
        ? 'fc-view-harness-active' // harness controls the height
        : 'fc-view-harness-passive' // let the view do the height
    ]
    let height: CssDimValue = ''
    let paddingBottom: CssDimValue = ''

    if (aspectRatio) {
      paddingBottom = (1 / aspectRatio) * 100 + '%'
    } else {
      height = props.height || ''
    }

    return (
      <div
        ref={props.elRef}
        onClick={props.onClick}
        className={classNames.join(' ')} style={{ height, paddingBottom }}
      >{props.children}</div>
    )
  }

}
