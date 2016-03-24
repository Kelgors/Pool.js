function set_constant(instance, key, value) {
  Object.defineProperty(instance, key, {
    writable: false, configurable: false,
    value: value
  });
}

export default class Pool {
  constructor(ObjectContructor, size = -1, { clearMethodName = null, destroyMethodName = null, isFactory = false } = {}) {
    this.size = size;
    set_constant(this, 'ObjectConstructor', ObjectConstructor);
    set_constant(this, 'objectClearMethodName', clearMethodName);
    set_constant(this, 'objectDestroyMethodName', destroyMethodName);
    set_constant(this, 'objectConstructorIsFactory', isFactory);
    set_constant(this, 'borrowedObjects', []);
    set_constant(this, 'availableObjects', []);
  }

  destroy() {
    if (this.objectDestroyMethodName) {
      this._destroyChildren(this.borrowedObjects);
      this._destroyChildren(this.availableObjects);
    }
  }

  _destroyChildren(arrayOfObjects) {
    const methodName = this.objectDestroyMethodName || this.clearMethodName;
    let object;
    while (object = arrayOfObjects.pop()) {
      try {
        object[methodName].call(object);
      } catch (err) {
        if (typeof console === 'undefined') throw err;
        console.log(`Error during destroy`);
      }
    }
  }

  borrows() {
    let object = null;
    if (this.hasAvailables()) {
      if (this.availableObjects.length === 0) {
        object = this.objectConstructorIsFactory ? this.ObjectContructor() : new this.ObjectContructor();
      } else {
        object = this.availableObjects.pop();
      }
      this.borrowedObjects.push(object);
    }
    return object;
  }

  returns(borrowedObject) {
    if (!(borrowedObject instanceof this.ObjectContructor)) {
      throw new Error(`Can't return object which is not a ${this.ObjectConstructor.name}`);
    }
    const index = this.borrowedObjects.indexOf(borrowedObject);
    if (index === -1) {
      if (this.availableObjects.includes(borrowedObject)) {
        throw new Error(`${this.ObjectContructor.name} already returned !`);
      }
      throw new Error(`Object given in Pool#returns() is not referenced in this Pool instance.`);
    }
    this.borrowedObjects.splice(index, 1);
    if (this.objectClearMethodName !== null) {
      try {
        borrowedObject[this.objectClearMethodName].call(borrowedObject);
      } catch (err) {
        if (typeof console === 'undefined') throw err;
        console.log(`Unable to call method ${this.objectClearMethodName} on object instance ${String(borrowedObject)}`)
      }
    }
    this.availableObjects.push(borrowedObject);
  }

  hasAvailables() {
    return this.size === -1 || this.borrowedObjects.length < this.size;
  }

  getCountAvailables() {
    return this.availableObjects.length;
  }

  getCountBorrowed() {
    return this.borrowedObjects.length;
  }

  toString() {
    return `Pool<${this.ObjectContructor.name}>(borrowed: ${this.getCountBorrowed()}, available: ${this.getCountAvailables()})`;
  }

}