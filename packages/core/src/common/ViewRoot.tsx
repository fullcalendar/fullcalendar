import { ViewSpec } from '../structs/view-spec'
import { RenderHook } from './render-hook'
import { ComponentChildren, h, Ref } from '../vdom'
import ComponentContext, { ComponentContextType } from '../component/ComponentContext'


export interface ViewRootProps {
  viewSpec: ViewSpec
  children: (rootElRef: Ref<any>, classNames: string[]) => ComponentChildren
  elRef?: Ref<any>
}


export const ViewRoot = (props: ViewRootProps) => (
  <ComponentContextType.Consumer>
    {(context: ComponentContext) => (
      <RenderHook name='view' mountProps={{ view: context.view }} dynamicProps={{}} elRef={props.elRef}>
        {(rootElRef, customClassNames) => props.children(
          rootElRef,
          [ 'fc-view', 'fc-' + props.viewSpec.type + '-view' ].concat(customClassNames)
        )}
      </RenderHook>
    )}
  </ComponentContextType.Consumer>
)
