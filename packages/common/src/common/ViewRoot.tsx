import { ViewSpec } from '../structs/view-spec'
import { MountHook, buildClassNameNormalizer } from './render-hook'
import { ComponentChildren, h, Ref } from '../vdom'
import { BaseComponent } from '../vdom-util'
import { ViewApi } from '../ViewApi'


export interface ViewRootProps {
  viewSpec: ViewSpec
  children: (rootElRef: Ref<any>, classNames: string[]) => ComponentChildren
  elRef?: Ref<any>
}

export interface ViewRootHookProps {
  view: ViewApi
}


export class ViewRoot extends BaseComponent<ViewRootProps> {

  normalizeClassNames = buildClassNameNormalizer<ViewRootHookProps>()


  render() {
    let { props, context } = this
    let { options } = context
    let hookProps: ViewRootHookProps = { view: context.viewApi }
    let customClassNames = this.normalizeClassNames(options.viewClassNames, hookProps)

    return (
      <MountHook
        hookProps={hookProps}
        didMount={options.viewDidMount}
        willUnmount={options.viewWillUnmount}
        elRef={props.elRef}
      >
        {(rootElRef) => props.children(
          rootElRef,
          [ `fc-${props.viewSpec.type}-view`, 'fc-view' ].concat(customClassNames)
        )}
      </MountHook>
    )
  }

}
