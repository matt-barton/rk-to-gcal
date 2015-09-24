'use strict'

var should = require ('should')
var mockExpressApp
var utils = require('../lib/utils')
var helpers = require('./helpers')

describe('routes/auth/login', function () {

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

	it('When routes are set up ' +
		'Then a GET handler is set up for /auth/login', function (done) {

		helpers.assertHandlerExists(done, '/auth/login', 'GET')
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

		helpers.assertHandlerExists(done, '/auth/login', 'POST')
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
			login: function (request) {
				request.body.identity.should.equal('IDENTITY')
				request.body.password.should.equal('PASSWORD')
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
		'Then the index view is rendered', function (done) {

		var mockRequest = {
			body: {
				identity: 'IDENTITY',
				password: 'PASSWORD'
			}
		}
		var mockResponse = {
			render: function (viewName) {
				viewName.should.equal('index')
				done()
			}
		}
		var mockAuth = {
			login: function (request, cb) {
				cb(null, {})
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
			login: function (request, cb) {
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
		'Then the error is passed to the error handler middleware', function (done) {

		var mockRequest = {
			body: {
				identity: 'IDENTITY',
				password: 'PASSWORD'
			}
		}
		var error = new Error ('THIS IS THE ERROR')
		var mockAuth = {
			login: function (request, cb) {
				cb(error)
			}
		}
		var mockErrorHandler = function (e) {
			e.should.equal(error)
			done()
		}
		mockExpressApp.post = function (uri, cb) {
			if (uri == '/auth/login') {
				cb (mockRequest, {}, mockErrorHandler)
			}
		}
		mockExpressApp.lib.auth = mockAuth

		var routes = require('../lib/routes')(mockExpressApp)
	})

})
