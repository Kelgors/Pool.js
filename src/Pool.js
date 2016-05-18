function set_constant(instance, key, value) {
  Object.defineProperty(instance, key, {
    writable: false, configurable: false,
    value: value
  });
}

export default class Pool {
  constructor(ObjectConstructor, size = -1, { clearMethodName = null, destroyMethodName = null, isFactory = false } = {}) {
    this.size = size;
    set_constant(this, 'ObjectConstructor', ObjectConstructor);
    set_constant(this, 'objectClearMethodName', clearMethodName);
    set_constant(this, 'objectDestroyMethodName', destroyMethodName);
    set_constant(this, 'objectConstructorIsFactory', isFactory);
    set_constant(this, 'borrowedObjects', []);
    set_constant(this, 'availableObjects', []);
    set_constant(this, 'awaitCallbacks', []);
  }

  destroy() {
    this._destroyChildren(this.borrowedObjects);
    this._destroyChildren(this.availableObjects);
    if (this.awaitCallbacks.length) {
      this.awaitCallbacks.splice(0, this.awaitCallbacks.length);
    }
  }

  _destroyChildren(arrayOfObjects) {
    const methodName = this.objectDestroyMethodName || this.objectClearMethodName;
    if (!methodName) {
      // just empty it
      arrayOfObjects.splice(0, arrayOfObjects.length);
      return;
    }
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

  await() {
    if (this.hasAvailables()) return Promise.resolve(this.borrows());
    return new Promise((resolve, reject) => {
      this.awaitCallbacks.push(resolve);
    });
  }

  borrows() {
    let object = null;
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

  returns(borrowedObject) {
    if (!this.objectConstructorIsFactory && !(borrowedObject instanceof this.ObjectConstructor)) {
      throw new Error(`Can't return object which is not a ${this.ObjectConstructor.name}`);
    }
    const index = this.borrowedObjects.indexOf(borrowedObject);
    if (index === -1) {
      if (this.availableObjects.indexOf(borrowedObject) > -1) {
        throw new Error(`${this.ObjectConstructor.name} already returned !`);
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
    if (this._onObjectReturned) this._onObjectReturned();
  }

  hasAvailables() {
    return this.size === -1 || this.borrowedObjects.length < this.size;
  }

  getCountAvailables() {
    return (this.size === -1 ? Number.MAX_SAFE_INTEGER : this.size) - this.getCountBorrowed();
  }

  getCountBorrowed() {
    return this.borrowedObjects.length;
  }

  toString() {
    return `Pool<${this.ObjectConstructor.name}>(borrowed: ${this.getCountBorrowed()}, available: ${this.getCountAvailables()})`;
  }

  _onObjectReturned() {
    console.log('_onObjectReturned');
    if (this.awaitCallbacks.length && this.hasAvailables()) {
      const resolver = this.awaitCallbacks.shift();
      resolver(this.borrows());
    }
  }

}