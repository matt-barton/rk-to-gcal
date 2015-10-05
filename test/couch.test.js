'use strict'

var should = require('should')
var Couch = require('../lib/couch')
var bcrypt = require('bcrypt-nodejs')

describe('couch', function () {

describe('getUserByIdentity', function() {

	it ('Given an identity is supplied\n' +
		'When getting a user record by identity\n' +
		'Then the users/byIdentity view is queried', function (done) {

		var identity = 'IDENTITY'
		var mockDb = {
			view: function(viewName, parameters, cb) {
				viewName.should.equal('users/byIdentity')
				parameters.should.be.type('object')
				parameters.key.should.equal('IDENTITY')
				done()
			}
		}
		var couch = new Couch(mockDb)
		couch.getUserByIdentity(identity)

	})

	it ('Given an error occurs\n' +
		'When getting a user record by identity\n' +
		'Then the error is passed to the callback', function (done) {

		var error = new Error ('The error')
		var mockDb = {
			view: function(viewName, parameters, cb) {
				cb(error)
			}
		}
		var couch = new Couch(mockDb)
		couch.getUserByIdentity(null, function(e) {
			e.should.equal(error)
			done()
		})
	})

	it ('Given no matching user is found\n' +
		'When getting a user record by identity\n' +
		'Then an empty resultset is passed to the callback', function (done) {

		var mockDb = {
			view: function(viewName, parameters, cb) {
				cb(null, [])
			}
		}
		var couch = new Couch(mockDb)
		couch.getUserByIdentity(null, function(e, result) {
			should.not.exist(e)
			result.length.should.equal(0)
			done()
		})
	})

	it ('Given a matching user is found\n' +
		'When getting a user record by identity\n' +
		'Then the user object is passed to the callback in an array', function (done) {

		var mockDb = {
			view: function(viewName, parameters, cb) {
				cb(null, [{
					value: {
						identity: 'IDENTITY'
					}
				}])
			}
		}
		var couch = new Couch(mockDb)
		couch.getUserByIdentity(null, function(e, result) {
			should.not.exist(e)
			result[0].identity.should.equal('IDENTITY')
			done()
		})
	})


	it ('Given many matching users are found\n' +
		'When getting a user record by identity\n' +
		'Then an error is passed to the callback', function (done) {

		var mockDb = {
			view: function(identity, parameters, cb) {
				cb(null, [{
					value: {
						identity: 'IDENTITY'
					}
				},{
					value: {
						identity: 'IDENTITY'
					}
				}])
			}
		}
		var couch = new Couch(mockDb)
		couch.getUserByIdentity('IDENTITY', function(e, result) {
			e.message.should.equal("Database integrity error: multiple user records with identity = IDENTITY")
			done()
		})
	})

})

describe('createUser', function () {

	it ('Given user details\n' +
		'When creating a user record\n' +
		'Then the appropriate type of record is created', function (done) {

		var mockDb = {
			save: function (record) {
				record.identity.should.equal('IDENTITY')
				bcrypt.compareSync('PASSWORD', record.pwHash).should.equal(true)
				record.type.should.equal('user')
				record.identityConfirmed.should.equal(false)
				var dateTest = /^[\d]{4}-[\d]{2}-[\d]{2} [\d]{2}:[\d]{2}:[\d]{2}$/
				dateTest.test(record.createdDate).should.equal(true)
				record.activationCode.length.should.equal(32)
				done()
			}
		}
		var couch = new Couch(mockDb)
		couch.createUser('IDENTITY', 'PASSWORD')
	})

	it ('Given an error is thrown\n' +
		'When creating a user record\n' +
		'Then the error is handled correctly', function (done) {

		var error = new Error ('This is an error')
		var mockDb = {
			save: function (record, cb) {
				cb(error)
			}
		}
		var couch = new Couch(mockDb)
		couch.createUser('IDENTITY', 'PASSWORD', function(e) {
			e.should.equal(error)
			done()
		})
	})

	it ('Given a record is successfully created\n' +
		'When creating a user record\n' +
		'Then the new record is returned', function (done) {

		var mockDb = {
			save: function (record, cb) {
				cb(null, {
					id: 'new record id'
				})
			}
		}
		var couch = new Couch(mockDb)
		couch.createUser('IDENTITY', 'PASSWORD', function(e, result) {
			should.not.exist(e)
			result.id.should.equal('new record id')
			done()
		})
	})

})

describe('activateUser', function() {

	it ('Given no user identity is supplied\n' +
		'When a user is activated\n' +
		'Then an error is passed to the callback', function(done) {

		var couch = new Couch({})
		couch.activateUser(null, function(e) {
			e.should.be.type('object')
			e.message.should.equal('No identity supplied')
			done()
		})		
	})

	it ('Given a user identity is supplied\n' +
		'When a user is activated\n' +
		'Then the user\'s record is obtained', function(done) {

		var mockDb = {
			view: function(viewName, parameters, cb) {
				viewName.should.equal('users/byIdentity')
				parameters.should.be.type('object')
				parameters.key.should.equal('IDENTITY')
				done()
			}
		}
		var couch = new Couch(mockDb)
		couch.activateUser('IDENTITY', function() {})		
	})

	it ('Given an error occurs\n' +
		'When getting a user record\n' +
		'Then the error is passed to the callback', function(done) {

		var error = new Error ('AN ERROR')
		var mockDb = {
			view: function(viewName, parameters, cb) {
				cb(error)
			}
		}
		var couch = new Couch(mockDb)
		couch.activateUser('IDENTITY', function(e) {
			e.should.equal(error)
			done()
		})		
	})

	it ('Given the user\'s record is obtained\n' +
		'When a user is activated\n' +
		'Then the user\'s record is saved, with the active flag set true', function(done) {

		var mockUser = {
			identity: 'IDENTITY',
			identityConfirmed: false
		}
		var mockDb = {
			view: function(viewName, parameters, cb) {
				cb(null, [{
					value: mockUser
				}])
			},
			save: function(user) {
				user.identity.should.equal('IDENTITY')
				user.identityConfirmed.should.equal(true)
				var dateTest = /^[\d]{4}-[\d]{2}-[\d]{2} [\d]{2}:[\d]{2}:[\d]{2}$/
				dateTest.test(user.activatedDate).should.equal(true)
				done()
			}
		}
		var couch = new Couch(mockDb)
		couch.activateUser('IDENTITY', function() {})		
	})

	it ('Given an error occurs\n' +
		'When saving the user\'s record\n' +
		'Then the error is passed to the callback', function(done) {

		var error = new Error ('AN ERROR')
		var mockUser = {
			identity: 'IDENTITY',
			identityConfirmed: false
		}
		var mockDb = {
			view: function(viewName, parameters, cb) {
				cb(null, [{
					value: mockUser
				}])
			},
			save: function(user, cb) {
				cb(error)
			}
		}
		var couch = new Couch(mockDb)
		couch.activateUser('IDENTITY', function(e) {
			e.should.exist
			e.message.should.equal('AN ERROR')
			done()
		})		
	})

	it ('Given the user\'s record is saved successfully\n' +
		'When activating the user\'s record\n' +
		'Then a success flag is passed to the callback', function(done) {

		var mockUser = {
			identity: 'IDENTITY',
			identityConfirmed: false
		}
		var mockDb = {
			view: function(viewName, parameters, cb) {
				cb(null, [{
					value: mockUser
				}])
			},
			save: function(user, cb) {
				cb()
			}
		}
		var couch = new Couch(mockDb)
		couch.activateUser('IDENTITY', function(e, result) {
			should.not.exist(e)
			result.should.exist
			result.success.should.equal(true)
			done()
		})		
	})
})

describe ('saveUserRKCode', function () {

	it ('Given no user identity is supplied\n' +
		'When saving a user\'s RK code\n' +
		'Then an error is passed to the callback', function (done) {

		var couch = new Couch({})
		couch.saveUserRKCode(null, null, function (e) {
			e.should.exist
			e.message.should.equal('No user identity supplied to save RK code for.')
			done()
		})
	})

	it ('Given no rk code is supplied\n' +
		'When saving a user\'s RK code\n' +
		'Then an error is passed to the callback', function (done) {

		var couch = new Couch({})
		couch.saveUserRKCode('IDENTITY', null, function (e) {
			e.should.exist
			e.message.should.equal('No rk code supplied to save for user.')
			done()
		})
	})

	it ('Given identity and rk code are supplied\n' +
		'When saving a user\'s RK code\n' +
		'Then the user\'s record is obtained', function (done) {

		var mockDb = {
			view: function(viewName, parameters, cb) {
				viewName.should.equal('users/byIdentity')
				parameters.should.be.type('object')
				parameters.key.should.equal('IDENTITY')
				done()
			}
		}
		var couch = new Couch(mockDb)
		couch.saveUserRKCode('IDENTITY', 'RK CODE', function () {})
	})

	it ('Given there is an error\n' +
		'When obtaining user\'s record\n' +
		'Then the error is passed to the callback', function (done) {

		var error = new Error ('This is an error')
		var mockDb = {
			view: function(viewName, parameters, cb) {
				cb(error)
			}
		}
		var couch = new Couch(mockDb)
		couch.saveUserRKCode('IDENTITY', 'RK CODE', function (e) {
			e.should.equal(error)
			done()
		})
	})


	it ('Given the user\'s record is obtained\n ' +
		'When saving a user\'s rk code\n ' +
		'Then the rk code is saved in the db', function (done) {

		var mockUser = {
			identity: 'IDENTITY',
			identityConfirmed: false
		}
		var mockDb = {
			view: function(viewName, parameters, cb) {
				cb(null, [{
					value: mockUser
				}])
			},
			save: function(user) {
				user.identity.should.equal('IDENTITY')
				user.rkCode.should.equal('RK CODE')
				var dateTest = /^[\d]{4}-[\d]{2}-[\d]{2} [\d]{2}:[\d]{2}:[\d]{2}$/
				dateTest.test(user.rkConnectedDate).should.equal(true)
				done()
			}
		}
		var couch = new Couch(mockDb)
		couch.saveUserRKCode('IDENTITY', 'RK CODE', function () {})
	})

	it ('Given there is an error \n' +
		'When saving a user\'s rk code\n' +
		'Then the error is passed to the callback', function (done) {

		var error = new Error ('THE ERROR')
		var mockUser = {
			identity: 'IDENTITY',
			identityConfirmed: false
		}
		var mockDb = {
			view: function(viewName, parameters, cb) {
				cb(null, [{
					value: mockUser
				}])
			},
			save: function(user, cb) {
				cb(error)
			}
		}
		var couch = new Couch(mockDb)
		couch.saveUserRKCode('IDENTITY', 'RK CODE', function (e) {
			e.should.exist
			e.message.should.equal('THE ERROR')
			done()
		})
	})

	it ('Given the user\'s record is successfully saved \n' +
		'When saving a user\'s rk code \n' +
		'Then the a success indicator is passed to the callback', function (done) {

		var mockUser = {
			identity: 'IDENTITY',
			identityConfirmed: false
		}
		var mockDb = {
			view: function(viewName, parameters, cb) {
				cb(null, [{
					value: mockUser
				}])
			},
			save: function(user, cb) {
				cb(null)
			}
		}
		var couch = new Couch(mockDb)
		couch.saveUserRKCode('IDENTITY', 'RK CODE', function (e, result) {
			should.not.exist(e)
			result.success.should.equal(true)
			done()
		})
	})
})

describe('saveUserGoogleToken', function () {

	it ('Given no user identity is supplied\n' +
		'When saving a user\'s google token\n' +
		'Then an error is passed to the callback', function (done) {

		var couch = new Couch({})
		couch.saveUserGoogleToken(null, null, function (e) {
			e.should.exist
			e.message.should.equal('No user identity supplied to save google token for.')
			done()
		})
	})

	it ('Given no token is supplied\n' +
		'When saving a user\'s google token\n' +
		'Then an error is passed to the callback', function (done) {

		var couch = new Couch({})
		couch.saveUserGoogleToken('IDENTITY', null, function (e) {
			e.should.exist
			e.message.should.equal('No token supplied to save for user.')
			done()
		})
	})

	it ('Given identity and token are supplied\n' +
		'When saving a user\'s google token\n' +
		'Then the user\'s record is obtained', function (done) {

		var mockDb = {
			view: function(viewName, parameters, cb) {
				viewName.should.equal('users/byIdentity')
				parameters.should.be.type('object')
				parameters.key.should.equal('IDENTITY')
				done()
			}
		}
		var couch = new Couch(mockDb)
		couch.saveUserGoogleToken('IDENTITY', {
			property: 'value'
		}, function () {})
	})	

	it ('Given there is an error\n' +
		'When obtaining user\'s record\n' +
		'Then the error is passed to the callback', function (done) {

		var error = new Error ('This is an error')
		var mockDb = {
			view: function(viewName, parameters, cb) {
				cb(error)
			}
		}
		var couch = new Couch(mockDb)
		couch.saveUserGoogleToken('IDENTITY', {
			property: 'value'
		}, function (e) {
			e.should.equal(error)
			done()
		})
	})


	it ('Given the user\'s record is obtained\n ' +
		'When saving a user\'s google token code\n ' +
		'Then the token is saved in the db', function (done) {

		var mockUser = {
			identity: 'IDENTITY',
			identityConfirmed: false
		}
		var mockDb = {
			view: function(viewName, parameters, cb) {
				cb(null, [{
					value: mockUser
				}])
			},
			save: function(user) {
				user.identity.should.equal('IDENTITY')
				user.google.should.be.type('object')
				user.google.token.should.be.type('object')
				user.google.token.property.should.equal('value')
				var dateTest = /^[\d]{4}-[\d]{2}-[\d]{2} [\d]{2}:[\d]{2}:[\d]{2}$/
				dateTest.test(user.google.connectedDate).should.equal(true)
				done()
			}
		}
		var couch = new Couch(mockDb)
		couch.saveUserGoogleToken('IDENTITY', {
			property: 'value'
		}, function () {})
	})

	it ('Given there is an error \n' +
		'When saving a user\'s google token\n' +
		'Then the error is passed to the callback', function (done) {

		var error = new Error ('THE ERROR')
		var mockUser = {
			identity: 'IDENTITY',
			identityConfirmed: false
		}
		var mockDb = {
			view: function(viewName, parameters, cb) {
				cb(null, [{
					value: mockUser
				}])
			},
			save: function(user, cb) {
				cb(error)
			}
		}
		var couch = new Couch(mockDb)
		couch.saveUserGoogleToken('IDENTITY', {
			property: 'value'
		}, function (e) {
			e.should.exist
			e.message.should.equal('THE ERROR')
			done()
		})
	})

	it ('Given the user\'s record is successfully saved \n' +
		'When saving a user\'s google token \n' +
		'Then the a success indicator is passed to the callback', function (done) {

		var mockUser = {
			identity: 'IDENTITY',
			identityConfirmed: false
		}
		var mockDb = {
			view: function(viewName, parameters, cb) {
				cb(null, [{
					value: mockUser
				}])
			},
			save: function(user, cb) {
				cb(null)
			}
		}
		var couch = new Couch(mockDb)
		couch.saveUserGoogleToken('IDENTITY', {
			property: 'value'
		}, function (e, result) {
			should.not.exist(e)
			result.success.should.equal(true)
			done()
		})
	})

})
})