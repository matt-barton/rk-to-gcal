'use strict'

var should = require ('should')

var mockExpressApp = {
	get: function () {}
}

var mockUtils = {
	buildUrl: function () {}
}

describe('routes', function () {
	
	describe('runkeeper', function () {

		it ('When routes are set up ' +
			'Then a get handler is created for /auth/runkeeper', function (done) {
			var correctUri = false
			var handlerExists = false
			var mockExpressApp = {
				get: function (uri, cb) {
					if (uri == '/auth/runkeeper') {
						correctUri = true
						if (typeof cb == 'function') handlerExists = true
						done()
					}
				}
			}

			var routes = require('../lib/routes')(mockExpressApp)
			correctUri.should.equal(true)
			handlerExists.should.equal(true)
		})

		it ('Given the /auth/runkeeper url is requested ' +
			'When a user makes a request ' +
			'Then the runkeeper module is asked to ' +
			'redirect the user to the rk auth page', function (done) {

			var rkRedirection = false
			var mockExpressApp = {
				get: function (uri, cb) {
					if (uri == '/auth/runkeeper') {
						cb ()
					}
				}
			}
			var mockRunkeeperModule = {
				redirectToRKAuth: function () {
					rkRedirection = true
					done()
				}
			}

			var routes = require('../lib/routes')(mockExpressApp, mockRunkeeperModule)
			rkRedirection.should.equal(true)
		})

		it ('Given the /auth/runkeeper url is requested ' +
			'When a user makes a request ' +
			'Then the runkeeper module is supplied with ' +
			'the express response object', function (done) {

			var mockResponseObject = {
				'i am': 'a mock'
			}
			var rkRedirection = false
			var mockExpressApp = {
				get: function (uri, cb) {
					if (uri == '/auth/runkeeper') {
						cb (null, mockResponseObject)
					}
				}
			}
			var mockRunkeeperModule = {
				redirectToRKAuth: function (response) {
					rkRedirection = true
					response.should.equal(mockResponseObject)
					done()
				}
			}

			var routes = require('../lib/routes')(mockExpressApp, mockRunkeeperModule)
			rkRedirection.should.equal(true)
		})

	})
})