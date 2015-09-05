'use strict'

var should = require('should')
var bcrypt = require('bcrypt-nodejs')
//var bcrypt = {
//	hashSync: function (thing) {
//		return thing
//	}
//}
var mockApp = {
	lib: {
		db: null
	}
}
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

			var auth = new Auth(mockApp)

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

			var auth = new Auth(mockApp)

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

			var auth = new Auth(mockApp)

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

			var auth = new Auth(mockApp)

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

			var auth = new Auth(mockApp)

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

			var auth = new Auth(mockApp)
			auth.requiresAuthentication(mockRequest, {}, mockNext)

			nextInvoked.should.equal(true)
		})

	})

	describe ('login', function() {

		it ('Given an identity is not supplied ' +
			'When logging in ' +
			'Then an error is invoked', function (done) {

			var auth = new Auth(mockApp)

			var request = {
				body: {
					password: 'PASSWORD'
				}
			}
			auth.login(request, function(e) {
				e.should.be.type('object')
				e.message.should.equal('Username is required')
				done()
			})
		})

		it ('Given a password is not supplied ' +
			'When logging in ' +
			'Then an error is invoked', function (done) {

			var auth = new Auth(mockApp)

			var request = {
				body: {
					identity: 'IDENTITY'
				}
			}
			auth.login(request, function(e) {
				e.should.be.type('object')
				e.message.should.equal('Password is required')
				done()
			})
		})

		it ('Given a username and password are supplied ' +
			'When logging in ' +
			'Then a user record is retrieved for the username', function (done) {

			mockApp.lib.db = {
				getUserByIdentity: function(username) {
					username.should.equal('IDENTITY')
					done()
				}
			}
			var auth = new Auth(mockApp)

			var request = {
				body: {
					identity: 'IDENTITY',
					password: 'PASSWORD'
				}
			}
			auth.login(request, function() {})
		})

		it ('Given an error occurs ' +
			'When logging in ' +
			'Then the error is bubbled up', function (done) {

			mockApp.lib.db = {
				getUserByIdentity: function(username, cb) {
					cb(new Error ('AN ERROR'))
				}
			}
			var auth = new Auth(mockApp)
			var request = {
				body: {
					identity: 'IDENTITY',
					password: 'PASSWORD'
				}
			}

			auth.login(request, function(e) {
				e.should.be.type('object')
				e.message.should.equal('AN ERROR')
				done()
			})
		})

		it ('Given no user account is found for the supplied identity ' +
			'When logging in ' +
			'Then a negative response is returned', function (done) {

			mockApp.lib.db = {
				getUserByIdentity: function(username, cb) {
					cb(null, [])
				}
			}
			var auth = new Auth(mockApp)

			var request = {
				body: {
					identity: 'IDENTITY',
					password: 'PASSWORD'
				}
			}
			auth.login(request, function(e, result) {
				should.not.exist(e)
				result.should.equal(false)
				done()
			})
		})

		it ('Given a user account is found for the supplied username ' +
			'And the password supplied does not match the stored password ' +
			'When logging in ' +
			'Then a negative response is returned', function (done) {
			this.timeout(10000)
			mockApp.lib.db = {
				getUserByIdentity: function(username, cb) {
					cb(null, [{
						pwHash: bcrypt.hashSync('POTATOES')
					}])
				}
			}
			var auth = new Auth(mockApp)

			var request = {
				body: {
					identity: 'IDENTITY',
					password: 'PASSWORD'
				}
			}
			auth.login(request, function(e, result) {
				console.log('HERE')
				should.not.exist(e)
				console.log('HERE2')
				result.should.equal(false)
				console.log('HERE3')
				done()
				console.log('HERE4')
			})
		})


		it ('Given a user account is found for the supplied username ' +
			'And the password supplied matches the stored password ' +
			'When logging in ' +
			'Then the stored user record is returned', function (done) {
			this.timeout(10000)

			var mockUser = {
				identity: 'IDENTITY',
				pwHash: bcrypt.hashSync('PASSWORD')
			}
			mockApp.lib.db = {
				getUserByIdentity: function(username, cb) {
					cb(null, [mockUser])
				}
			}
			var auth = new Auth(mockApp)

			var request = {
				body: {
					identity: 'IDENTITY',
					password: 'PASSWORD'
				},
				session: {}
			}
			auth.login(request, function(e, result) {
				should.not.exist(e)
				result.should.equal(mockUser)
				done()
			})
		})


		it ('Given a user account is found for the supplied username ' +
			'And the password supplied matches the stored password ' +
			'When logging in ' +
			'Then the stored user record is registered in the request seession', function (done) {
			this.timeout(10000)

			var mockUser = {
				identity: 'IDENTITY',
				pwHash: bcrypt.hashSync('PASSWORD')
			}
			mockApp.lib.db = {
				getUserByIdentity: function(username, cb) {
					cb(null, [mockUser])
				}
			}
			var auth = new Auth(mockApp)

			var request = {
				body: {
					identity: 'IDENTITY',
					password: 'PASSWORD'
				},
				session: {}
			}
			auth.login(request, function(e, result) {
				should.not.exist(e)
				result.should.equal(mockUser)
				request.session.user.should.equal(mockUser)
				done()
			})
		})
	})
})