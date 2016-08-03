function Iterator(items) {
    this.items = items || [];
}


Iterator.prototype.iterate = function(callback) {
    var itemCount = this.items.length;

    for (var i = 0; i < itemCount; i++) {
        callback(this.items[i]);
    }
};


/* Calls a method on every item passing the arguments through */
Iterator.prototype.proxyCall = function(methodName) {
    var args = Array.prototype.slice.call(arguments, 1);
    var results = [];

    this.iterate(function(item) {
        results.push(item[methodName].apply(item, args));
    });

    return results;
};
