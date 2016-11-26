/* global describe it */

var assert = require('assert')
var express = require('express')
var http = require('http')
var patchHeaders = require('..')
var request = require('supertest')

describe('patch-headers', function () {
  describe('patch', function () {
    it('should add empty headers object if it\'s null', function () {
      var res = new http.ServerResponse({})

      patchHeaders.patch({}, res)

      assert.deepEqual(res._headers, {})
    })

    it('should ignore allow if it\'s null', function () {
      var res = new http.ServerResponse({})

      res.setHeader('a', '1')
      res.setHeader('b', '2')

      patchHeaders.patch({allow: null}, res)

      assert.deepEqual(res._headers, {
        'a': '1',
        'b': '2'
      })
    })

    it('should remove headers not listed in allow', function () {
      var res = new http.ServerResponse({})

      res.setHeader('a', '1')
      res.setHeader('b', '2')

      patchHeaders.patch({allow: ['a']}, res)

      assert.deepEqual(res._headers, {
        'a': '1'
      })
    })

    it('should ignore case of allow values', function () {
      var res = new http.ServerResponse({})

      res.setHeader('a', '1')
      res.setHeader('b', '2')

      patchHeaders.patch({allow: ['A']}, res)

      assert.deepEqual(res._headers, {
        'a': '1'
      })
    })

    it('should ignore remove if it\'s null', function () {
      var res = new http.ServerResponse({})

      res.setHeader('a', '1')
      res.setHeader('b', '2')

      patchHeaders.patch({remove: null}, res)

      assert.deepEqual(res._headers, {
        'a': '1',
        'b': '2'
      })
    })

    it('should remove headers listed in remove', function () {
      var res = new http.ServerResponse({})

      res.setHeader('a', '1')
      res.setHeader('b', '2')

      patchHeaders.patch({remove: ['a']}, res)

      assert.deepEqual(res._headers, {
        'b': '2'
      })
    })

    it('should ignore case of remove values', function () {
      var res = new http.ServerResponse({})

      res.setHeader('a', '1')
      res.setHeader('b', '2')

      patchHeaders.patch({remove: ['A']}, res)

      assert.deepEqual(res._headers, {
        'b': '2'
      })
    })

    it('should ignore static if it\'s null', function () {
      var res = new http.ServerResponse({})

      res.setHeader('a', '1')
      res.setHeader('b', '2')

      patchHeaders.patch({static: null}, res)

      assert.deepEqual(res._headers, {
        'a': '1',
        'b': '2'
      })
    })

    it('should add headers defined in static', function () {
      var res = new http.ServerResponse({})

      res.setHeader('a', '1')
      res.setHeader('b', '2')

      patchHeaders.patch({static: {'c': '3'}}, res)

      assert.deepEqual(res._headers, {
        'a': '1',
        'b': '2',
        'c': '3'
      })
    })

    it('should ignore callback if it\'s null', function () {
      var res = new http.ServerResponse({})

      res.setHeader('a', '1')
      res.setHeader('b', '2')

      patchHeaders.patch({callback: null}, res)

      assert.deepEqual(res._headers, {
        'a': '1',
        'b': '2'
      })
    })

    it('should use callback to change headers', function () {
      var res = new http.ServerResponse({})

      res.setHeader('a', '1')
      res.setHeader('b', '2')

      var patch = function (headers) {
        headers['a'] = (parseInt(headers['a']) + 2).toString()

        return headers
      }

      patchHeaders.patch({callback: patch}, res)

      assert.deepEqual(res._headers, {
        'a': '3',
        'b': '2'
      })
    })
  })

  describe('middleware', function () {
    it('should hijack the response and patch the headers', function (done) {
      var app = express()

      app.use(function (req, res, next) {
        patchHeaders.middleware({static: {
          'a': '1'
        }}, req, res, next)
      })

      app.use(function (req, res) {
        res.end('test')
      })

      request(app)
        .get('/')
        .expect('a', '1')
        .expect(200, done)
    })
  })

  describe('factory', function () {
    it('should build a middleware', function (done) {
      var app = express()

      app.use(patchHeaders({static: {'a': '1'}}))

      app.use(function (req, res) {
        res.end('test')
      })

      request(app)
        .get('/')
        .expect('a', '1')
        .expect(200, done)
    })
  })
})
