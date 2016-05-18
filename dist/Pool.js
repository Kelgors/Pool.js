'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function set_constant(instance, key, value) {
  Object.defineProperty(instance, key, {
    writable: false, configurable: false,
    value: value
  });
}

var Pool = function () {
  function Pool(ObjectConstructor) {
    var size = arguments.length <= 1 || arguments[1] === undefined ? -1 : arguments[1];

    var _ref = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    var _ref$clearMethodName = _ref.clearMethodName;
    var clearMethodName = _ref$clearMethodName === undefined ? null : _ref$clearMethodName;
    var _ref$destroyMethodNam = _ref.destroyMethodName;
    var destroyMethodName = _ref$destroyMethodNam === undefined ? null : _ref$destroyMethodNam;
    var _ref$isFactory = _ref.isFactory;
    var isFactory = _ref$isFactory === undefined ? false : _ref$isFactory;

    _classCallCheck(this, Pool);

    this.size = size;
    set_constant(this, 'ObjectConstructor', ObjectConstructor);
    set_constant(this, 'objectClearMethodName', clearMethodName);
    set_constant(this, 'objectDestroyMethodName', destroyMethodName);
    set_constant(this, 'objectConstructorIsFactory', isFactory);
    set_constant(this, 'borrowedObjects', []);
    set_constant(this, 'availableObjects', []);
    set_constant(this, 'awaitCallbacks', []);
  }

  _createClass(Pool, [{
    key: 'destroy',
    value: function destroy() {
      this._destroyChildren(this.borrowedObjects);
      this._destroyChildren(this.availableObjects);
      if (this.awaitCallbacks.length) {
        this.awaitCallbacks.splice(0, this.awaitCallbacks.length);
      }
    }
  }, {
    key: '_destroyChildren',
    value: function _destroyChildren(arrayOfObjects) {
      var methodName = this.objectDestroyMethodName || this.objectClearMethodName;
      if (!methodName) {
        // just empty it
        arrayOfObjects.splice(0, arrayOfObjects.length);
        return;
      }
      var object = void 0;
      while (object = arrayOfObjects.pop()) {
        try {
          object[methodName].call(object);
        } catch (err) {
          if (typeof console === 'undefined') throw err;
          console.log('Error during destroy');
        }
      }
    }
  }, {
    key: 'await',
    value: function await() {
      var _this = this;

      if (this.hasAvailables()) return Promise.resolve(this.borrows());
      return new Promise(function (resolve, reject) {
        _this.awaitCallbacks.push(resolve);
      });
    }
  }, {
    key: 'borrows',
    value: function borrows() {
      var object = null;
      if (this.hasAvailables()) {
        if (this.availableObjects.length === 0) {
          object = this.objectConstructorIsFactory ? this.ObjectConstructor() : new this.ObjectConstructor();
        } else {
          object = this.availableObjects.pop();
        }
        this.borrowedObjects.push(object);
      }
      if (this._onObjectBorrowed) this._onObjectBorrowed();
      return object;
    }
  }, {
    key: 'returns',
    value: function returns(borrowedObject) {
      if (!this.objectConstructorIsFactory && !(borrowedObject instanceof this.ObjectConstructor)) {
        throw new Error('Can\'t return object which is not a ' + this.ObjectConstructor.name);
      }
      var index = this.borrowedObjects.indexOf(borrowedObject);
      if (index === -1) {
        if (this.availableObjects.indexOf(borrowedObject) > -1) {
          throw new Error(this.ObjectConstructor.name + ' already returned !');
        }
        throw new Error('Object given in Pool#returns() is not referenced in this Pool instance.');
      }
      this.borrowedObjects.splice(index, 1);
      if (this.objectClearMethodName !== null) {
        try {
          borrowedObject[this.objectClearMethodName].call(borrowedObject);
        } catch (err) {
          if (typeof console === 'undefined') throw err;
          console.log('Unable to call method ' + this.objectClearMethodName + ' on object instance ' + String(borrowedObject));
        }
      }
      this.availableObjects.push(borrowedObject);
      if (this._onObjectReturned) this._onObjectReturned();
    }
  }, {
    key: 'hasAvailables',
    value: function hasAvailables() {
      return this.size === -1 || this.borrowedObjects.length < this.size;
    }
  }, {
    key: 'getCountAvailables',
    value: function getCountAvailables() {
      return (this.size === -1 ? Number.MAX_SAFE_INTEGER : this.size) - this.getCountBorrowed();
    }
  }, {
    key: 'getCountBorrowed',
    value: function getCountBorrowed() {
      return this.borrowedObjects.length;
    }
  }, {
    key: 'toString',
    value: function toString() {
      return 'Pool<' + this.ObjectConstructor.name + '>(borrowed: ' + this.getCountBorrowed() + ', available: ' + this.getCountAvailables() + ')';
    }
  }, {
    key: '_onObjectReturned',
    value: function _onObjectReturned() {
      console.log('_onObjectReturned');
      if (this.awaitCallbacks.length && this.hasAvailables()) {
        var resolver = this.awaitCallbacks.shift();
        resolver(this.borrows());
      }
    }
  }]);

  return Pool;
}();