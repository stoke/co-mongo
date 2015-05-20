var setup = require('./setup');
var mongo = require('mongodb');
var comongo = require('../');
var co = require('co');
var assert = require('assert');

describe('unorderedbulkoperation', function () {
  var test;

  beforeEach(function () {
    test = setup.test;
  });
  
  it('should pass official test', function(done) {
    co(function *() {
      var batch = test.initializeUnorderedBulkOp({
        useLegacyOps: true
      });

      batch.insert({a:1});
      batch.find({a:1}).updateOne({$set: {b:1}});
      batch.find({a:2}).upsert().updateOne({$set: {b:2}});
      batch.insert({a:3});
      batch.find({a:3}).remove({a:3});

      // Execute the operations
      var result = yield batch.execute();

      // Check state of result
      assert.equal(2, result.nInserted);
      assert.equal(1, result.nUpserted);
      assert.equal(1, result.nMatched);
      assert.ok(1 == result.nModified || result.nModified == null);
      assert.equal(1, result.nRemoved);

      var upserts = result.getUpsertedIds();
      assert.equal(1, upserts.length);
      assert.equal(2, upserts[0].index);
      assert.ok(upserts[0]._id != null);

      var upsert = result.getUpsertedIdAt(0);
      assert.equal(2, upsert.index);
      assert.ok(upsert._id != null);
      
    })(done);
  });
});
