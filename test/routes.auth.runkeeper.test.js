'use strict'

var should = require ('should')
var mockExpressApp
var utils = require('../lib/utils')
var helpers = require('./helpers')

describe('routes/auth/runkeeper', function () {

	beforeEach(function() {
		process.env.NODE_ENV = 'development'
		mockExpressApp = {
			get: function () {},
			post: function () {},
			use: function () {},
			lib: {
				auth: {},
				utils: utils
			}
		}
	})

	it ('When routes are set up ' +
		'Then a GET handler is created for /auth/runkeeper', function (done) {

		helpers.assertHandlerExists(done, '/auth/runkeeper', 'GET', true)
	})

	it ('When routes are set up ' +
		'Then middleware requiring authentication is used on the /auth/runkeeper route', function (done) {

		helpers.assertHandlerExists(done, '/auth/runkeeper', 'GET', true, true)
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
		mockExpressApp.get = function (uri, middleware, cb) {
			if (uri == '/auth/runkeeper') {
				middleware ({}, mockResponse)
			}
		}
		mockExpressApp.lib.auth = mockAuth

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
		mockExpressApp.get = function (uri, middleware, cb) {
			if (uri == '/auth/runkeeper') {
				cb (null, mockResponseObject)
			}
		}
		mockExpressApp.lib.rk = mockRunkeeperModule

		var routes = require('../lib/routes')(mockExpressApp)
		rkRedirection.should.equal(true)
	})
})

describe('/routes/auth/runkeeper/callback', function () {

	it ('When routes are set up ' +
		'Then a GET handler is created for /auth/runkeeper/callback', function (done) {

		helpers.assertHandlerExists(done, '/auth/runkeeper/callback', 'GET', true, true)
	})

	it ('Given there is no code argument in the request ' +
		'When the runkeeper callback is requested' +
		'Then an error is passed to the handler', function (done) {

		var mockRequest = {
			query: {}
		}
		var mockErrorHandler = function (e) {
			e.message.should.equal('No access code present in rk redirect.')
			done()
		}
		mockExpressApp.get = function (uri, middleware, cb) {
			if (uri == '/auth/runkeeper/callback') {
				cb (mockRequest, null, mockErrorHandler)
			}
		}
		require('../lib/routes')(mockExpressApp)
	})

})