'use strict'

var should = require ('should')
var mockExpressApp
var utils = require('../../lib/utils')

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

	var routes = require('../../lib/routes')(mockExpressApp)
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

describe('auth', function () {
describe ('register', function () {

	it('When routes are set up ' +
		'Then a GET handler is set up for /auth/register', function (done) {

		assertHandlerExists(done, '/auth/register', 'GET')
	})

	it('When the GET /auth/register routes is requested ' +
		'Then the register view is rendered', function (done) {

		var mockResponseObject = {
			render: function (viewName) {
				viewName.should.equal('register')
				done()
			}
		}

		mockExpressApp.get = function (uri, cb) {
			if (uri == '/auth/register') {
				cb (null, mockResponseObject)
			}
		}

		var routes = require('../../lib/routes')(mockExpressApp)
	})

	it('When routes are set up ' +
		'Then a POST handler is set up for /auth/register', function (done) {

		assertHandlerExists(done, '/auth/register', 'POST')
	})


	it ('Given the request data does not contain an identity field ' +
		'When the /auth/register route is posted to ' +
		'Then the register view is rendered with an error message', function (done) {

		var mockResponse = {
			render: function (viewName, data) {
				viewName.should.equal('register')
				data.should.be.type('object')
				data.registrationError.should.equal('Email address is required')
				done()
			}
		}

		var mockRequest = {
			body: {}
		}

		mockExpressApp.post = function (uri, cb) {
			if (uri == '/auth/register') {
				cb (mockRequest, mockResponse)
			}
		}

		var routes = require('../../lib/routes')(mockExpressApp)
	})

	it ('Given the request data does not contain a password field ' +
		'When the /auth/register route is posted to ' +
		'Then the register view is rendered with an error message', function (done) {

		var mockResponse = {
			render: function (viewName, data) {
				viewName.should.equal('register')
				data.should.be.type('object')
				data.registrationError.should.equal('Password is required')
				done()
			}
		}

		var mockRequest = {
			body: {
				identity: 'IDENTITY'
			}
		}

		mockExpressApp.post = function (uri, cb) {
			if (uri == '/auth/register') {
				cb (mockRequest, mockResponse)
			}
		}

		var routes = require('../../lib/routes')(mockExpressApp)
	})

	it ('Given the request data does not contain a password repeat field ' +
		'When the /auth/register route is posted to ' +
		'Then the register view is rendered with an error message', function (done) {

		var mockResponse = {
			render: function (viewName, data) {
				viewName.should.equal('register')
				data.should.be.type('object')
				data.registrationError.should.equal('Password is required twice')
				done()
			}
		}

		var mockRequest = {
			body: {
				identity: 'IDENTITY',
				password: 'PASSWORD'
			}
		}

		mockExpressApp.post = function (uri, cb) {
			if (uri == '/auth/register') {
				cb (mockRequest, mockResponse)
			}
		}

		var routes = require('../../lib/routes')(mockExpressApp)
	})

	it ('Given the request data contains only whitespace in the identity field ' +
		'When the /auth/register route is posted to ' +
		'Then the register view is rendered with an error message', function (done) {

		var mockResponse = {
			render: function (viewName, data) {
				viewName.should.equal('register')
				data.should.be.type('object')
				data.registrationError.should.equal('Email address is required')
				done()
			}
		}

		var mockRequest = {
			body: {
				identity: '   '
			}
		}

		mockExpressApp.post = function (uri, cb) {
			if (uri == '/auth/register') {
				cb (mockRequest, mockResponse)
			}
		}

		var routes = require('../../lib/routes')(mockExpressApp)
	})

	it ('Given the request data contains only whitespace in the password field ' +
		'When the /auth/register route is posted to ' +
		'Then the register view is rendered with an error message', function (done) {

		var mockResponse = {
			render: function (viewName, data) {
				viewName.should.equal('register')
				data.should.be.type('object')
				data.registrationError.should.equal('Password is required')
				done()
			}
		}

		var mockRequest = {
			body: {
				identity: 'IDENTITY',
				password: '    '
			}
		}

		mockExpressApp.post = function (uri, cb) {
			if (uri == '/auth/register') {
				cb (mockRequest, mockResponse)
			}
		}

		var routes = require('../../lib/routes')(mockExpressApp)
	})


	it ('Given the request data contains only whitespace in the password repeat field ' +
		'When the /auth/register route is posted to ' +
		'Then the register view is rendered with an error message', function (done) {

		var mockResponse = {
			render: function (viewName, data) {
				viewName.should.equal('register')
				data.should.be.type('object')
				data.registrationError.should.equal('Password is required twice')
				done()
			}
		}

		var mockRequest = {
			body: {
				identity: 'IDENTITY',
				password: 'PASSWORD',
				pwRepeat: '   '
			}
		}

		mockExpressApp.post = function (uri, cb) {
			if (uri == '/auth/register') {
				cb (mockRequest, mockResponse)
			}
		}

		var routes = require('../../lib/routes')(mockExpressApp)
	})

	it ('Given the supplied password and repeat fields do not match ' +
		'When the /auth/register route is posted to ' +
		'Then the register view is rendered with an error message', function (done) {

		var mockResponse = {
			render: function (viewName, data) {
				viewName.should.equal('register')
				data.should.be.type('object')
				data.registrationError.should.equal('Password and Repeat do not match')
				done()
			}
		}

		var mockRequest = {
			body: {
				identity: 'IDENTITY',
				password: 'PASSWORD',
				pwRepeat: 'POTATOES'
			}
		}

		mockExpressApp.post = function (uri, cb) {
			if (uri == '/auth/register') {
				cb (mockRequest, mockResponse)
			}
		}

		var routes = require('../../lib/routes')(mockExpressApp)
	})

	it ('Given the supplied password and repeat fields do match ' +
		'And the password field is less than 10 characters in length ' +
		'When the /auth/register route is posted to ' +
		'Then the register view is rendered with an error message', function (done) {

		var mockResponse = {
			render: function (viewName, data) {
				viewName.should.equal('register')
				data.should.be.type('object')
				data.registrationError.should.equal('Password should be 10 characters or longer')
				done()
			}
		}

		var mockRequest = {
			body: {
				identity: 'IDENTITY',
				password: 'PASSWORD',
				pwRepeat: 'PASSWORD'
			}
		}

		mockExpressApp.post = function (uri, cb) {
			if (uri == '/auth/register') {
				cb (mockRequest, mockResponse)
			}
		}

		var routes = require('../../lib/routes')(mockExpressApp)
	})

	it ('Given the supplied password and repeat fields do match ' +
		'And the password field is the same as the identity field ' +
		'When the /auth/register route is posted to ' +
		'Then the register view is rendered with an error message', function (done) {

		var mockResponse = {
			render: function (viewName, data) {
				viewName.should.equal('register')
				data.should.be.type('object')
				data.registrationError.should.equal('Password cannot be the same as your email address')
				done()
			}
		}

		var mockRequest = {
			body: {
				identity: 'IDENTITYIDENTITY',
				password: 'IDENTITYIDENTITY',
				pwRepeat: 'IDENTITYIDENTITY'
			}
		}

		mockExpressApp.post = function (uri, cb) {
			if (uri == '/auth/register') {
				cb (mockRequest, mockResponse)
			}
		}

		var routes = require('../../lib/routes')(mockExpressApp)
	})

	it ('Given the supplied password and repeat fields match ' +
		'And the identity field is valid ' +
		'When the /auth/register route is posted to ' +
		'Then the user is registered with the auth module', function (done) {

		var mockRequest = {
			body: {
				identity: 'IDENTITY',
				password: 'VALIDPASSWORD',
				pwRepeat: 'VALIDPASSWORD'
			}
		}
		var mockAuth = {
			register: function (request) {
				request.should.equal(mockRequest)
				done()
			}
		}
		mockExpressApp.post = function (uri, cb) {
			if (uri == '/auth/register') {
				cb (mockRequest)
			}
		}
		mockExpressApp.lib.auth = mockAuth

		var routes = require('../../lib/routes')(mockExpressApp)
	})

	it ('Given an error is thrown ' +
		'When the user is registered ' +
		'Then the error is passed to the error handler middleware', function (done) {

		var error = new Error ('The Error')
		var mockRequest = {
			body: {
				identity: 'IDENTITY',
				password: 'VALIDPASSWORD',
				pwRepeat: 'VALIDPASSWORD'
			}
		}
		var mockAuth = {
			register: function (request, cb) {
				cb(error)
			}
		}
		var mockErrorHandler = function (e) {
			e.should.equal(error)
			done()
		}
		mockExpressApp.post = function (uri, cb) {
			if (uri == '/auth/register') {
				cb (mockRequest, null, mockErrorHandler)
			}
		}
		mockExpressApp.lib.auth = mockAuth

		var routes = require('../../lib/routes')(mockExpressApp)
	})
})
})
})
