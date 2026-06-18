import { ViewContentInfo, ViewProps } from '../component-util/View'
import { mapHash } from '../util/object'
import { type ComponentType, Component } from 'react'
import { ViewContext, ViewContextType } from '../ViewContext'
import { ViewOptions } from '../options'
import { ContentContainer, generateClassName } from '../content-inject/ContentContainer'
import { Duration } from '@full-ui/headless-calendar'
import { BaseComponent } from '../vdom-util'
import { computeViewBorderless } from '../util/misc'
import { ContentGenerator } from '../common/render-hook'
import { getIsHeightAuto } from '../scrollgrid/util'
import { joinClassNames } from '../public-api'

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
    component = createViewHookComponent(rawOptions.content)
  } else if (component && !((component as any).prototype instanceof BaseComponent)) {
    // WHY?: people were using `component` property for `content`
    // TODO: converge on one setting name
    component = createViewHookComponent(component as any)
  }

  return {
    superType: rawOptions.type,
    component: component as any,
    rawOptions, // includes type and component too :(
  }
}

/*
TODO: converge with ViewContainer
*/
function createViewHookComponent(contentGenerator: ContentGenerator<ViewContentInfo>) {
  return (viewProps: ViewProps) => (
    <ViewContextType.Consumer
      children={(context: ViewContext) => {
        const { options, viewSpec } = context
        const renderProps: ViewContentInfo = {
          // the "extra" props, for sliceEvents...
          ...viewProps,
          nextDayThreshold: options.nextDayThreshold as Duration,
          // ViewDisplayInfo...
          ...computeViewBorderless(options),
          options: { headerToolbar: options.headerToolbar, footerToolbar: options.footerToolbar },
          isHeightAuto: getIsHeightAuto(options),
          view: context.viewApi,
        }

        return (
          <ContentContainer
            tag="div"
            className={joinClassNames(
              generateClassName((options as any).viewClass, renderProps),
              // WORKAROUND for way calendar's className would get merged into view's className
              generateClassName(viewSpec.optionDefaults.class, renderProps),
              generateClassName(viewSpec.optionDefaults.className, renderProps),
              generateClassName(viewSpec.optionOverrides.class, renderProps),
              generateClassName(viewSpec.optionOverrides.className, renderProps),
            )}
            renderProps={renderProps}
            generatorName={undefined}
            customGenerator={contentGenerator}
            didMount={options.didMount || (options as any).viewDidMount} // TODO: should call both
            willUnmount={options.willUnmount || (options as any).viewWillUnmount} // TODO: should call both
          />
        )
      }}
    />
  )
}
