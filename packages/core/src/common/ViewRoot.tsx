import { ViewSpec } from '../structs/view-spec'
import { MountHook, buildHookClassNameGenerator } from './render-hook'
import { ComponentChildren, h, Ref } from '../vdom'
import ComponentContext from '../component/ComponentContext'
import { BaseComponent } from '../vdom-util'


export interface ViewRootProps {
  viewSpec: ViewSpec
  children: (rootElRef: Ref<any>, classNames: string[]) => ComponentChildren
  elRef?: Ref<any>
}


export class ViewRoot extends BaseComponent<ViewRootProps> {

  buildClassNames = buildHookClassNameGenerator('view')


  render(props: ViewRootProps, state: {}, context: ComponentContext) {
    let hookProps = { view: context.view }
    let customClassNames = this.buildClassNames(context.options, hookProps)

    return (
      <MountHook name='view' hookProps={hookProps} elRef={props.elRef}>
        {(rootElRef) => props.children(
          rootElRef,
          [ `fc-${props.viewSpec.type}-view`, 'fc-view' ].concat(customClassNames)
        )}
      </MountHook>
    )
  }

}
