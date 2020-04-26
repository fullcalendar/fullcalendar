import { ViewProps } from '../View'
import { refineProps } from '../util/misc'
import { mapHash } from '../util/object'
import { ComponentType, Component, h } from '../vdom'
import { ViewRoot } from '../common/ViewRoot'
import { RenderHook } from '../common/render-hook'
import { ComponentContext, ComponentContextType } from '../component/ComponentContext'

/*
A view-config represents information for either:
A) creating a new instantiatable view class. in which case, supplied a class/type in addition to options, OR
B) options to customize an existing view, in which case only provides options.
*/

export type ViewComponent = Component<ViewProps> // an instance
export type ViewComponentType = ComponentType<ViewProps>

export interface ViewConfigObjectInput { // not strict enough. will basically allow for anything :(
  type?: string
  component?: ViewComponentType
  [optionName: string]: any
}

export type ViewConfigInput = ViewComponentType | ViewConfigObjectInput
export type ViewConfigInputHash = { [viewType: string]: ViewConfigInput }

export interface ViewConfig {
  superType: string
  component: ViewComponentType | null
  options: any
}

export type ViewConfigHash = { [viewType: string]: ViewConfig }


export function parseViewConfigs(inputs: ViewConfigInputHash): ViewConfigHash {
  return mapHash(inputs, parseViewConfig)
}


const VIEW_DEF_PROPS = {
  type: String,
  component: null
}

function parseViewConfig(input: ViewConfigInput): ViewConfig {
  if (typeof input === 'function') {
    input = { component: input }
  }

  let options = {} as any
  let props = refineProps(input, VIEW_DEF_PROPS, {}, options)
  let component = props.component

  if (options.content) {
    component = createViewHookComponent(options)
    // TODO: remove content/classNames/didMount/etc from options?
  }

  return {
    superType: props.type,
    component,
    options
  }
}


function createViewHookComponent(options) {
  return function(viewProps: ViewProps) {
    return (
      <ComponentContextType.Consumer>
        {(context: ComponentContext) => (
          <ViewRoot viewSpec={context.viewSpec}>
            {(rootElRef, viewClassNames) => {
              let hookProps = { ...viewProps, nextDayThreshold: context.computedOptions.nextDayThreshold }
              return (
                <RenderHook name='' options={options} hookProps={hookProps} elRef={rootElRef}>
                  {(rootElRef, customClassNames, innerElRef, innerContent) => (
                    <div className={viewClassNames.concat(customClassNames).join(' ')} ref={rootElRef}>
                      {innerContent}
                    </div>
                  )}
                </RenderHook>
              )
            }}
          </ViewRoot>
        )}
      </ComponentContextType.Consumer>
    )
  }
}
