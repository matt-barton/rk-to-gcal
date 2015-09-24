'use strict'

var should = require ('should')
var mockExpressApp
var utils = require('../lib/utils')
var helpers = require('./helpers')

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

		helpers.assertHandlerExists(done, '/', 'GET')
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
})