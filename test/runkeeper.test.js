'use strict'

var should = require('should')

describe('runkeeper', function() {

	describe('redirectToRKAuth', function() {

		var rkOptions = {
			client_id: 'CLIENT_ID',
			client_secret: 'CLIENT_SECRET',
			redirect_uri: 'REDIRECT_URI',
			auth_url: 'AUTH_URL'
		}
		var utils = require('../lib/utils')

		it ('When the runkeeper auth page is requested ' +
			'Then the response object is used to trigger the redirect', function (done) {

			var Runkeeper = require('../lib/runkeeper')
			var rk = new Runkeeper(rkOptions, utils)

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

		it ('Given runkeeper options are set ' +
			'When the runkeeper auth page is requested ' +
			'Then the rk auth url redirected to is correctly formed', function (done) {

			var Runkeeper = require('../lib/runkeeper')
			var rk = new Runkeeper(rkOptions, utils)

			var targetUrl = 'AUTH_URL?client_id=CLIENT_ID&response_type=code&redirect_uri=REDIRECT_URI'

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
