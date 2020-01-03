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


// TODO: shouldn't the the fc-view be the inner container???
// TODO: do function component?
// TODO: use classnames instead of css props
export default class ViewContainer extends BaseComponent<ViewContainerProps> {

  render(props: ViewContainerProps) {
    if (props.height != null) {
      return (
        <div class='fc-view-container' style={{ height: props.height }} ref={props.elRef} onClick={props.onClick}>
          {props.children}
        </div>
      )
    } else {
      return (
        <div class='fc-view-container' style={{ paddingBottom: (props.aspectRatio * 100 + '%'), position: 'relative' }} >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            {props.children}
          </div>
        </div>
      )
    }
  }

}
