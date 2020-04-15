import { BaseComponent } from './vdom-util'
import { ComponentChildren, Ref, h } from './vdom'
import { CssDimValue } from './scrollgrid/util'


export interface ViewContainerProps {
  liquid?: boolean
  height?: CssDimValue
  aspectRatio?: number
  onClick?: (ev: Event) => void
  elRef?: Ref<HTMLDivElement>
  children?: ComponentChildren
}


// TODO: do function component?
export class ViewContainer extends BaseComponent<ViewContainerProps> {

  render(props: ViewContainerProps) {
    let classNames = [
      'fc-view-harness',
      (props.aspectRatio || props.liquid || props.height)
        ? 'fc-view-harness-active' // harness controls the height
        : 'fc-view-harness-passive' // let the view do the height
    ]
    let height: CssDimValue = ''
    let paddingBottom: CssDimValue = ''

    if (props.aspectRatio) {
      paddingBottom = (1 / props.aspectRatio) * 100 + '%'
    } else {
      height = props.height || ''
    }

    return (
      <div
        ref={props.elRef}
        onClick={props.onClick}
        class={classNames.join(' ')} style={{ height, paddingBottom }}
      >{props.children}</div>
    )
  }

}
