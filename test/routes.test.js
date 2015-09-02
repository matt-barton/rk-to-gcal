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
			var auth = require('../lib/auth')
			var mockExpressApp = {
				get: function (uri, middleware, cb) {
					if (uri == '/auth/runkeeper') {
						correctUri = true
						if (typeof cb == 'function') handlerExists = true
						done()
					}
				},
				lib: {
					auth: auth
				}
			}

			var routes = require('../lib/routes')(mockExpressApp)
			correctUri.should.equal(true)
			handlerExists.should.equal(true)
		})

		it ('When routes are set up ' +
			'Then middleware requireing authentication is used on the /auth/runkeeper route', function (done) {
			var correctUri = false
			var auth = require('../lib/auth')
			var mockExpressApp = {
				get: function (uri, middleware, cb) {
					if (uri == '/auth/runkeeper') {
						correctUri = true
						middleware.should.equal(auth.requiresAuthentication)
						done()
					}
				},
				lib: {
					auth: auth
				}
			}

			var routes = require('../lib/routes')(mockExpressApp)
			correctUri.should.equal(true)
		})

		it ('Given the user is not authenticated ' +
			'When the /auth/runkeeper url is requested ' +
			'Then the response.redirect method is used to ' +
			'redirect the user to the /auth/login', function (done) {

			var mockAuth = {
				requiresAuthentication: function (req, res) {
					res.redirect('/auth/login')
				}
			}
			var mockResponse = {
				redirect: function(url) {
					url.should.equal('/auth/login')
					done()
				}
			}
			var mockExpressApp = {
				get: function (uri, middleware, cb) {
					if (uri == '/auth/runkeeper') {
						middleware ({}, mockResponse)
					}
				},
				lib: {
					auth: mockAuth
				}
			}

			var routes = require('../lib/routes')(mockExpressApp)
		})

		it ('Given the user is authenticated ' +
			'When the /auth/runkeeper url is requested ' +
			'Then the response.redirect method is used to ' +
			'redirect the user to the /auth/login', function (done) {
			var rkRedirection = false

			var mockAuth = {
				requiresAuthentication: function () {}
			}
			var mockResponseObject = {
				'i am': 'a mock'
			}
			var mockRunkeeperModule = {
				redirectToRKAuth: function (response) {
					rkRedirection = true
					response.should.equal(mockResponseObject)
					done()
				}
			}
			var mockExpressApp = {
				get: function (uri, middleware, cb) {
					if (uri == '/auth/runkeeper') {
						cb (null, mockResponseObject)
					}
				},
				lib: {
					auth: mockAuth,
					rk:   mockRunkeeperModule
				}
			}

			var routes = require('../lib/routes')(mockExpressApp)
			rkRedirection.should.equal(true)
		})
	})
})