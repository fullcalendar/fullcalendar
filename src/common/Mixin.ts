
export default class Mixin {

  // mix into a CLASS
  static mixInto(destClass) {
    this.mixIntoObj(destClass.prototype)
  }

  // mix into ANY object
  static mixIntoObj(destObj) {
    Object.getOwnPropertyNames(this.prototype).forEach((name) => { // copy methods
      if (!destObj[name]) { // if destination doesn't already define it
        destObj[name] = this.prototype[name]
      }
    })
  }

  /*
  will override existing methods
  TODO: remove! not used anymore
  */
  static mixOver(destClass) {
    Object.getOwnPropertyNames(this.prototype).forEach((name) => { // copy methods
      destClass.prototype[name] = this.prototype[name]
    })
  }

}
