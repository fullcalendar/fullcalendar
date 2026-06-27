import { ClassNameGenerator, ContentGenerator, DidMountHandler, WillUnmountHandler } from './common/render-hook'

export interface ToolbarModel {
  sectionWidgets: {
    start: ToolbarWidget[][]
    center: ToolbarWidget[][]
    end: ToolbarWidget[][]
  }
  viewsWithButtons: string[]
  hasTitle: boolean
}

export interface ToolbarInfo {
  borderlessX: boolean
  borderlessTop: boolean
  borderlessBottom: boolean
  // TODO: isSticky
}

export interface ToolbarSectionInfo {
  name: string
}

// Button / Toolbar
// -------------------------------------------------------------------------------------------------

export interface ButtonGroupInfo {
  hasSelection: boolean
}

export interface ButtonInfo {
  name: string
  text: string
  isPrimary: boolean
  isSelected: boolean
  isDisabled: boolean
  isIconOnly: boolean
  buttonGroup: ButtonGroupInfo | null
}

export type ButtonDisplay = 'auto' | 'icon' | 'text' | 'icon-text' | 'text-icon'

export interface ButtonInput {
  didMount?: DidMountHandler<ButtonInfo>
  willUnmount?: WillUnmountHandler<ButtonInfo>
  click?: (ev: MouseEvent) => void
  hint?: string | ((viewOrCurrentUnitText: string, viewOrCurrentUnit: string) => string)
  class?: ClassNameGenerator<ButtonInfo>
  className?: ClassNameGenerator<ButtonInfo>
  display?: ButtonDisplay
  iconClass?: string | undefined,
  iconContent?: ContentGenerator<{}>,
  text?: string
  isPrimary?: boolean
}

// Info for internal rendering
export interface ToolbarWidget {
  name: string
  isView?: boolean
  customElement?: ToolbarElementInput
  buttonText?: string
  buttonHint?: string | ((currentUnit: string) => string)
  buttonDisplay?: ButtonDisplay
  buttonIconClass?: string | undefined
  buttonIconContent?: ContentGenerator<{}>,
  buttonClick?: (ev: MouseEvent) => void
  buttonIsPrimary?: boolean
  buttonClass?: ClassNameGenerator<ButtonInfo>
  buttonDidMount?: DidMountHandler<ButtonInfo>
  buttonWillUnmount?: WillUnmountHandler<ButtonInfo>
}

export interface ToolbarInput {
  left?: string
  center?: string
  right?: string
  start?: string
  end?: string
}

// Custom Elements
// -------------------------------------------------------------------------------------------------

export type ToolbarElementInput = ContentGenerator<{}>
