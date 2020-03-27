import { ViewProps } from '../View'
import { refineProps } from '../util/misc'
import { mapHash } from '../util/object'
import { ComponentType, Component } from '../vdom'

/*
A view-config represents information for either:
A) creating a new instantiatable view class. in which case, supplied a class/type in addition to options, OR
B) options to customize an existing view, in which case only provides options.
*/

export type ViewComponent = Component<ViewProps> // an instance

export type ViewComponentType = ComponentType<ViewProps> // a class or a function

export interface ViewConfigObjectInput { // not strict enough. will basically allow for anything :(
  type?: string
  component?: ViewComponentType
  usesMinMaxTime?: boolean
  dateProfileGeneratorClass?: any
  [optionName: string]: any
}

export type ViewConfigInput = ViewComponentType | ViewConfigObjectInput
export type ViewConfigInputHash = { [viewType: string]: ViewConfigInput }

export interface ViewConfig {
  superType: string
  component: ViewComponentType | null
  usesMinMaxTime?: boolean
  dateProfileGeneratorClass?: any
  options: any
}

export type ViewConfigHash = { [viewType: string]: ViewConfig }

export function parseViewConfigs(inputs: ViewConfigInputHash): ViewConfigHash {
  return mapHash(inputs, parseViewConfig)
}

const VIEW_DEF_PROPS = {
  type: String,
  component: null,
  usesMinMaxTime: Boolean,
  dateProfileGeneratorClass: null
}

function parseViewConfig(input: ViewConfigInput): ViewConfig {
  if (typeof input === 'function') {
    input = { component: input }
  }

  let options = {}
  let props = refineProps(input, VIEW_DEF_PROPS, {}, options)

  return {
    superType: props.type,
    component: props.component,
    usesMinMaxTime: props.usesMinMaxTime,
    dateProfileGeneratorClass: props.dateProfileGeneratorClass,
    options
  }
}
