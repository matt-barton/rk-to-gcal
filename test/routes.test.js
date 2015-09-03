'use strict'

var should = require ('should')

var mockExpressApp = {
	get: function () {}
}

var mockUtils = {
	buildUrl: function () {}
}

function assertHandlerExists (done, path, useMiddleware, useAuthMiddleware) {

	var correctUri = false
	var mockFn = function mockFn () {
		var who = 'i am the mock authentication middleware'
	}
	var mockAuth = {
		requiresAuthentication: mockFn
	}
	var mockExpressApp = {
		get: function (uri, fn1, fn2) {

			if (uri == path) {
				correctUri = true
				var fn1Type = typeof fn1
				var fn2Type = typeof fn2

				fn1Type.should.equal('function')
				fn2Type.should.equal(useMiddleware 
					? 'function' 
					: 'undefined')

				if (useAuthMiddleware) {
					fn1.should.equal(mockFn)
				}

				done()
			}
		},
		lib: {
			auth: mockAuth
		}
	}
	var routes = require('../lib/routes')(mockExpressApp)
	correctUri.should.equal(true)
}

describe('routes', function () {
	
	describe('home', function () {

		it ('When routes are set up ' +
			'Then a handler is created for the root of the website', function (done) {

			assertHandlerExists(done, '/')
		})
	})

	describe('auth', function () {

		it ('When routes are set up ' +
			'Then a get handler is created for /auth/runkeeper', function (done) {

			assertHandlerExists(done, '/auth/runkeeper', true)
		})

		it ('When routes are set up ' +
			'Then middleware requiring authentication is used on the /auth/runkeeper route', function (done) {

			assertHandlerExists(done, '/auth/runkeeper', true, true)

				/*
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
			*/
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

		it('When routes are set up ' +
			'Then a handler is set up for /auth/login', function (done) {
	
			assertHandlerExists(done, '/auth/login')
		})
	})
})