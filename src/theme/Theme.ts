import * as $ from 'jquery'


export default class Theme {

  optionsManager: any

  // settings. default values are set after the class
  classes: any
  iconClasses: any
  baseIconClass: string
  iconOverrideOption: any
  iconOverrideCustomButtonOption: any
  iconOverridePrefix: string


  constructor(optionsManager) {
    this.optionsManager = optionsManager
    this.processIconOverride()
  }


  processIconOverride() {
    if (this.iconOverrideOption) {
      this.setIconOverride(
        this.optionsManager.get(this.iconOverrideOption)
      )
    }
  }


  setIconOverride(iconOverrideHash) {
    let iconClassesCopy
    let buttonName

    if ($.isPlainObject(iconOverrideHash)) {
      iconClassesCopy = $.extend({}, this.iconClasses)

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
