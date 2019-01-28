
export default class Theme {

  calendarOptions: any

  // settings. default values are set after the class
  classes: any
  iconClasses: any
  baseIconClass: string
  iconOverrideOption: any
  iconOverrideCustomButtonOption: any
  iconOverridePrefix: string


  constructor(calendarOptions) {
    this.calendarOptions = calendarOptions
    this.processIconOverride()
  }


  processIconOverride() {
    if (this.iconOverrideOption) {
      this.setIconOverride(
        this.calendarOptions[this.iconOverrideOption]
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
          iconOverrideHash[buttonName]
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


  getIconClass(buttonName) {
    let className = this.iconClasses[buttonName]

    if (className) {
      return this.baseIconClass + ' ' + className
    }

    return ''
  }


  getCustomButtonIconClass(customButtonProps) {
    let className

    if (this.iconOverrideCustomButtonOption) {
      className = customButtonProps[this.iconOverrideCustomButtonOption]

      if (className) {
        return this.baseIconClass + ' ' + this.applyIconOverridePrefix(className)
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
