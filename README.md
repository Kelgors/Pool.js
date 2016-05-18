# Pool.js

A simple pool system (available in amd, commonjs, systemjs and globals)

To view an example of use: [BufferedListView.js](https://github.com/Kelgors/BufferedListView.js). This example use a pool to limit instaciation of ItemView in the list.

```bash
npm install pool.js
bower install pool.js
```

### How-To

```javascript
// Imagine you've got this "class"
function View(blah) {
  this.el = document.createElement('div');
}
View.prototype.clear = function clear() { this.el.innerHTML = ''; };
View.prototype.destroy = function destroy() { this.el = null; };
View.prototype.render = function render() { this.el.innerHTML = '<div>Hello you</div>'; };
```

```javascript
// Create a pool of View
var pool = new Pool(View, -1, {
  clearMethodName: 'clear',
  destroyMethodName: 'destroy',
  isFactory: false
});

var view = pool.borrows();
view.render();
// (...) and later
pool.returns(view);
// during returns, the pool call the clear method on all elements created by it if clearMethodName is defined.

// (...) and later again. You dont need this pool anymore
pool.destroy();
// during destroy, the pool call the destroy method on all elements created by it if destroyMethodName is defined

```

You can also have a factory instead of a Constructor

```javascript
function createView() {
  return new View();
}
var pool = new Pool(createView, -1, { isFactory: true });

var view = pool.borrows();
// no items was created, so the pool use the method as a factory (without 'new' keyword)
```
