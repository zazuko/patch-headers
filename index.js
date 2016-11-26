var hijackResponse = require('hijackresponse')

function includesIgnoreCase (array, value) {
  var valueLowerCase = value.toLowerCase()

  return array.filter(function (item) {
    return item.toLowerCase() === valueLowerCase
  }).length > 0
}

function patch (options, res) {
  res._headers = res._headers || {}

  // white list for headers
  if (options.allow) {
    Object.keys(res._headers).forEach(function (name) {
      if (!includesIgnoreCase(options.allow, name)) {
        res.removeHeader(name)
      }
    })
  }

  // black list for headers
  if (options.remove) {
    Object.keys(res._headers).forEach(function (name) {
      if (includesIgnoreCase(options.remove, name)) {
        res.removeHeader(name)
      }
    })
  }

  // add static headers
  if (options.static) {
    Object.keys(options.static).forEach(function (name) {
      res.setHeader(name, options.static[name])
    })
  }

  // change headers with callback
  if (options.callback) {
    res._headers = options.callback(res._headers)
  }
}

function middleware (options, req, res, next) {
  options = options || {}

  hijackResponse(res, function (err, res) {
    if (err) {
      res.unhijack()

      return next(err)
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
