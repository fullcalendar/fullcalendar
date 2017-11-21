
export default class Mixin {

	static mixInto(destClass) {
		Object.getOwnPropertyNames(this.prototype).forEach((name) => { // copy methods
			if (!destClass.prototype[name]) { // if destination class doesn't already define it
				destClass.prototype[name] = this.prototype[name];
			}
		});
	}

	/*
	will override existing methods
	*/
	static mixOver(destClass) {
		Object.getOwnPropertyNames(this.prototype).forEach((name) => { // copy methods
			destClass.prototype[name] = this.prototype[name];
		});
	}

}