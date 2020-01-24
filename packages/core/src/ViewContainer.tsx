import { BaseComponent } from './vdom-util'
import { ComponentChildren, Ref, h } from './vdom'
import { CssDimValue } from './scrollgrid/util'


export interface ViewContainerProps {
  height?: CssDimValue
  aspectRatio?: number
  onClick?: (ev: Event) => void
  elRef?: Ref<HTMLDivElement>
  children?: ComponentChildren
}


// TODO: do function component?
export default class ViewContainer extends BaseComponent<ViewContainerProps> {

  render(props: ViewContainerProps) {
    let classNames = [ 'fc-view-container' ]
    let height: CssDimValue = ''
    let paddingBottom: CssDimValue = ''

    if (props.height) { // TODO: better test
      height = props.height
    } else {
      classNames.push('fc-view-container--aspectratio')
      paddingBottom = (1 / props.aspectRatio) * 100 + '%'
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
