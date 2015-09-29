'use strict'

var should = require ('should')
var mockExpressApp
var utils = require('../lib/utils')
var helpers = require('./helpers')

describe('routes/auth/activate', function () {

	beforeEach(function() {
		process.env.NODE_ENV = 'development'
		mockExpressApp = {
			get: function () {},
			post: function () {},
			use: function () {},
			lib: {
				auth: {},
				utils: utils,
				db: {
					activateUser: function(id, cb) {
						cb()
					}
				}
			}
		}
	})

	it('When routes are set up\n ' +
		'Then a GET handler is set up for /auth/activate', function (done) {

		helpers.assertHandlerExists(done, '/auth/activate', 'GET', true, true)
	})

	it('Given no activation code is supplied\n ' +
		'When the /auth/activate route is requested\n ' +
		'Then the activateError view is displayed', function (done) {

		var mockRequest = {
			query: {},
			session: {
				user: {}
			}
		}

		var mockResponse = {
			render: function (viewName) {
				viewName.should.equal('activateError')
				done()
			}
		}

		mockExpressApp.get = function (uri, middleware, cb) {
			if (uri == '/auth/activate') {
				cb (mockRequest, mockResponse)
			}
		}

		var routes = require('../lib/routes')(mockExpressApp)			
	})

	it('Given an activation code is supplied\n ' +
		'And the supplied code doesn\'t match the one in the active user\'s session\n ' +
		'When the /auth/activate route is requested\n ' +
		'Then the activateError view is displayed', function (done) {

		var mockRequest = {
			query: {
				x: 'REQUEST ACTIVATION CODE'
			},
			session: {
				user: {
					activationCode: 'SESSION ACTIVATION CODE'
				}
			}
		}

		var mockResponse = {
			render: function (viewName) {
				viewName.should.equal('activateError')
				done()
			}
		}

		mockExpressApp.get = function (uri, middleware, cb) {
			if (uri == '/auth/activate') {
				cb (mockRequest, mockResponse)
			}
		}

		var routes = require('../lib/routes')(mockExpressApp)			
	})

	it('Given an activation code is supplied\n ' +
		'And the supplied code matches the one in the active user\'s session\n ' +
		'When the /auth/activate route is requested\n ' +
		'Then the index view is displayed with a message', function (done) {

		var activationCode = 'ACTIVATION CODE'
		var mockRequest = {
			query: {
				x: activationCode
			},
			session: {
				user: {
					activationCode: activationCode
				}
			}
		}

		var mockResponse = {
			render: function (viewName, data) {
				viewName.should.equal('index')
				data.message.should.equal('Account activated.')
				done()
			}
		}

		mockExpressApp.get = function (uri, middleware, cb) {
			if (uri == '/auth/activate') {
				cb (mockRequest, mockResponse)
			}
		}

		var routes = require('../lib/routes')(mockExpressApp)			
	})

	it('Given an activation code is supplied\n ' +
		'And the supplied code matches the one in the active user\'s session\n ' +
		'When the /auth/activate route is requested\n ' +
		'Then the user account is activated', function (done) {

		var activationCode = 'ACTIVATION CODE'
		var mockRequest = {
			query: {
				x: activationCode
			},
			session: {
				user: {
					activationCode: activationCode,
					identity: 'IDENTITY'
				}
			}
		}

		var mockResponse = {
			render: function () {}
		}

		mockExpressApp.lib.db = {
			activateUser: function(identity) {
				identity.should.equal('IDENTITY')
				done()
			}
		}

		mockExpressApp.get = function (uri, middleware, cb) {
			if (uri == '/auth/activate') {
				cb (mockRequest, mockResponse)
			}
		}

		var routes = require('../lib/routes')(mockExpressApp)			
	})


	it('Given an error occurrs\n ' +
		'When the user account is activated\n ' +
		'Then the error is passed to the error handler middleware', function (done) {

		var error = new Error ('AN ERROR')
		var activationCode = 'ACTIVATION CODE'
		var mockRequest = {
			query: {
				x: activationCode
			},
			session: {
				user: {
					activationCode: activationCode,
					identity: 'IDENTITY'
				}
			}
		}

		var mockResponse = {
			render: function (viewName) {}
		}

		mockExpressApp.lib.db = {
			activateUser: function(identity, cb) {
				cb(error)
			}
		}
		var mockErrorHandler = function (e) {
			e.should.equal(error)
			done()
		}
		mockExpressApp.get = function (uri, middleware, cb) {
			if (uri == '/auth/activate') {
				cb (mockRequest, mockResponse, mockErrorHandler)
			}
		}

		var routes = require('../lib/routes')(mockExpressApp)			
	})

	it('Given an activation code is supplied\n ' +
		'And the supplied code matches the one in the active user\'s session\n ' +
		'When the /auth/activate route is requested\n ' +
		'Then the user record in the session is updated', function (done) {

		var activationCode = 'ACTIVATION CODE'
		var mockRequest = {
			query: {
				x: activationCode
			},
			session: {
				user: {
					activationCode: activationCode
				}
			}
		}

		var mockResponse = {
			render: function () {
				mockRequest.session.user.identityConfirmed.should.equal(true)
				done()
			}
		}

		mockExpressApp.get = function (uri, middleware, cb) {
			if (uri == '/auth/activate') {
				cb (mockRequest, mockResponse)
			}
		}

		var routes = require('../lib/routes')(mockExpressApp)				
	})

	it('When routes are set up\n ' +
		'Then a POST handler is set up for /auth/activate', function (done) {

		helpers.assertHandlerExists(done, '/auth/activate', 'POST', true, true)
	})

	it('Given no activate code is supplied\n ' +
		'When /auth/activate is posted to\n ' + 
		'Then the activateError view is displayed', function (done) {

		var mockRequest = {
			body: {},
			session: {
				user: {}
			}
		}

		var mockResponse = {
			render: function (viewName) {
				viewName.should.equal('activateError')
				done()
			}
		}

		mockExpressApp.post = function (uri, middleware, cb) {
			if (uri == '/auth/activate') {
				cb (mockRequest, mockResponse)
			}
		}

		var routes = require('../lib/routes')(mockExpressApp)			
	})
	it('Given an activation code is supplied \n' +
		'And the supplied code doesn\'t match the one in the active user\'s session\n ' +
		'When /auth/activate route is posted to\n ' +
		'Then the activateError view is displayed', function (done) {

		var mockRequest = {
			body: {
				activationCode: 'REQUEST ACTIVATION CODE'
			},
			session: {
				user: {
					activationCode: 'SESSION ACTIVATION CODE'
				}
			}
		}

		var mockResponse = {
			render: function (viewName) {
				viewName.should.equal('activateError')
				done()
			}
		}

		mockExpressApp.post = function (uri, middleware, cb) {
			if (uri == '/auth/activate') {
				cb (mockRequest, mockResponse)
			}
		}

		var routes = require('../lib/routes')(mockExpressApp)			
	})

	it('Given an activation code is supplied\n ' +
		'And the supplied code matches the one in the active user\'s session\n ' +
		'When /auth/activate is posted to\n ' +
		'Then the index view is displayed with a message', function (done) {

		var activationCode = 'ACTIVATION CODE'
		var mockRequest = {
			body: {
				activationCode: activationCode
			},
			session: {
				user: {
					activationCode: activationCode
				}
			}
		}

		var mockResponse = {
			render: function (viewName, data) {
				viewName.should.equal('index')
				data.message.should.equal('Account activated.')
				done()
			}
		}

		mockExpressApp.post = function (uri, middleware, cb) {
			if (uri == '/auth/activate') {
				cb (mockRequest, mockResponse)
			}
		}

		var routes = require('../lib/routes')(mockExpressApp)			
	})

	it('Given an activation code is supplied\n ' +
		'And the supplied code matches the one in the active user\'s session\n ' +
		'When /auth/activate is posted to\n ' +
		'Then the user account is activated', function (done) {

		var activationCode = 'ACTIVATION CODE'
		var mockRequest = {
			body: {
				activationCode: activationCode
			},
			session: {
				user: {
					activationCode: activationCode,
					identity: 'IDENTITY'
				}
			}
		}

		var mockResponse = {
			render: function () {}
		}

		mockExpressApp.lib.db = {
			activateUser: function(identity) {
				identity.should.equal('IDENTITY')
				done()
			}
		}

		mockExpressApp.post = function (uri, middleware, cb) {
			if (uri == '/auth/activate') {
				cb (mockRequest, mockResponse)
			}
		}

		var routes = require('../lib/routes')(mockExpressApp)			
	})


	it('Given an error occurrs\n ' +
		'When the user account is activated via a post\n ' +
		'Then the error is passed to the error handler middleware', function (done) {

		var error = new Error ('AN ERROR')
		var activationCode = 'ACTIVATION CODE'
		var mockRequest = {
			body: {
				activationCode: activationCode
			},
			session: {
				user: {
					activationCode: activationCode,
					identity: 'IDENTITY'
				}
			}
		}

		var mockResponse = {
			render: function (viewName) {}
		}

		mockExpressApp.lib.db = {
			activateUser: function(identity, cb) {
				cb(error)
			}
		}
		var mockErrorHandler = function (e) {
			e.should.equal(error)
			done()
		}
		mockExpressApp.post = function (uri, middleware, cb) {
			if (uri == '/auth/activate') {
				cb (mockRequest, mockResponse, mockErrorHandler)
			}
		}

		var routes = require('../lib/routes')(mockExpressApp)			
	})

	it('Given an activation code is supplied\n ' +
		'And the supplied code matches the one in the active user\'s session\n ' +
		'When /auth/activate is posted to\n ' +
		'Then the user record in the session is updated', function (done) {

		var activationCode = 'ACTIVATION CODE'
		var mockRequest = {
			body: {
				activationCode: activationCode
			},
			session: {
				user: {
					activationCode: activationCode
				}
			}
		}

		var mockResponse = {
			render: function () {
				mockRequest.session.user.identityConfirmed.should.equal(true)
				done()
			}
		}

		mockExpressApp.post = function (uri, middleware, cb) {
			if (uri == '/auth/activate') {
				cb (mockRequest, mockResponse)
			}
		}

		var routes = require('../lib/routes')(mockExpressApp)				
	})

})
