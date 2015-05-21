var co = require('co');

/**
 * Expose Cursor
 */

module.exports = Cursor;

/**
 * Cursor
 */

function Cursor(cursor) {
  this._cursor = cursor;
}

/**
 * Methods to inherit
 */

var inherit = [
  'rewind',
  'stream',
  'isClosed'
];

/**
 * Just pass through
 */

inherit.forEach(function (method) {
  Cursor.prototype[method] = function () {
    var cursor = this._cursor;
    return cursor[method].apply(cursor, arguments);
  };
});

/**
 * Methods to thunk
 */

var thunk = [
  'toArray',
  'count',
  'skip',
  'nextObject',
  'explain'
];

/**
 * thunk specified functions
 */

thunk.forEach(function (method) {
  Cursor.prototype[method] = function () {
    var args = [].slice.call(arguments);
    var cursor = this._cursor;

    return function (done) {
      args.push(done);
      cursor[method].apply(cursor, args);
    };
  };
});

/**
 * Methods that return a cursor
 */

var cursor = [
  'sort',
  'limit',
  'maxTimeMS',
  'setReadPreference',
  'skip',
  'batchSize'
];

/**
 * Wrap returned cursor
 */

cursor.forEach(function (method) {
  Cursor.prototype[method] = function () {
    var cursor = this._cursor;
    return new Cursor(cursor[method].apply(cursor, arguments));
  };
});

/**
 * Methods that return a cursor in a callback
 */

var cursorThunk = [
  'close'
];

/**
 * Thunk and wrap returned cursor
 */

cursorThunk.forEach(function (method) {
  Cursor.prototype[method] = function () {
    var args = [].slice.call(arguments);
    var cursor = this._cursor;

    return function (done) {
      args.push(function (err, cursor) {
        if (err) return done(err);
        done(null, new Cursor(cursor));
      });
      cursor[method].apply(cursor, args);
    };
  };
});

/*
 * Special cases
 */

Cursor.prototype.each = function *(fn) { // this just wraps the callback in co, even if it isn't async
  this._cursor.each.call(this._cursor, co(function *(err, item) {
    if (err)
      throw err;

    yield fn(item);
  }));
};
