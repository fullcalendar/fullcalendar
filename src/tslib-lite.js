
/*
derived from:
https://github.com/Microsoft/tslib/blob/v1.6.0/tslib.js

only include the helpers we need, to keep down filesize
*/

var extendStatics =
	/* NOTE: tslib's as-is method is not compatible with how CoffeeScript does subclasses.
	 * When CoffeeScript is stripped out, can revert.
	 *
	 * Object.setPrototypeOf ||
	 * ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	 */
	function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

exports.__extends = function (d, b) {
	extendStatics(d, b);
	function __() { this.constructor = d; }
	d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
