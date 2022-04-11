/* global describe it */

const assert = require('assert')
const express = require('express')
const http = require('http')
const patchHeaders = require('..')
const request = require('supertest')

const wrap = (obj) => Object.assign(Object.create(null), obj)

describe('patch-headers', function () {
  describe('patch', function () {
    it("should add empty headers object if it's null", function () {
      const res = new http.ServerResponse({})

      patchHeaders.patch({}, res)

      assert.deepStrictEqual(res.getHeaders(), wrap({}))
    })

    it("should ignore allow if it's null", function () {
      const res = new http.ServerResponse({})

      res.setHeader('a', '1')
      res.setHeader('b', '2')

      patchHeaders.patch({ allow: null }, res)

      assert.deepStrictEqual(res.getHeaders(), wrap({
        a: '1',
        b: '2'
      }))
    })

    it('should remove headers not listed in allow', function () {
      const res = new http.ServerResponse({})

      res.setHeader('a', '1')
      res.setHeader('b', '2')

      patchHeaders.patch({ allow: ['a'] }, res)

      assert.deepStrictEqual(res.getHeaders(), wrap({
        a: '1'
      }))
    })

    it('should ignore case of allow values', function () {
      const res = new http.ServerResponse({})

      res.setHeader('a', '1')
      res.setHeader('b', '2')

      patchHeaders.patch({ allow: ['A'] }, res)

      assert.deepStrictEqual(res.getHeaders(), wrap({
        a: '1'
      }))
    })

    it("should ignore remove if it's null", function () {
      const res = new http.ServerResponse({})

      res.setHeader('a', '1')
      res.setHeader('b', '2')

      patchHeaders.patch({ remove: null }, res)

      assert.deepStrictEqual(res.getHeaders(), wrap({
        a: '1',
        b: '2'
      }))
    })

    it('should remove headers listed in remove', function () {
      const res = new http.ServerResponse({})

      res.setHeader('a', '1')
      res.setHeader('b', '2')

      patchHeaders.patch({ remove: ['a'] }, res)

      assert.deepStrictEqual(res.getHeaders(), wrap({
        b: '2'
      }))
    })

    it('should ignore case of remove values', function () {
      const res = new http.ServerResponse({})

      res.setHeader('a', '1')
      res.setHeader('b', '2')

      patchHeaders.patch({ remove: ['A'] }, res)

      assert.deepStrictEqual(res.getHeaders(), wrap({
        b: '2'
      }))
    })

    it("should ignore static if it's null", function () {
      const res = new http.ServerResponse({})

      res.setHeader('a', '1')
      res.setHeader('b', '2')

      patchHeaders.patch({ static: null }, res)

      assert.deepStrictEqual(res.getHeaders(), wrap({
        a: '1',
        b: '2'
      }))
    })

    it('should ignore static if the property value is null', function () {
      const res = new http.ServerResponse({})

      res.setHeader('a', '1')
      res.setHeader('b', '2')

      patchHeaders.patch({ static: { a: null } }, res)

      assert.deepStrictEqual(res.getHeaders(), wrap({
        a: '1',
        b: '2'
      }))
    })

    it('should add headers defined in static', function () {
      const res = new http.ServerResponse({})

      res.setHeader('a', '1')
      res.setHeader('b', '2')

      patchHeaders.patch({ static: { c: '3' } }, res)

      assert.deepStrictEqual(res.getHeaders(), wrap({
        a: '1',
        b: '2',
        c: '3'
      }))
    })

    it("should ignore callback if it's null", function () {
      const res = new http.ServerResponse({})

      res.setHeader('a', '1')
      res.setHeader('b', '2')

      patchHeaders.patch({ callback: null }, res)

      assert.deepStrictEqual(res.getHeaders(), wrap({
        a: '1',
        b: '2'
      }))
    })

    it('should use callback to change headers', function () {
      const res = new http.ServerResponse({})

      res.setHeader('a', '1')
      res.setHeader('b', '2')

      const patch = function (headers) {
        headers.a = (parseInt(headers.a) + 2).toString()

        return headers
      }

      patchHeaders.patch({ callback: patch }, res)

      assert.deepStrictEqual(res.getHeaders(), wrap({
        a: '3',
        b: '2'
      }))
    })
  })

  describe('middleware', function () {
    it("should hijack the response and patch the headers', function", (done) => {
      const app = express()

      app.use(function (req, res, next) {
        patchHeaders.middleware({
          static: {
            a: '1'
          }
        }, req, res, next)
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
    it('should build a middleware', (done) => {
      const app = express()

      app.use(patchHeaders({ static: { a: '1' } }))

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
