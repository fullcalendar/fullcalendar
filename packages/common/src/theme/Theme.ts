import { CalendarOptionsRefined } from '../options'

export class Theme {
  // settings. default values are set after the class
  classes: any
  iconClasses: any
  rtlIconClasses: any
  baseIconClass: string // className that ALL icon elements for this theme should have
  iconOverrideOption: any // the name of the setting to use for icons. the subclass must set this.
  iconOverrideCustomButtonOption: any // the name of the setting, *within* each customButtons object, to use for icons
  iconOverridePrefix: string

  constructor(calendarOptions: CalendarOptionsRefined) {
    if (this.iconOverrideOption) {
      this.setIconOverride(
        calendarOptions[this.iconOverrideOption],
      )
    }
  }

  setIconOverride(iconOverrideHash) {
    let iconClassesCopy
    let buttonName

    if (typeof iconOverrideHash === 'object' && iconOverrideHash) { // non-null object
      iconClassesCopy = { ...this.iconClasses }

      for (buttonName in iconOverrideHash) {
        iconClassesCopy[buttonName] = this.applyIconOverridePrefix(
          iconOverrideHash[buttonName],
        )
      }

      this.iconClasses = iconClassesCopy
    } else if (iconOverrideHash === false) {
      this.iconClasses = {}
    }
  }

  applyIconOverridePrefix(className) {
    let prefix = this.iconOverridePrefix

    if (prefix && className.indexOf(prefix) !== 0) { // if not already present
      className = prefix + className
    }

    return className
  }

  getClass(key) {
    return this.classes[key] || ''
  }

  getIconClass(buttonName, isRtl?: boolean) {
    let className

    if (isRtl && this.rtlIconClasses) {
      className = this.rtlIconClasses[buttonName] || this.iconClasses[buttonName]
    } else {
      className = this.iconClasses[buttonName]
    }

    if (className) {
      return `${this.baseIconClass} ${className}`
    }

    return ''
  }

  getCustomButtonIconClass(customButtonProps) {
    let className

    if (this.iconOverrideCustomButtonOption) {
      className = customButtonProps[this.iconOverrideCustomButtonOption]

      if (className) {
        return `${this.baseIconClass} ${this.applyIconOverridePrefix(className)}`
      }
    }

    return ''
  }
}

Theme.prototype.classes = {}
Theme.prototype.iconClasses = {}
Theme.prototype.baseIconClass = ''
Theme.prototype.iconOverridePrefix = ''

export type ThemeClass = { new(calendarOptions: any): Theme }
