/**
 * Expose Collection
 */

module.exports = UnorderedBulkOp;

/**
 * Collection
 */

function UnorderedBulkOp(op) {
  this._op = op;
}

/**
 * Methods to thunk
 */

var thunk = [
  'execute'
];

/**
 * Thunk specified functions
 */

thunk.forEach(function (method) {
  UnorderedBulkOp.prototype[method] = function () {
    var args = [].slice.call(arguments);
    var op = this._op;

    return function (done) {
      args.push(done);

      op[method].apply(op, args);
    };
  };
});

var methods = [
  'update',
  'updateOne',
  'replaceOne',
  'upsert',
  'removeOne',
  'remove',
  'insert',
  'find'
];

methods.forEach(function(method) {
  UnorderedBulkOp.prototype[method] = function () {
    return this._op[method].apply(this._op, arguments);
  };
});
