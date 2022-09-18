import { ViewSpec } from '../structs/view-spec.js'
import { MountHook, buildClassNameNormalizer, MountArg } from './render-hook.js'
import { ComponentChildren, createElement, Ref } from '../preact/index.js'
import { BaseComponent } from '../vdom-util.js'
import { ViewApi } from '../ViewApi.js'

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
