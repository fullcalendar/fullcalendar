import { DateComponent } from '../component/DateComponent'
import { Hit } from './hit'

export abstract class Interaction {
  component: DateComponent<any>
  isHitComboAllowed: ((hit0: Hit, hit1: Hit) => boolean) | null

  constructor(settings: InteractionSettings) {
    this.component = settings.component
    this.isHitComboAllowed = settings.isHitComboAllowed || null
  }

  destroy() {
  }
}

export type InteractionClass = { new(settings: InteractionSettings): Interaction }

export interface InteractionSettingsInput {
  el: HTMLElement
  useEventCenter?: boolean
  isHitComboAllowed?: (hit0: Hit, hit1: Hit) => boolean
}

export interface InteractionSettings {
  component: DateComponent<any>
  el: HTMLElement
  useEventCenter: boolean
  isHitComboAllowed: ((hit0: Hit, hit1: Hit) => boolean) | null
}

export type InteractionSettingsStore = { [componenUid: string]: InteractionSettings }

export function parseInteractionSettings(component: DateComponent<any>, input: InteractionSettingsInput): InteractionSettings {
  return {
    component,
    el: input.el,
    useEventCenter: input.useEventCenter != null ? input.useEventCenter : true,
    isHitComboAllowed: input.isHitComboAllowed || null,
  }
}

export function interactionSettingsToStore(settings: InteractionSettings) {
  return {
    [settings.component.uid]: settings,
  }
}

// global state
export const interactionSettingsStore: InteractionSettingsStore = {}
