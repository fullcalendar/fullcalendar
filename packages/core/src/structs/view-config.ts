import View from '../View'
import { ViewSpec } from './view-spec'
import { refineProps } from '../util/misc'
import { mapHash } from '../util/object'

/*
A view-config represents information for either:
A) creating a new instantiatable view class. in which case, supplied a class/type in addition to options, OR
B) options to customize an existing view, in which case only provides options.
*/

export type ViewClass = new(
  viewSpec: ViewSpec,
  parentEl: HTMLElement
) => View

export interface ViewConfigObjectInput {
  type?: string
  class?: ViewClass
  [optionName: string]: any
}

export type ViewConfigInput = ViewClass | ViewConfigObjectInput
export type ViewConfigInputHash = { [viewType: string]: ViewConfigInput }

export interface ViewConfig {
  superType: string
  class: ViewClass | null
  options: any
}

export type ViewConfigHash = { [viewType: string]: ViewConfig }

export function parseViewConfigs(inputs: ViewConfigInputHash): ViewConfigHash {
  return mapHash(inputs, parseViewConfig)
}

const VIEW_DEF_PROPS = {
  type: String,
  class: null
}

function parseViewConfig(input: ViewConfigInput): ViewConfig {
  if (typeof input === 'function') {
    input = { class: input }
  }

  let options = {}
  let props = refineProps(input, VIEW_DEF_PROPS, {}, options)

  return {
    superType: props.type,
    class: props.class,
    options
  }
}
