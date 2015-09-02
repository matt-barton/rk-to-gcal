'use strict'

var should = require('should')

describe ('auth', function () {

	describe ('requiresAuthentication', function () {

		it ('Given a request session doesn\'t exist ' +
			'When authentication status is tested ' +
			'Then the result.redirect method is invoked', function (done) {

			var redirectCalled = false
			var mockResult = {
				redirect: function() {
					redirectCalled = true
					done()
				}
			}

			var auth = require ('../lib/auth')

			auth.requiresAuthentication({}, mockResult)

			redirectCalled.should.equal(true)
		})

		it ('Given a request session doesn\'t exist ' +
			'When authentication status is tested ' +
			'Then the result.redirect method is used to redirect to /auth/login', function (done) {

			var mockResult = {
				redirect: function(url) {
					url.should.equal('/auth/login')
					done()
				}
			}

			var auth = require ('../lib/auth')

			auth.requiresAuthentication({}, mockResult)
		})

		it ('Given a request session is null ' +
			'When authentication status is tested ' +
			'Then the result.redirect method is used to redirect to /auth/login', function (done) {

			var mockResult = {
				redirect: function(url) {
					url.should.equal('/auth/login')
					done()
				}
			}
			var mockRequest = {
				session: null
			}
			var auth = require ('../lib/auth')

			auth.requiresAuthentication(mockRequest, mockResult)
		})


		it ('Given a request session exists ' +
			'And the session contains no user data ' +
			'When authentication status is tested ' +
			'Then the result.redirect method is used to redirect to /auth/login', function (done) {

			var mockResult = {
				redirect: function(url) {
					url.should.equal('/auth/login')
					done()
				}
			}
			var mockRequest = {
				session: {}
			}
			var auth = require ('../lib/auth')

			auth.requiresAuthentication(mockRequest, mockResult)
		})

		it ('Given a request session exists ' +
			'And the session contains a user with no identity ' +
			'When authentication status is tested ' +
			'Then the result.redirect method is used to redirect to /auth/login', function (done) {

			var mockResult = {
				redirect: function(url) {
					url.should.equal('/auth/login')
					done()
				}
			}
			var mockRequest = {
				session: {
					user: {}
				}
			}
			var auth = require ('../lib/auth')

			auth.requiresAuthentication(mockRequest, mockResult)
		})

		it ('Given a request session exists ' +
			'And the session contains a user identity ' +
			'When authentication status is tested ' +
			'Then the next method is invoked', function (done) {

			var nextInvoked = false
			function mockNext () {
				nextInvoked = true
				done()
			}
			var mockRequest = {
				session: {
					user: {
						identity: 'an identity'
					}
				}
			}
			var auth = require ('../lib/auth')

			auth.requiresAuthentication(mockRequest, {}, mockNext)

			nextInvoked.should.equal(true)
		})

	})
})