import { ViewProps } from '../View'
import { mapHash } from '../util/object'
import { ComponentType, Component, createElement } from '../vdom'
import { ViewRoot } from '../common/ViewRoot'
import { RenderHook, MountArg } from '../common/render-hook'
import { ViewContext, ViewContextType } from '../ViewContext'
import { ViewOptions } from '../options'
import { Duration } from '../datelib/duration'

/*
A view-config represents information for either:
A) creating a new instantiatable view class. in which case, supplied a class/type in addition to options, OR
B) options to customize an existing view, in which case only provides options.
*/

export type ViewComponent = Component<ViewProps> // an instance
export type ViewComponentType = ComponentType<ViewProps>

export type ViewConfigInput = ViewComponentType | ViewOptions
export type ViewConfigInputHash = { [viewType: string]: ViewConfigInput }

export interface ViewConfig {
  superType: string
  component: ViewComponentType | null
  rawOptions: ViewOptions
}

export type ViewConfigHash = { [viewType: string]: ViewConfig }


export function parseViewConfigs(inputs: ViewConfigInputHash): ViewConfigHash {
  return mapHash(inputs, parseViewConfig)
}


function parseViewConfig(input: ViewConfigInput): ViewConfig {
  let rawOptions: ViewOptions = typeof input === 'function' ?
    { component: input } :
    input
  let component = rawOptions.component

  if (rawOptions.content) {
    component = createViewHookComponent(rawOptions)
    // TODO: remove content/classNames/didMount/etc from options?
  }

  return {
    superType: rawOptions.type,
    component,
    rawOptions // includes type and component too :(
  }
}


export interface SpecificViewContentArg extends ViewProps {
  nextDayThreshold: Duration
}

export type SpecificViewMountArg = MountArg<SpecificViewContentArg>


function createViewHookComponent(options: ViewOptions) {
  return function(viewProps: ViewProps) {
    return (
      <ViewContextType.Consumer>
        {(context: ViewContext) => (
          <ViewRoot viewSpec={context.viewSpec}>
            {(rootElRef, viewClassNames) => {
              let hookProps: SpecificViewContentArg = {
                ...viewProps,
                nextDayThreshold: context.options.nextDayThreshold
              }

              return (
                <RenderHook
                  hookProps={hookProps}
                  classNames={options.classNames}
                  content={options.content}
                  didMount={options.didMount}
                  willUnmount={options.willUnmount}
                  elRef={rootElRef}
                >
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
      </ViewContextType.Consumer>
    )
  }
}
