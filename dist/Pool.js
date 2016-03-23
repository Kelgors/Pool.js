"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Pool = function () {
  function Pool(ObjectContructor, size) {
    var initSize = arguments.length <= 2 || arguments[2] === undefined ? size : arguments[2];

    _classCallCheck(this, Pool);

    this.size = size;
    this.ObjectContructor = ObjectContructor;
    this.borrowedObjects = [];
    this.availableObjects = [];
  }

  _createClass(Pool, [{
    key: "destroy",
    value: function destroy() {
      this.borrowedObjects = null;
      this.availableObjects = [];
      this.ObjectContructor = null;
    }
  }, {
    key: "borrows",
    value: function borrows() {
      var object = null;
      if (this.hasAvailables()) {
        if (this.availableObjects.length === 0) {
          object = new this.ObjectContructor();
        } else {
          object = this.availableObjects.pop();
        }
        this.borrowedObjects.push(object);
      }
      return object;
    }
  }, {
    key: "returns",
    value: function returns(borrowedObject) {
      if (!(borrowedObject instanceof this.ObjectContructor)) {
        throw new Error("Can't return object which is not a " + this.ObjectConstructor.name);
      }
      var index = this.borrowedObjects.indexOf(borrowedObject);
      if (index === -1) {
        if (this.availableObjects.includes(borrowedObject)) {
          throw new Error(this.ObjectContructor.name + " already returned !");
        } else {
          throw new Error("Object given in Pool#returns() is not referenced in this Pool instance.");
        }
      }
      this.borrowedObjects.splice(index, 1);
      try {
        borrowedObject.dispose();
      } catch (err) {} finally {
        //console.log('finally');
        this.availableObjects.push(borrowedObject);
      }
    }
  }, {
    key: "hasAvailables",
    value: function hasAvailables() {
      return this.size === -1 || this.borrowedObjects.length < this.size;
    }
  }, {
    key: "getCountAvailables",
    value: function getCountAvailables() {
      return this.availableObjects.length;
    }
  }, {
    key: "getCountBorrowed",
    value: function getCountBorrowed() {
      return this.borrowedObjects.length;
    }
  }]);

  return Pool;
}();