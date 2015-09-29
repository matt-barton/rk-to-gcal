'use strict'

var should = require ('should')
var mockExpressApp
var utils = require('../lib/utils')
var helpers = require('./helpers')

describe ('routes/auth/logout', function () {

	beforeEach(function() {
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

	it('When routes are set up\n ' +
		'Then a GET handler is set up for /auth/logout', function (done) {

		helpers.assertHandlerExists(done, '/auth/logout', 'GET')
	})

	it('Given the user is not logged in\n ' +
		'When the /auth/logout route is requested\n ' +
		'Then the index view is rendered\n ' +
		'And the session is left unaltered', function (done) {

		var called = false
		var mockRequest = {
			session: {}
		}

		var mockResponse = {
			render: function (viewName) {
				viewName.should.equal('index')
				done()
			}
		}

		mockExpressApp.get = function (route, cb) {
			if (route == '/auth/logout') {
				cb(mockRequest, mockResponse)
			}
		}
		mockExpressApp.lib.auth = {
			logout: function () {
				called = true
			}
		}

		require('../lib/routes')(mockExpressApp)
		called.should.equal(false)
	})

	it('Given the user is logged in\n ' +
		'When the /auth/logout route is requested\n ' +
		'Then the index view is rendered', function (done) {

		var mockRequest = {
			session: {
				user: {
					identity: 'IDENTITY'
				}
			}
		}

		var mockResponse = {
			render: function (viewName) {
				viewName.should.equal('index')
				done()
			}
		}

		mockExpressApp.get = function (route, cb) {
			if (route == '/auth/logout') {
				cb(mockRequest, mockResponse)
			}
		}
		mockExpressApp.lib.auth = {
			logout: function (request, cb) {
				cb()
			}
		}
		require('../lib/routes')(mockExpressApp)
	})

	it('Given the user is logged in\n ' +
		'When the /auth/logout route is requested\n ' +
		'Then the user info is cleared from the session', function (done) {

		var mockRequest = {
			session: {
				user: {
					identity: 'IDENTITY'
				}
			}
		}

		var mockResponse = {
			render: function () {
				done()
			}
		}

		mockExpressApp.get = function (route, cb) {
			if (route == '/auth/logout') {
				cb(mockRequest, mockResponse)
			}
		}
		mockExpressApp.lib.auth = {
			logout: function (request, cb) {
				request.should.equal(mockRequest)
				cb()
			}
		}

		require('../lib/routes')(mockExpressApp)
	})

})