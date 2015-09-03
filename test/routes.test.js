'use strict'

var should = require ('should')

var mockExpressApp = {
	get: function () {}
}

var mockUtils = {
	buildUrl: function () {}
}

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
	mockExpressApp.lib = {
		auth: mockAuth
	}

	var routes = require('../lib/routes')(mockExpressApp)
	correctUri.should.equal(true)
}

describe('routes', function () {

var mockExpressApp

beforeEach(function() {
	mockExpressApp = {
		get: function () {},
		post: function () {},
		lib: {
			auth: {}
		}
	}
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

describe ('login', function () {

	it('When routes are set up ' +
		'Then a GET handler is set up for /auth/login', function (done) {

		assertHandlerExists(done, '/auth/login', 'GET')
	})

	it('When the GET /auth/login routes is requested ' +
		'Then the login view is rendered', function (done) {

		var mockResponseObject = {
			render: function (viewName) {
				viewName.should.equal('login')
				done()
			}
		}

		mockExpressApp.get = function (uri, cb) {
			if (uri == '/auth/login') {
				cb (null, mockResponseObject)
			}
		}

		var routes = require('../lib/routes')(mockExpressApp)
	})

	it('When routes are set up ' +
		'Then a POST handler is set up for /auth/login', function (done) {

		assertHandlerExists(done, '/auth/login', 'POST')
	})


	it ('Given the request data does not contain an identity field ' +
		'When the /auth/login route is posted to ' +
		'Then the login view is rendered with an error message', function (done) {

		var mockResponse = {
			render: function (viewName, data) {
				viewName.should.equal('login')
				data.should.be.type('object')
				data.loginError.should.equal('Unknown email address or password')
				done()
			}
		}

		var mockRequest = {
			body: {}
		}

		mockExpressApp.post = function (uri, cb) {
			if (uri == '/auth/login') {
				cb (mockRequest, mockResponse)
			}
		}

		var routes = require('../lib/routes')(mockExpressApp)
	})

	it ('Given the request data contains an identity field ' +
		'But not a password ' +
		'When the /auth/login route is posted to ' +
		'Then the login view is rendered with an error message', function (done) {

		var mockResponse = {
			render: function (viewName, data) {
				viewName.should.equal('login')
				data.should.be.type('object')
				data.loginError.should.equal('Password is required')
				done()
			}
		}

		var mockRequest = {
			body: {
				identity: 'IDENTITY'
			}
		}

		mockExpressApp.post = function (uri, cb) {
			if (uri == '/auth/login') {
				cb (mockRequest, mockResponse)
			}
		}

		var routes = require('../lib/routes')(mockExpressApp)
	})

	it ('Given the request data contains an identity and a password ' +
		'When the /auth/login route is posted to ' +
		'Then the login is validated', function (done) {

		var mockRequest = {
			body: {
				identity: 'IDENTITY',
				password: 'PASSWORD'
			}
		}
		var mockAuth = {
			login: function (username, password) {
				username.should.equal('IDENTITY')
				password.should.equal('PASSWORD')
				done()
			}
		}
		mockExpressApp.post = function (uri, cb) {
			if (uri == '/auth/login') {
				cb (mockRequest)
			}
		}
		mockExpressApp.lib.auth = mockAuth

		var routes = require('../lib/routes')(mockExpressApp)
	})

	it ('Given the posted identity and password are valid ' +
		'When the /auth/login route is posted to ' +
		'Then the account view is rendered', function (done) {

		var mockRequest = {
			body: {
				identity: 'IDENTITY',
				password: 'PASSWORD'
			}
		}
		var mockResponse = {
			render: function (viewName) {
				viewName.should.equal('account')
				done()
			}
		}
		var mockAuth = {
			login: function (username, password, cb) {
				cb(null, true)
			}
		}
		mockExpressApp.post = function (uri, cb) {
			if (uri == '/auth/login') {
				cb (mockRequest, mockResponse)
			}
		}
		mockExpressApp.lib.auth = mockAuth

		var routes = require('../lib/routes')(mockExpressApp)
	})

	it ('Given the posted identity and password are not valid ' +
		'When the /auth/login route is posted to ' +
		'Then the login view is rendered with an error message', function (done) {

		var mockRequest = {
			body: {
				identity: 'IDENTITY',
				password: 'PASSWORD'
			}
		}
		var mockResponse = {
			render: function (viewName, data) {
				viewName.should.equal('login')
				data.should.be.type('object')
				data.loginError.should.equal('Unknown email address or password')
				done()
			}
		}
		var mockAuth = {
			login: function (username, password, cb) {
				cb(null, false)
			}
		}
		mockExpressApp.post = function (uri, cb) {
			if (uri == '/auth/login') {
				cb (mockRequest, mockResponse)
			}
		}
		mockExpressApp.lib.auth = mockAuth

		var routes = require('../lib/routes')(mockExpressApp)
	})


	it ('Given an error occurs while validating a login ' +
		'When the /auth/login route is posted to ' +
		'Then the error view is rendered', function (done) {

		var mockRequest = {
			body: {
				identity: 'IDENTITY',
				password: 'PASSWORD'
			}
		}
		var mockResponse = {
			render: function (viewName) {
				viewName.should.equal('error')
				done()
			}
		}
		var mockAuth = {
			login: function (username, password, cb) {
				cb(true)
			}
		}
		mockExpressApp.post = function (uri, cb) {
			if (uri == '/auth/login') {
				cb (mockRequest, mockResponse)
			}
		}
		mockExpressApp.lib.auth = mockAuth

		var routes = require('../lib/routes')(mockExpressApp)
	})

})
})
})