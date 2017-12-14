import { copyOwnProps } from '../util'


// Class that all other classes will inherit from
export default class Class {

  // Called on a class to create a subclass.
  // LIMITATION: cannot provide a constructor!
  static extend(members): any {
    class SubClass extends this {}

    copyOwnProps(members, SubClass.prototype)

    return SubClass
  }


  // Adds new member variables/methods to the class's prototype.
  // Can be called with another class, or a plain object hash containing new members.
  static mixin(members) {
    copyOwnProps(members, this.prototype)
  }
}
