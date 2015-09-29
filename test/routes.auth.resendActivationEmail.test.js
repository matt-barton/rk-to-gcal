'use strict'

'use strict'

var should = require ('should')
var mockExpressApp
var utils = require('../lib/utils')
var helpers = require('./helpers')


describe ('routes/auth/resendActivationEmail', function () {

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
		'Then a GET handler is set up for /auth/resendActivationEmail', function (done) {

		helpers.assertHandlerExists(done, '/auth/resendActivationEmail', 'GET', true, true)
	})

	it ('Given the session contains user information\n ' +
		'When the activation email is requested to be sent \n' +
		'Then the user information is passed to the emailer', function (done) {

		var mockUser = {
			identity: 'IDENTITY',
			activationCode: 'ACTIVATION CODE'
		}
		var mockRequest = {
			session: {
				user: mockUser
			},
			headers: {
				host: 'HOST'
			}
		}
		var mockResponse = {
			render: function () {}
		}
		mockExpressApp.lib.emailer = {
			sendIdentityConfirmation: function (recipient) {
				recipient.should.equal(mockUser)
				done()
			}
		}
		mockExpressApp.get = function (route, middleWare, cb) {
			if (route == '/auth/resendActivationEmail') {
				cb(mockRequest, mockResponse)
			}
		}
		require('../lib/routes')(mockExpressApp)
	})

	it ('Given the request contains site host information\n ' +
		'When the activation email is requested to be sent\n ' +
		'Then the site host information is passed to the emailer', function (done) {

		var mockRequest = {
			session: {
				user: {a: 1}
			},
			headers: {
				host: 'HOST'
			}
		}
		var mockResponse = {
			render: function () {}
		}
		mockExpressApp.lib.emailer = {
			sendIdentityConfirmation: function (recipient, host) {
				host.should.equal('HOST')
				done()
			}
		}
		mockExpressApp.get = function (route, middleWare, cb) {
			if (route == '/auth/resendActivationEmail') {
				cb(mockRequest, mockResponse)
			}
		}
		require('../lib/routes')(mockExpressApp)
	})
	it ('Given the session does not contain user information\n ' +
		'When the activation email is requested to be sent\n ' +
		'Then an error passed to the error handler', function (done) {

		var mockRequest = {
			session: {},
			headers: {
				host: 'HOST'
			}
		}
		var mockNext = function(e) {
			e.should.exist
			e.message.should.equal('No user information in session.')
			done()
		}

		mockExpressApp.get = function (route, middleWare, cb) {
			if (route == '/auth/resendActivationEmail') {
				cb(mockRequest, null, mockNext)
			}
		}
		require('../lib/routes')(mockExpressApp)
	})

	it ('Given the request does not contain site host information\n ' +
		'When the activation email is requested to be sent\n ' +
		'Then an error passed to the error handler', function (done) {

		var mockRequest = {
			session: {
				user: {a: 1}
			},
			headers: {
			}
		}
		var mockNext = function(e) {
			e.should.exist
			e.message.should.equal('No host information in request headers.')
			done()
		}
		mockExpressApp.get = function (route, middleWare, cb) {
			if (route == '/auth/resendActivationEmail') {
				cb(mockRequest, null, mockNext)
			}
		}
		require('../lib/routes')(mockExpressApp)
	})

	it ('Given required inputs are present\n ' +
		'When the activation email is requested to be sent\n ' +
		'Then the index view is displayed with a message', function (done) {

		var mockRequest = {
			session: {
				user: {a: 1}
			},
			headers: {
				host: 'HOST'
			}
		}
		var mockResponse = {
			render: function (viewName, data) {
				viewName.should.equal('index')
				data.message.should.equal('Activation email resent.')
				done()
			}
		}
		mockExpressApp.get = function (route, middleWare, cb) {
			if (route == '/auth/resendActivationEmail') {
				cb(mockRequest, mockResponse)
			}
		}
		mockExpressApp.lib.emailer = {
			sendIdentityConfirmation: function () {}
		}
		require('../lib/routes')(mockExpressApp)
	})


})
