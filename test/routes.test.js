'use strict'

var should = require ('should')
var mockExpressApp
var utils = require('../lib/utils')

function assertHandlerExists (done, path, method, useMiddleware, useAuthMiddleware) {

	var correctUri = false
	var mockFn = function mockFn () {
		var who = 'i am the mock authentication middleware'
	}
	var mockAuth = {
		requiresAuthentication: mockFn
	}
	mockExpressApp.post = function (uri, fn) {
		if (uri == path) {
			if (method == 'POST') correctUri = true
		}
	}
	mockExpressApp.get = function (uri, fn1, fn2) {

		if (uri == path) {
			if (method == 'GET') correctUri = true
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
	}
	mockExpressApp.lib.auth = mockAuth

	var routes = require('../lib/routes')(mockExpressApp)
	correctUri.should.equal(true)
}

describe('routes', function () {

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


describe('error handling', function () {

	it ('Given headers have not been started ' +
		'When the error handler is invoked ' +
		'Then the error view is rendered ' +
		'And the response status is set to 500', function (done) {
		var mockError = new Error ('THIS IS THE ERROR')
		var mockResponse = {
			headersSent: false,
			render: function(viewName) {
				viewName.should.equal('error')
				done()
			}
		}

		mockExpressApp.use = function (cb) {
			cb(mockError, null, mockResponse)
		}

		var routes = require('../lib/routes')(mockExpressApp)
		mockResponse.status.should.equal(500)
	})

	it ('Given headers have already been started ' +
		'When the error handler is invoked ' +
		'Then the thrown error is given to Express to handle', function (done) {
		var mockError = new Error ('THIS IS THE ERROR')
		var mockResponse = {
			headersSent: true
		}
		var mockNext = function(e) {
			e.should.equal(mockError)
			done()
		}
		mockExpressApp.use = function (cb) {
			cb(mockError, null, mockResponse, mockNext)
		}

		var routes = require('../lib/routes')(mockExpressApp)
	})

	it ('Given the application is not running in production mode ' +
		'When the error handler is invoked ' +
		'Then the error message displayed is from the thrown error', function (done) {
		var mockError = new Error ('THIS IS THE ERROR')
		var mockResponse = {
			headersSent: false,
			render: function(viewName, data) {
				data.should.be.type('object')
				data.message.should.equal('THIS IS THE ERROR')
				done()
			}
		}

		mockExpressApp.use = function (cb) {
			cb(mockError, null, mockResponse)
		}

		var routes = require('../lib/routes')(mockExpressApp)
	})

	it ('Given the application is running in production mode ' +
		'When the error handler is invoked ' +
		'Then the error message displayed is sanitised', function (done) {
		process.env.NODE_ENV = 'production'
		var mockError = new Error ('THIS IS THE ERROR')
		var mockResponse = {
			headersSent: false,
			render: function(viewName, data) {
				data.should.be.type('object')
				data.message.should.equal('An unexpected error occurred.')
				done()
			}
		}

		mockExpressApp.use = function (cb) {
			cb(mockError, null, mockResponse)
		}

		var routes = require('../lib/routes')(mockExpressApp)
	})


})

describe('home', function () {

	it ('When routes are set up ' +
		'Then a GET handler is created for the root of the website', function (done) {

		assertHandlerExists(done, '/', 'GET')
	})

	it('When the GET / route is requested ' +
		'Then the index view is rendered', function (done) {

		var mockResponseObject = {
			render: function (viewName) {
				viewName.should.equal('index')
				done()
			}
		}

		mockExpressApp.get = function (uri, cb) {
			if (uri == '/') {
				cb (null, mockResponseObject)
			}
		}

		var routes = require('../lib/routes')(mockExpressApp)
	})
})

describe('auth', function () {
describe('runkeeper', function () {

	it ('When routes are set up ' +
		'Then a GET handler is created for /auth/runkeeper', function (done) {

		assertHandlerExists(done, '/auth/runkeeper', 'GET', true)
	})

	it ('When routes are set up ' +
		'Then middleware requiring authentication is used on the /auth/runkeeper route', function (done) {

		assertHandlerExists(done, '/auth/runkeeper', 'GET', true, true)
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
})
})