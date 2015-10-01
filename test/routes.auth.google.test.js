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
					googleCredentials: {}
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

})