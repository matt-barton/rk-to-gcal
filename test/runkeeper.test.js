'use strict'

var should = require('should')

describe('runkeeper', function() {


	var rkOptions = {
		client_id: 'CLIENT_ID',
		client_secret: 'CLIENT_SECRET',
		redirect_uri: 'REDIRECT_URI',
		auth_url: 'AUTH_URL'
	}
	var utils = require('../lib/utils')

	var Runkeeper = require('../lib/runkeeper')
	var app = {
		lib: {
			utils: utils
		}
	}

	var protectProcessEnv

	before (function () {
		protectProcessEnv = {
			RK2GCAL_RK_CLIENT_ID: process.env.RK2GCAL_RK_CLIENT_ID,
			RK2GCAL_RK_CLIENT_SECRET: process.env.RK2GCAL_RK_CLIENT_SECRET
		}
	})

	after (function () {
		process.env.RK2GCAL_RK_CLIENT_ID = protectProcessEnv.RK2GCAL_RK_CLIENT_ID
		process.env.RK2GCAL_RK_CLIENT_SECRET = protectProcessEnv.RK2GCAL_RK_CLIENT_SECRET
	})

	beforeEach (function () {
		process.env.RK2GCAL_RK_CLIENT_ID = 'RK_CLIENT_ID'
		process.env.RK2GCAL_RK_CLIENT_SECRET = 'RK_CLIENT_SECRET'
	})

	it ('Given the RK client id is stored in a environment variable\n' +
		'When the runkeeper module is instantiated\n' +
		'Then the client id is added to the RK options object', function (done) {

		var options = {}
		var rk = new Runkeeper (options, app)
		options.client_id.should.equal('RK_CLIENT_ID')
		done()
	})

	it ('Given the RK client secret is stored in a environment variable\n' +
		'When the runkeeper module is instantiated\n' +
		'Then the client secret is added to the RK options object', function (done) {

		var options = {}
		var rk = new Runkeeper (options, app)
		options.client_secret.should.equal('RK_CLIENT_SECRET')
		done()
	})


	describe('redirectToRKAuth', function() {

		it ('When the runkeeper auth page is requested\n ' +
			'Then the response object is used to trigger the redirect', function (done) {

			var rk = new Runkeeper(rkOptions, app)

			var writeHeadCalled = false
			var endCaled = false

			var mockResponseObject = {
				writeHead: function writeHead(code, options) {
					code.should.equal(301)
					options.should.be.type('object')
					options.Location.should.be.type('string')
					writeHeadCalled = true
				},
				end: function end () {
					endCaled = true;
					done()
				}
			}

			rk.redirectToRKAuth(mockResponseObject)

			writeHeadCalled.should.equal(true)
			endCaled.should.equal(true)
		})

		it ('Given runkeeper options are set \n' +
			'When the runkeeper auth page is requested\n ' +
			'Then the rk auth url redirected to is correctly formed', function (done) {

			var rk = new Runkeeper(rkOptions, app)

			var targetUrl = 'AUTH_URL?client_id=RK_CLIENT_ID&response_type=code&redirect_uri=REDIRECT_URI'

			var mockResponseObject = {
				writeHead: function writeHead(code, options) {
					options.should.be.type('object')
					options.Location.should.equal(targetUrl)
				},
				end: function end () {
					done()
				}
			}

			rk.redirectToRKAuth(mockResponseObject)
		})

	})
})
