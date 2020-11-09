import { ViewSpec } from '../structs/view-spec'
import { MountHook, buildClassNameNormalizer, MountArg } from './render-hook'
import { ComponentChildren, createElement, Ref } from '../vdom'
import { BaseComponent } from '../vdom-util'
import { ViewApi } from '../ViewApi'

export interface ViewRootProps {
  viewSpec: ViewSpec
  children: (rootElRef: Ref<any>, classNames: string[]) => ComponentChildren
  elRef?: Ref<any>
}

export interface ViewContentArg {
  view: ViewApi
}

export type ViewMountArg = MountArg<ViewContentArg>

export class ViewRoot extends BaseComponent<ViewRootProps> {
  normalizeClassNames = buildClassNameNormalizer<ViewContentArg>()

  render() {
    let { props, context } = this
    let { options } = context
    let hookProps: ViewContentArg = { view: context.viewApi }
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
          [`fc-${props.viewSpec.type}-view`, 'fc-view'].concat(customClassNames),
        )}
      </MountHook>
    )
  }
}
