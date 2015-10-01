'use strict'

describe ('google', function () {


	var GoogleModule = require ('../lib/google')
	var googleConfig = {
		"client_id" : "GOOGLE_CLIENT_ID",
		"auth_uri" : "GOOGLE_AUTH_URL",
		"token_uri" : "GOOGLE_TOKEN_URL",
		"auth_provider_x509_cert_url" : "GOOGLE_X509_CERT_URL",
		"client_secret" : "GOOGLE_CLIENT_SECRET",
		"redirect_uri" :  "GOOGLE_REDIRECT_URI"
	}

	var utils = require('../lib/utils')

	var app = {
		lib: {
			utils: utils
		}
	}

	var protectProcessEnv

	before (function () {
		protectProcessEnv = {
			RK2GCAL_GOOGLE_CLIENT_ID: process.env.RK2GCAL_GOOGLE_CLIENT_ID,
			RK2GCAL_GOOGLE_CLIENT_SECRET: process.env.RK2GCAL_GOOGLE_CLIENT_SECRET
		}
	})

	after (function () {
		process.env.RK2GCAL_GOOGLE_CLIENT_ID = protectProcessEnv.RK2GCAL_GOOGLE_CLIENT_ID
		process.env.RK2GCAL_GOOGLE_CLIENT_SECRET = protectProcessEnv.RK2GCAL_GOOGLE_CLIENT_SECRET
	})

	beforeEach (function () {
		process.env.RK2GCAL_GOOGLE_CLIENT_ID = 'GOOGLE_CLIENT_ID'
		process.env.RK2GCAL_GOOGLE_CLIENT_SECRET = 'GOOGLE_CLIENT_SECRET'
	})

	it ('Given the Google client id is stored in a environment variable\n' +
		'When the google module is instantiated\n' +
		'Then the client id is added to the google options object', function (done) {

		var options = {}
		var google = new GoogleModule (options, app)
		options.client_id.should.equal('GOOGLE_CLIENT_ID')
		done()
	})

	it ('Given the Google client secret is stored in a environment variable\n' +
		'When the google module is instantiated\n' +
		'Then the client secret is added to the google options object', function (done) {

		var options = {}
		var google = new GoogleModule (options, app)
		options.client_secret.should.equal('GOOGLE_CLIENT_SECRET')
		done()
	})

	describe ('redirectToAuth', function () {

		var mockResponse = {
			writeHead: function () {},
			end: function () {}
		}

		it ('Given a googleAuth module is present in the app library\n' +
			'When redirecting to Google Auth\n' +
			'Then a new OAuth2 client is obtained from googleAuth', function (done) {

			var mockRequest = {
				headers: {
					host: 'HOST'
				}
			}

			app.lib.googleAuth = {
				OAuth2: function (clientId, clientSecret, redirectUri) {
					clientId.should.equal('GOOGLE_CLIENT_ID')
					clientSecret.should.equal('GOOGLE_CLIENT_SECRET')
					redirectUri.should.equal('http://HOST/auth/google/callback')
					done()
					return {
						generateAuthUrl: function () {}
					}
				}
			}

			var google = new GoogleModule(googleConfig, app)
			google.redirectToAuth(mockRequest, mockResponse)
		})

		it ('Given a googleAuth module is present in the app library\n' +
			'When redirecting to Google Auth\n' +
			'Then a destination url is obtained from the generated OAuth2 client', function (done) {

			var mockRequest = {
				headers: {
					host: 'HOST'
				}
			}

			app.lib.googleAuth = {
				OAuth2: function (clientId, clientSecret, redirectUri) {
					return {
						generateAuthUrl: function(params) {
							params.access_type.should.equal('offline')
							params.scope.length.should.equal(1)
							params.scope[0].should.equal('https://www.googleapis.com/auth/calendar')
							done()
						}
					}
				}
			}

			var google = new GoogleModule(googleConfig, app)
			google.redirectToAuth(mockRequest, mockResponse)
		})

		it ('Given a googleAuth module is present in the app library\n' +
			'When redirecting to Google Auth\n' +
			'Then the response object is instructed to redirect to the oAuth2 url', function (done) {

			var mockRequest = {
				headers: {
					host: 'HOST'
				}
			}

			mockResponse.writeHead =  function writeHead(code, options) {
				code.should.equal(301)
				options.should.be.type('object')
				options.Location.should.equal('REDIRECT URL')
			}
			mockResponse.end = function end () {
				done()
			}
			app.lib.googleAuth = {
				OAuth2: function (clientId, clientSecret, redirectUri) {
					return {
						generateAuthUrl: function(params) {
							return 'REDIRECT URL'
						}
					}
				}
			}

			var google = new GoogleModule(googleConfig, app)
			google.redirectToAuth(mockRequest, mockResponse)
		})
	})
})