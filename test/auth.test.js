'use strict'

var should = require('should')
var bcrypt = require('bcrypt-nodejs')

describe ('auth', function () {

	var Auth = require('../lib/auth')

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

			var auth = new Auth

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

			var auth = new Auth

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

			var auth = new Auth

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

			var auth = new Auth

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

			var auth = new Auth

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

			var auth = new Auth
			auth.requiresAuthentication(mockRequest, {}, mockNext)

			nextInvoked.should.equal(true)
		})

	})

	describe ('login', function() {

		it ('Given a username is not supplied ' +
			'When logging in ' +
			'Then an error is invoked', function (done) {

			var auth = new Auth

			auth.login(null, 'PASSWORD', function(e) {
				e.should.be.type('object')
				e.message.should.equal('Username is required')
				done()
			})
		})

		it ('Given a password is not supplied ' +
			'When logging in ' +
			'Then an error is invoked', function (done) {

			var auth = new Auth

			auth.login('USERNAME', null, function(e) {
				e.should.be.type('object')
				e.message.should.equal('Password is required')
				done()
			})
		})

		it ('Given a username and password are supplied ' +
			'When logging in ' +
			'Then a user record is retrieved for the username', function (done) {

			var mockDb = {
				getUser: function(username) {
					username.should.equal('USERNAME')
					done()
				}
			}
			var auth = new Auth(mockDb)

			auth.login('USERNAME', 'PASSWORD', function() {})
		})

		it ('Given an error occurs ' +
			'When logging in ' +
			'Then the error is bubbled up', function (done) {

			var mockDb = {
				getUser: function(username, cb) {
					cb(new Error ('AN ERROR'))
				}
			}
			var auth = new Auth(mockDb)

			auth.login('USERNAME', 'PASSWORD', function(e) {
				e.should.be.type('object')
				e.message.should.equal('AN ERROR')
				done()
			})
		})

		it ('Given no user account is found for the supplied username ' +
			'When logging in ' +
			'Then a negative response is returned', function (done) {

			var mockDb = {
				getUser: function(username, cb) {
					cb(null, [])
				}
			}
			var auth = new Auth(mockDb)

			auth.login('USERNAME', 'PASSWORD', function(e, result) {
				should.not.exist(e)
				result.should.equal(false)
				done()
			})
		})

		it ('Given a user account is found for the supplied username ' +
			'And the password supplied does not match the stored password ' +
			'When logging in ' +
			'Then a negative response is returned', function (done) {

			var mockDb = {
				getUser: function(username, cb) {
					cb(null, [{
						pwHash: bcrypt.hashSync('POTATOES')
					}])
				}
			}
			var auth = new Auth(mockDb)

			auth.login('USERNAME', 'PASSWORD', function(e, result) {
				should.not.exist(e)
				result.should.equal(false)
				done()
			})
		})


		it ('Given a user account is found for the supplied username ' +
			'And the password supplied matches the stored password ' +
			'When logging in ' +
			'Then the stored user record is returned', function (done) {

			var mockUser = {
				identity: 'USERNAME',
				pwHash: bcrypt.hashSync('PASSWORD')
			}
			var mockDb = {
				getUser: function(username, cb) {
					cb(null, [mockUser])
				}
			}
			var auth = new Auth(mockDb)

			auth.login('USERNAME', 'PASSWORD', function(e, result) {
				should.not.exist(e)
				result.should.equal(mockUser)
				done()
			})
		})


	})
})