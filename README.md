# patch-headers

Express middleware to patch response headers written by another handler or middleware.

## Usage

The module returns a function to build a middleware.
The function must be called with a single options object with one or more of the following properties:

- `allow`: An array that contains a whitelist of header names.
- `remove`: An array that contains a blacklist of header names.
- `static`: An object with key value pairs of static header names and values.
- `callback`: A function which has a single object parameter for the header key value pairs and returns an object in the same format.

Priority:

1. If `allow` is set, all headers other than the ones in `allow` are removed
1. If `remove` is set, all headers in `remove` are removed
1. If `static` is set, all `key: value` in `static` are added
1. If `callback` is set, all `key: value` in `callback(headers)` are added

By this logic, using a combination of `allow` and `remove` doesn't make much sense.

## Example

```js
// load the module
const patchHeaders = require('patchHeaders')

// add the routing
app.use(patchHeaders({
  allow: ['Content-Length', 'Content-Type'],
  static: {
    'Access-Control-Allow-Origin': '*'
  },
  callback (headers) {
    return {
      'Content-Length': headers['Content-Length'] + Math.random()
    }
  }
})
```
