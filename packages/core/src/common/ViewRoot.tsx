import { ViewSpec } from '../structs/view-spec.js'
import { MountArg } from './render-hook.js'
import { ComponentChildren, createElement } from '../preact.js'
import { BaseComponent } from '../vdom-util.js'
import { ViewApi } from '../ViewApi.js'
import { ContentContainer } from '../content-inject/ContentContainer.js'
import { ElProps } from '../content-inject/ContentInjector.js'

export interface ViewRootProps extends Partial<ElProps> {
  viewSpec: ViewSpec
  children: ComponentChildren
}

export interface ViewContentArg {
  view: ViewApi
}

export type ViewMountArg = MountArg<ViewContentArg>

export class ViewRoot extends BaseComponent<ViewRootProps> {
  render() {
    let { props, context } = this
    let { options } = context
    let renderProps: ViewContentArg = { view: context.viewApi }

    return (
      <ContentContainer
        {...props}
        elTag={props.elTag || 'div'}
        elClasses={[
          ...buildViewClassNames(props.viewSpec),
          ...(props.elClasses || []),
        ]}
        renderProps={renderProps}
        classNameGenerator={options.viewClassNames}
        generatorName={undefined}
        generator={undefined}
        didMount={options.viewDidMount}
        willUnmount={options.viewWillUnmount}
      >
        {() => props.children}
      </ContentContainer>
    )
  }
}

export function buildViewClassNames(viewSpec: ViewSpec): string[] {
  return [
    `fc-${viewSpec.type}-view`,
    'fc-view',
  ]
}
