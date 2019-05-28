import DateComponent from '../component/DateComponent'


export abstract class Interaction {

  component: DateComponent<any>

  constructor(settings: InteractionSettings) {
    this.component = settings.component
  }

  destroy() {
  }

}

export type InteractionClass = { new(settings: InteractionSettings): Interaction }


export interface InteractionSettingsInput {
  el: HTMLElement
  useEventCenter?: boolean
  // TODO: add largeUnit
}

export interface InteractionSettings {
  component: DateComponent<any>
  el: HTMLElement
  useEventCenter: boolean
}

export type InteractionSettingsStore = { [componenUid: string]: InteractionSettings }

export function parseInteractionSettings(component: DateComponent<any>, input: InteractionSettingsInput): InteractionSettings {
  return {
    component: component,
    el: input.el,
    useEventCenter: input.useEventCenter != null ? input.useEventCenter : true
  }
}

export function interactionSettingsToStore(settings: InteractionSettings) {
  return {
    [settings.component.uid]: settings
  }
}



// global state
export let interactionSettingsStore: InteractionSettingsStore = {}
