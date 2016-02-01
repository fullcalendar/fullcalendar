});

if (typeof exports == "object") {
  module.exports = require("moment-jalaali");
} else if (typeof define == "function" && define.amd) {
  define([], function(){ return require("moment-jalaali"); });
} else {
  this["moment"] = require("moment-jalaali");
}
})();
