'use strict'

var should = require ('should')
var mockExpressApp
var utils = require('../lib/utils')
var helpers = require('./helpers')

describe('routes/auth/google', function () {

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
		'Then a GET handler is created for /auth/google', function (done) {

		helpers.assertHandlerExists(done, '/auth/google', 'GET', true, true)
	})

	it ('Given the user is already connected to google\n' +
		'WHen the /auth/google route is requested\n' +
		'Then the index view is displayed, with no redirect to google auth', function (done) {
		
		var googleRedirect = false
		var request = {
			session: {
				user: {
					google: {
						token: {}
					}
				}
			}
		}
		var response = {
			render: function (view) {
				view.should.equal('index')
				googleRedirect.should.equal(false)
				done()
			}
		}
		mockExpressApp.get = function (uri, middleware, cb) {
			if (uri == '/auth/google') {
				cb (request, response)
			}
		}
		mockExpressApp.lib.google = {
			redirectToAuth: function () {
				googleRedirect = true
			}
		}
		require('../lib/routes')(mockExpressApp)
	})

	it ('Given the user not connected to google\n' +
		'WHen the /auth/google route is requested\n' +
		'Then the google auth redirect is invoked', function (done) {
		
		var request = {
			session: {
				user: {
				}
			}
		}
		var response = {}
		mockExpressApp.get = function (uri, middleware, cb) {
			if (uri == '/auth/google') {
				cb (request, response)
			}
		}
		mockExpressApp.lib.google = {
			redirectToAuth: function (requestObject, responseObject) {
				requestObject.should.equal(request)
				responseObject.should.equal(response)
				done()
			}
		}
		require('../lib/routes')(mockExpressApp)
	})

	it ('When routes are set up\n' +
		'Then a GET handler is created for /auth/google/callback', function (done) {

		helpers.assertHandlerExists(done, '/auth/google/callback', 'GET', true, true)
	})

	it ('Given no code param exists in the request query\n' +
		'When the /auth/google/callback route is requested\n' +
		'Then an error is passed to the error handler', function (done) {

		var request = {
			query: {}
		}

		var errorHandler = function (e) {
			e.should.exist
			e.message.should.equal('No auth code present in request')
			done()
		}
		mockExpressApp.get = function (uri, middleware, cb) {
			if (uri == '/auth/google/callback') {
				cb (request, null, errorHandler)
			}
		}
		require('../lib/routes')(mockExpressApp)
	})


	it ('Given the user has a google auth token\n' +
		'When the /auth/google/callback route is requested\n' +
		'Then the index view is displayed', function (done) {

		var request = {
			session: {
				user: {
					google: {
						token: {}
					}
				}
			}
		}

		var response = {
			render: function (viewname) {
				viewname.should.equal('index')
				done()
			}
		}
		mockExpressApp.get = function (uri, middleware, cb) {
			if (uri == '/auth/google/callback') {
				cb (request, response)
			}
		}
		require('../lib/routes')(mockExpressApp)
	})

	it ('Given the user has no google auth token\n' +
		'And a auth code is present in the request\n' +
		'When the /auth/google/callback route is requested\n' +
		'Then a new google token is obtained', function (done) {

		var request = {
			session: {
				user: {
					google: null
				}
			},
			query: {
				code: 'AUTH CODE'
			}
		}

		var response = {
			render: function () {}
		}
		mockExpressApp.lib.google = {
			getToken: function (code, cb) {
				code.should.equal('AUTH CODE')
				cb.should.exist
				cb.should.be.type('function')
				done()
			}
		}	
		mockExpressApp.get = function (uri, middleware, cb) {
			if (uri == '/auth/google/callback') {
				cb (request, response)
			}
		}
		require('../lib/routes')(mockExpressApp)
	})

	it ('Given an error occurs\n' +
		'When obtaining a google token\n' +
		'Then the error is passed to the error handler', function (done) {

		var request = {
			session: {
				user: {
					google: null
				}
			},
			query: {
				code: 'AUTH CODE'
			}
		}
		var response = {
			render: function () {}
		}
		var errorHandler = function(e) {
			e.should.exist
			e.message.should.equal('AN ERROR')
			done()
		}
		mockExpressApp.lib.google = {
			getToken: function (code, cb) {
				cb(new Error('AN ERROR'))
			}
		}	
		mockExpressApp.get = function (uri, middleware, cb) {
			if (uri == '/auth/google/callback') {
				cb (request, response, errorHandler)
			}
		}
		require('../lib/routes')(mockExpressApp)
	})

	it ('Given token is successfully obtained\n' +
		'When obtaining a google token\n' +
		'Then the token is saved to the user record', function (done) {

		var mockToken = {
			property: 'value'
		}
		var request = {
			session: {
				user: {
					identity: 'IDENTITY',
					google: null
				}
			},
			query: {
				code: 'AUTH CODE'
			}
		}
		mockExpressApp.lib.google = {
			getToken: function (code, cb) {
				cb(null, mockToken)
			}
		}	
		mockExpressApp.lib.db = {
			saveUserGoogleToken: function (identity, token, cb) {
				identity.should.equal('IDENTITY')
				token.should.equal(mockToken)
				cb.should.be.type('function')
				done()
			}
		}
		mockExpressApp.get = function (uri, middleware, cb) {
			if (uri == '/auth/google/callback') {
				cb (request)
			}
		}
		require('../lib/routes')(mockExpressApp)
	})

	it ('Given an error occurrs\n' +
		'When saving a token to the user account\n' +
		'Then the error is passed to the error handler', function (done) {

		var error = new Error ('THE ERROR')
		var mockToken = {
			property: 'value'
		}
		var request = {
			session: {
				user: {
					identity: 'IDENTITY',
					google: null
				}
			},
			query: {
				code: 'AUTH CODE'
			}
		}

		var errorHandler = function (e) {
			e.should.exist
			e.message.should.equal('THE ERROR')
			done()
		}
		mockExpressApp.lib.google = {
			getToken: function (code, cb) {
				cb (null, mockToken)
			}
		}	
		mockExpressApp.lib.db = {
			saveUserGoogleToken: function (identity, token, cb) {
				cb (error)
			}
		}
		mockExpressApp.get = function (uri, middleware, cb) {
			if (uri == '/auth/google/callback') {
				cb (request, null, errorHandler)
			}
		}
		require('../lib/routes')(mockExpressApp)
	})

	it ('Given a new token is successfully saved to the user account\n' +
		'When the /auth/google/callback route is requested\n' +
		'Then the index view is displayed with a message', function (done) {

		var error = new Error ('THE ERROR')
		var request = {
			session: {
				user: {
					identity: 'IDENTITY',
					google: null
				}
			},
			query: {
				code: 'AUTH CODE'
			}
		}
		var response = {
			render: function (viewname, data) {
				viewname.should.equal('index')
				data.message.should.equal('Account successfully connected to Google.')
				done()
			}
		}
		mockExpressApp.lib.google = {
			getToken: function (code, cb) {
				cb (null, {})
			}
		}	
		mockExpressApp.lib.db = {
			saveUserGoogleToken: function (identity, token, cb) {
				cb ()
			}
		}
		mockExpressApp.get = function (uri, middleware, cb) {
			if (uri == '/auth/google/callback') {
				cb (request, response)
			}
		}
		require('../lib/routes')(mockExpressApp)
	})
})