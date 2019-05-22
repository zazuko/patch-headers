const hijackResponse = require('hijackresponse')

function includesIgnoreCase (array, value) {
  const lowerCaseValue = value.toLowerCase()
  return array.find((item) => item.toLowerCase() === lowerCaseValue) !== undefined
}

function patch (options, res) {
  const headers = res.getHeaders()

  // whitelist for headers
  if (options.allow) {
    Object.keys(headers).forEach((name) => {
      if (!includesIgnoreCase(options.allow, name)) {
        res.removeHeader(name)
      }
    })
  }

  // blacklist for headers
  if (options.remove) {
    Object.keys(headers).forEach((name) => {
      if (includesIgnoreCase(options.remove, name)) {
        res.removeHeader(name)
      }
    })
  }

  // add static headers
  if (options.static) {
    Object.entries(options.static)
      .forEach(([name, value]) => {
        // ignore null values
        if (value !== null) {
          res.setHeader(name, value)
        }
      })
  }

  // change headers with callback
  if (options.callback) {
    Object.entries(options.callback(headers))
      .forEach(([key, val]) => {
        res.setHeader(key, val)
      })
  }
}

function middleware (options = {}, req, res, next) {
  hijackResponse(res, (err, res) => {
    if (err) {
      res.unhijack()
      next(err)
      return
    }

    patch(options, res)

    res.pipe(res)
  })

  next()
}

function factory (options) {
  return middleware.bind(null, options)
}

factory.patch = patch
factory.middleware = middleware

module.exports = factory
