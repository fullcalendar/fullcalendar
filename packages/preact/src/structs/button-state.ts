
export interface ButtonState {
  text: string
  hint: string
}

export interface NavButtonState extends ButtonState {
  isDisabled: boolean
}

export interface ButtonStateMap {
  today: NavButtonState
  prev: NavButtonState
  next: NavButtonState
  prevYear: NavButtonState
  nextYear: NavButtonState
  [availableView: string]: ButtonState
}
