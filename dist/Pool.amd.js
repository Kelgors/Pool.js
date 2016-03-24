define('Pool', ['exports', 'babel-runtime/helpers/classCallCheck', 'babel-runtime/helpers/createClass', 'babel-runtime/core-js/object/define-property'], function (exports, _classCallCheck2, _createClass2, _defineProperty) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

  var _createClass3 = _interopRequireDefault(_createClass2);

  var _defineProperty2 = _interopRequireDefault(_defineProperty);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function set_constant(instance, key, value) {
    (0, _defineProperty2.default)(instance, key, {
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
      (0, _classCallCheck3.default)(this, Pool);

      this.size = size;
      set_constant(this, 'ObjectConstructor', ObjectConstructor);
      set_constant(this, 'objectClearMethodName', clearMethodName);
      set_constant(this, 'objectDestroyMethodName', destroyMethodName);
      set_constant(this, 'objectConstructorIsFactory', isFactory);
      set_constant(this, 'borrowedObjects', []);
      set_constant(this, 'availableObjects', []);
    }

    (0, _createClass3.default)(Pool, [{
      key: 'destroy',
      value: function destroy() {
        this._destroyChildren(this.borrowedObjects);
        this._destroyChildren(this.availableObjects);
      }
    }, {
      key: '_destroyChildren',
      value: function _destroyChildren(arrayOfObjects) {
        var methodName = this.objectDestroyMethodName || this.clearMethodName;
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
        return object;
      }
    }, {
      key: 'returns',
      value: function returns(borrowedObject) {
        if (!(borrowedObject instanceof this.ObjectConstructor)) {
          throw new Error('Can\'t return object which is not a ' + this.ObjectConstructor.name);
        }
        var index = this.borrowedObjects.indexOf(borrowedObject);
        if (index === -1) {
          if (this.availableObjects.includes(borrowedObject)) {
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
      }
    }, {
      key: 'hasAvailables',
      value: function hasAvailables() {
        return this.size === -1 || this.borrowedObjects.length < this.size;
      }
    }, {
      key: 'getCountAvailables',
      value: function getCountAvailables() {
        return this.availableObjects.length;
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
    }]);
    return Pool;
  }();

  exports.default = Pool;
});