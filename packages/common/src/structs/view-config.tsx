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
  let { component } = rawOptions

  if (rawOptions.content) {
    component = createViewHookComponent(rawOptions)
    // TODO: remove content/classNames/didMount/etc from options?
  }

  return {
    superType: rawOptions.type as any,
    component: component as any,
    rawOptions, // includes type and component too :(
  }
}

export interface SpecificViewContentArg extends ViewProps {
  nextDayThreshold: Duration
}

export type SpecificViewMountArg = MountArg<SpecificViewContentArg>

function createViewHookComponent(options: ViewOptions) {
  return (viewProps: ViewProps) => (
    <ViewContextType.Consumer>
      {(context: ViewContext) => (
        <ViewRoot viewSpec={context.viewSpec}>
          {(viewElRef, viewClassNames) => {
            let hookProps: SpecificViewContentArg = {
              ...viewProps,
              nextDayThreshold: context.options.nextDayThreshold,
            }
            return (
              <RenderHook
                hookProps={hookProps}
                classNames={options.classNames as any}
                content={options.content as any}
                didMount={options.didMount as any}
                willUnmount={options.willUnmount as any}
                elRef={viewElRef}
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
