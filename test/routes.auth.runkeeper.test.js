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

	it ('When routes are set up\n' +
		'Then a GET handler is created for /auth/runkeeper', function (done) {

		helpers.assertHandlerExists(done, '/auth/runkeeper', 'GET', true)
	})

	it ('When routes are set up\n' +
		'Then middleware requiring authentication is used on the /auth/runkeeper route', function (done) {

		helpers.assertHandlerExists(done, '/auth/runkeeper', 'GET', true, true)
	})

	it ('Given the user is not authenticated\n' +
		'When the /auth/runkeeper url is requested\n' +
		'Then the response.redirect method is used to\n' +
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

	it ('Given the user is authenticated\n' +
		'When the /auth/runkeeper url is requested\n ' +
		'Then the response.redirect method is used to\n' +
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

	it ('Given the user is authenticated\n' +
		'And already connected to RukKeeper\n' +
		'When the /auth/runkeeper url is requested\n' +
		'Then index view is rendered without any redirect to RK authentication', function (done) {
		var rkRedirection = false
		var mockRequest = {
			session: {
				user: {
					identity: 'IDENTITY',
					rkCode: 'RK CODE'
				}
			}
		}
		var mockResponseObject = {
			render: function (viewname) {
				viewname.should.equal('index')
				rkRedirection.should.equal(false)
				done()
			}
		}
		var mockRunkeeperModule = {
			redirectToRKAuth: function (response) {
				rkRedirection = true
			}
		}
		mockExpressApp.get = function (uri, middleware, cb) {
			if (uri == '/auth/runkeeper') {
				cb (mockRequest, mockResponseObject)
			}
		}
		mockExpressApp.lib.rk = mockRunkeeperModule

		require('../lib/routes')(mockExpressApp)
	})
})

describe('/routes/auth/runkeeper/callback', function () {

	it ('When routes are set up\n' +
		'Then a GET handler is created for /auth/runkeeper/callback', function (done) {

		helpers.assertHandlerExists(done, '/auth/runkeeper/callback', 'GET', true, true)
	})

	it ('Given there is no code argument in the request\n' +
		'When the runkeeper callback is requested\n' +
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


	it ('Given there is a code argument in the request\n' +
		'When the runkeeper callback is requested\n' +
		'Then the code is recorded against the user\'s record', function (done) {

		var mockRequest = {
			query: {
				code: 'RK CODE'
			},
			session: {
				user: {
					identity: 'IDENTITY'
				}
			}
		}
		mockExpressApp.get = function (uri, middleware, cb) {
			if (uri == '/auth/runkeeper/callback') {
				cb (mockRequest)
			}
		}
		mockExpressApp.lib.db = {
			saveUserRKCode: function (identity, code) {
				identity.should.equal ('IDENTITY')
				code.should.equal('RK CODE')
				done()
			}
		}
		require('../lib/routes')(mockExpressApp)
	})

	it ('Given there is an error\n' +
		'When the recording a user\'s rk code\n' +
		'Then the error is passed to the error handler', function (done) {

		var error = new Error ('THIS IS THE ERROR')
		var mockRequest = {
			query: {
				code: 'RK CODE'
			},
			session: {
				user: {
					identity: 'IDENTITY'
				}
			}
		}
		var mockErrorHandler = function (e) {
			e.message.should.equal('THIS IS THE ERROR')
			done()
		}
		mockExpressApp.get = function (uri, middleware, cb) {
			if (uri == '/auth/runkeeper/callback') {
				cb (mockRequest, null, mockErrorHandler)
			}
		}
		mockExpressApp.lib.db = {
			saveUserRKCode: function (identity, code, cb) {
				cb(error)
			}
		}
		require('../lib/routes')(mockExpressApp)
	})

	it ('Given there is no error\n' +
		'When the recording a user\'s rk code\n' +
		'Then the index view is displayed, with a message', function (done) {

		var error = new Error ('THIS IS THE ERROR')
		var mockRequest = {
			query: {
				code: 'RK CODE'
			},
			session: {
				user: {
					identity: 'IDENTITY'
				}
			}
		}
		var mockResponse = {
			render: function (viewname, data) {
				viewname.should.equal('index')
				data.message.should.equal('Account successfully connected to RunKeeper.')
				done()
			}
		}
		mockExpressApp.get = function (uri, middleware, cb) {
			if (uri == '/auth/runkeeper/callback') {
				cb (mockRequest, mockResponse)
			}
		}
		mockExpressApp.lib.db = {
			saveUserRKCode: function (identity, code, cb) {
				cb(null)
			}
		}
		require('../lib/routes')(mockExpressApp)
	})

	it ('Given there is no error\n' +
		'When the recording a user\'s rk code\n' +
		'Then the session is updated with the user\'s rk connection', function (done) {

		var error = new Error ('THIS IS THE ERROR')
		var mockRequest = {
			query: {
				code: 'RK CODE'
			},
			session: {
				user: {
					identity: 'IDENTITY'
				}
			}
		}
		var mockResponse = {
			render: function () {
				mockRequest.session.user.rkCode.should.equal('RK CODE')
				done()
			}
		}
		mockExpressApp.get = function (uri, middleware, cb) {
			if (uri == '/auth/runkeeper/callback') {
				cb (mockRequest, mockResponse)
			}
		}
		mockExpressApp.lib.db = {
			saveUserRKCode: function (identity, code, cb) {
				cb(null)
			}
		}
		require('../lib/routes')(mockExpressApp)
	})


})