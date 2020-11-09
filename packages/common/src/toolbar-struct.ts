export interface ToolbarModel {
  [sectionName: string]: ToolbarWidget[][]
}

export interface ToolbarWidget {
  buttonName: string
  buttonClick?: any
  buttonIcon?: any
  buttonText?: any
}

export interface ToolbarInput {
  left?: string
  center?: string
  right?: string
  start?: string
  end?: string
}

export interface CustomButtonInput {
  text?: string
  icon?: string
  themeIcon?: string
  bootstrapFontAwesome?: string
  click?(ev: MouseEvent, element: HTMLElement): void
}

export interface ButtonIconsInput {
  prev?: string
  next?: string
  prevYear?: string
  nextYear?: string
  today?: string
  [viewOrCustomButton: string]: string | undefined
}

export interface ButtonTextCompoundInput {
  prev?: string
  next?: string
  prevYear?: string // derive these somehow?
  nextYear?: string
  today?: string
  month?: string
  week?: string
  day?: string
  [viewOrCustomButton: string]: string | undefined // needed b/c of other optional types
}
