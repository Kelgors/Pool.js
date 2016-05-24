require('chai').should();
var Pool = require('../dist/Pool.commonjs.js').default;

function Point(x, y) {
  this.x = x | 0;
  this.y = y | 0;
}

function createRandomPoint() {
  return new Point(Math.floor(Math.random() * 100), Math.floor(Math.random() * 100));
}

describe('Pool', function () {
  var pool = null;
  var borrowedObjects = [];
  borrowedObjects.push(null);
  borrowedObjects.push(null);
  borrowedObjects.push(null);

  before('createPool', function () {
    pool = new Pool(createRandomPoint, 2, {
      isFactory: true,
      clearMethodName: null,
      destroyMethodName: null
    });
  });


  describe('#borrows()', function () {
    it('should return a Point', function () {
      borrowedObjects[0] = pool.borrows();
      borrowedObjects[0].should.be.an.instanceof(Point);
      borrowedObjects[0].should.be.equal(pool.borrowedObjects[0]);
      pool.hasAvailables().should.be.equal(true);
      pool.getCountBorrowed().should.be.equal(1);
      pool.getCountAvailables().should.be.equal(1);
    });
    it('should return a second Point', function () {
      borrowedObjects[1] = pool.borrows();
      borrowedObjects[1].should.be.an.instanceof(Point);
      borrowedObjects[1].should.be.equal(pool.borrowedObjects[1]);
      pool.hasAvailables().should.be.equal(false);
      pool.getCountBorrowed().should.be.equal(2);
      pool.getCountAvailables().should.be.equal(0);
    });
    it('should not returns a third Point', function () {
      var thirdBorrowedObject = pool.borrows();
      require('chai').expect(thirdBorrowedObject).to.be.equal(null);
      pool.hasAvailables().should.be.equal(false);
      pool.getCountBorrowed().should.be.equal(2);
      pool.getCountAvailables().should.be.equal(0);
    });
  });

  describe('#returns()', function () {
    it('should put the returned object as available ones', function () {
      pool.returns(borrowedObjects[1]);
      pool.hasAvailables().should.be.equal(true);
      pool.getCountBorrowed().should.be.equal(1);
      pool.getCountAvailables().should.be.equal(1);
      borrowedObjects[1] = null;
    });
    it('should be as the construction time', function () {
      pool.returns(borrowedObjects[0]);
      pool.hasAvailables().should.be.equal(true);
      pool.getCountBorrowed().should.be.equal(0);
      pool.getCountAvailables().should.be.equal(2);
      borrowedObjects[0] = null;
    });
  });

  describe('#await()', function () {
    before('Borrow one point', function () {
      borrowedObjects[0] = pool.borrows();
    });


    it('should returns a Point asynchronously', function (done) {
      var promise = pool.await();
      promise.then(function (point) {
        borrowedObjects[1] = point;

        borrowedObjects[1].should.be.an.instanceof(Point);
        pool.hasAvailables().should.be.equal(false);
        pool.getCountBorrowed().should.be.equal(2);
        pool.getCountAvailables().should.be.equal(0);

        done();
      });
    });
    it('should wait until returns method called', function (done) {
      pool.await().then(function (point2) {
        borrowedObjects[2] = point2;
        borrowedObjects[2].should.be.equal(borrowedObjects[1]);
        done();
      });
      pool.awaitCallbacks.should.have.length(1);
      pool.hasAvailables().should.be.equal(false);
      pool.getCountBorrowed().should.be.equal(2);
      pool.getCountAvailables().should.be.equal(0);

      pool.returns(borrowedObjects[1]);

      pool.awaitCallbacks.should.have.length(0);
      pool.hasAvailables().should.be.equal(false);
      pool.getCountBorrowed().should.be.equal(2);
      pool.getCountAvailables().should.be.equal(0);

    });
  });

  describe('#destroy', function () {
    it('should be destroyed', function () {
      pool.destroy();
      pool.borrowedObjects.should.have.length(0);
      pool.availableObjects.should.have.length(0);
      pool.awaitCallbacks.should.have.length(0);
      pool = null;
    });
  });

});