# patch-headers

Express middleware to patch response headers written by another handler or middleware.

## Usage

The module returns a function to build a middleware.
The function must be called with a single options object with one or more of the following properties:

- `allow`: An array that contains a whitelist of header names.
- `remove`: An array that contains a blacklist of header names.
- `static`: An object with key value pairs of static header names and values.
- `callback`: A function which has a single object parameter for the header key value pairs and returns an object in the same format.

## Example

```js
// load the module
const patchHeaders = require('patchHeaders')

// add the routing
app.use(patchHeaders({
  allow: ['Content-Length', 'Content-Type'],
  static: {
    'Access-Control-Allow-Origin': '*'
  }
})
```
