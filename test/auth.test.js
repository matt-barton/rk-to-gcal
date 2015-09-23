'use strict'

var should = require('should')
var bcrypt = require('bcrypt-nodejs')
var utils = require('../lib/utils')
var mockApp

describe ('auth', function () {

	var Auth = require('../lib/auth')

	beforeEach(function() {
		mockApp = {
			lib: {
				db: null,
				utils: utils,
				emailer: {
					sendIdentityConfirmation: function () {}
				}
			}
		}
	})

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
				should.not.exist(e)
				result.should.equal(false)
				done()
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

	describe ('register', function() {

		it ('Given no identity is supplied ' +
			'When a user is registered ' +
			'Then failure is returned with a message', function (done) {

			var request = {
				body: {}
			}
			var auth = new Auth(mockApp)

			auth.register(request, function(e, result) {
				should.not.exist(e)
				result.success.should.equal(false)
				result.message.should.equal('Username is required')
				done()
			})		
		})

		it ('Given a null identity is supplied ' +
			'When a user is registered ' +
			'Then failure is returned with a message', function (done) {

			var request = {
				body: {
					identity: null
				}
			}
			var auth = new Auth(mockApp)

			auth.register(request, function(e, result) {
				should.not.exist(e)
				result.success.should.equal(false)
				result.message.should.equal('Username is required')
				done()
			})		
		})

		it ('Given an identity containing only whitespace is supplied ' +
			'When a user is registered ' +
			'Then failure is returned with a message', function (done) {

			var request = {
				body: {
					identity: '     '
				}
			}
			var auth = new Auth(mockApp)

			auth.register(request, function(e, result) {
				should.not.exist(e)
				result.success.should.equal(false)
				result.message.should.equal('Username is required')
				done()
			})		
		})


		it ('Given an no password is supplied ' +
			'When a user is registered ' +
			'Then failure is returned with a message', function (done) {

			var request = {
				body: {
					identity: 'IDENTITY'
				}
			}
			var auth = new Auth(mockApp)

			auth.register(request, function(e, result) {
				should.not.exist(e)
				result.success.should.equal(false)
				result.message.should.equal('Password is required')
				done()
			})		
		})

		it ('Given an identity and password ' +
			'When a user is registered ' +
			'Then the identity is checked for uniqueness', function (done) {

			var request = {
				body: {
					identity: 'IDENTITY',
					password: 'PASSWORD'
				}
			}

			mockApp.lib.db = {
				getUserByIdentity: function(username) {
					username.should.equal('IDENTITY')
					done()
				}
			}
			var auth = new Auth(mockApp)

			auth.register(request)		
		})

		it ('Given an error is thrown ' +
			'When a identity uniqueness is being checked ' +
			'Then the error is passed on', function (done) {

			var error = new Error ('This is the error')
			var request = {
				body: {
					identity: 'IDENTITY',
					password: 'PASSWORD'
				}
			}

			mockApp.lib.db = {
				getUserByIdentity: function(username, cb) {
					cb(error)
				}
			}
			var auth = new Auth(mockApp)

			auth.register(request, function(e) {
				e.should.equal(error)
				done()
			})		
		})

		it ('Given the suplied identity is already known in the database ' +
			'When registering ' +
			'Then failure is returned with a message', function (done) {

			var request = {
				body: {
					identity: 'IDENTITY',
					password: 'PASSWORD'
				}
			}

			mockApp.lib.db = {
				getUserByIdentity: function(username, cb) {
					cb(null, [{
						identity: 'IDENTITY'
					}])
				}
			}
			var auth = new Auth(mockApp)

			auth.register(request, function(e, result) {
				should.not.exist(e)
				result.success.should.equal(false)
				result.message.should.equal('That email address is already registered')
				done()
			})		
		})
	
		it ('Given the suplied inputs are ok ' +
			'When registering ' +
			'Then a user record is created in the database', function (done) {

			var request = {
				body: {
					identity: 'IDENTITY',
					password: 'PASSWORD'
				}
			}

			mockApp.lib.db = {
				getUserByIdentity: function(username, cb) {
					cb(null, [])
				},
				createUser:(function(identity, password){
					identity.should.equal('IDENTITY')
					password.should.equal('PASSWORD')
					done()
				})
			}
			var auth = new Auth(mockApp)

			auth.register(request)		
		})

		it ('Given an error is thrown ' +
			'When creating a user record ' +
			'Then the error is correctly handled', function (done) {

			var error = new Error ('This is an error')
			var request = {
				body: {
					identity: 'IDENTITY',
					password: 'PASSWORD'
				}
			}

			mockApp.lib.db = {
				getUserByIdentity: function(username, cb) {
					cb(null, [])
				},
				createUser:(function(identity, password, cb){
					cb(error)
				})
			}
			var auth = new Auth(mockApp)

			auth.register(request, function(e) {
				e.should.equal(error)
				done()
			})
		})

		it ('Given a user record is created ' +
			'When registering ' +
			'Then the session is updated to record a login', function (done) {

			var mockUserRecord = {
				identity: 'IDENTITY'
			}
			var request = {
				body: {
					identity: 'IDENTITY',
					password: 'PASSWORD'
				},
				session: {},
				headers: {
					host: null
				}
			}

			mockApp.lib.db = {
				getUserByIdentity: function(username, cb) {
					cb(null, [])
				},
				createUser:(function(identity, password, cb){
					cb(null, mockUserRecord)
				})
			}

			var auth = new Auth(mockApp)

			auth.register(request, function (e) {
				should.not.exist(e)
				request.session.user.should.equal(mockUserRecord)
				done()
			})		
		})

		it ('Given a user record is created ' +
			'When registering ' +
			'Then an identity confirmation email is requested', function (done) {

			var mockUserRecord = {
				identity: 'IDENTITY'
			}
			var request = {
				body: {
					identity: 'IDENTITY',
					password: 'PASSWORD'
				},
				session: {},
				headers: {
					host: 'the host'
				}
			}

			mockApp.lib.db = {
				getUserByIdentity: function(username, cb) {
					cb(null, [])
				},
				createUser:(function(identity, password, cb){
					cb(null, mockUserRecord)
				})
			}
			mockApp.lib.emailer = {
				sendIdentityConfirmation: function(user, host) {
					user.should.equal(mockUserRecord)
					host.should.equal('the host')
					done()
				}
			}
			var auth = new Auth(mockApp)

			auth.register(request, function() {})		
		})

		it ('Given a user record is created ' +
			'When registering ' +
			'Then success is returned', function (done) {

			var request = {
				body: {
					identity: 'IDENTITY',
					password: 'PASSWORD'
				},
				session: {},
				headers: {
					host: null
				}
			}

			mockApp.lib.db = {
				getUserByIdentity: function(username, cb) {
					cb(null, [])
				},
				createUser:(function(identity, password, cb){
					cb(null, {})
				})
			}

			var auth = new Auth(mockApp)

			auth.register(request, function (e, result) {
				should.not.exist(e)
				result.success.should.equal(true)
				done()
			})		
		})
	})

	describe('logout', function () {

		it ('Given user information is present in the session ' +
			'When logging out ' +
			'Then the user information is removed from the session', function (done) {

			var request = {
				session: {
					user: {
						identity: 'IDENTITY'
					}
				}
			}

			var auth = new Auth(mockApp)

			auth.logout(request, function() {
				should.not.exist(request.session.user)
				done()
			})
		})
	})
})