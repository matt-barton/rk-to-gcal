'use strict'

var should = require ('should')
var mockExpressApp
var utils = require('../../lib/utils')
var helpers = require('../helpers')

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

describe ('routes', function () {
describe ('auth', function () {
describe ('logout', function () {

	it('When routes are set up ' +
		'Then a GET handler is set up for /auth/logout', function (done) {

		helpers.assertHandlerExists(done, '/auth/logout', 'GET')
	})

	it('Given the user is not logged in ' +
		'When the /auth/logout route is requested ' +
		'Then the index view is rendered ' +
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

		require('../../lib/routes')(mockExpressApp)
		called.should.equal(false)
	})

	it('Given the user is logged in ' +
		'When the /auth/logout route is requested ' +
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
		require('../../lib/routes')(mockExpressApp)
	})

	it('Given the user is logged in ' +
		'When the /auth/logout route is requested ' +
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

		require('../../lib/routes')(mockExpressApp)
	})

})
})
})