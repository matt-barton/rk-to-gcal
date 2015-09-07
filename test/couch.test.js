'use strict'

var should = require('should')
var Couch = require('../lib/couch')
var bcrypt = require('bcrypt-nodejs')

describe('couch', function () {

describe('getUserByIdentity', function() {

	it ('Given an identity is supplied ' +
		'When getting a user record by identity ' +
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

	it ('Given an error occurs ' +
		'When getting a user record by identity ' +
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

	it ('Given no matching user is found ' +
		'When getting a user record by identity ' +
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

	it ('Given a matching user is found ' +
		'When getting a user record by identity ' +
		'Then the user object is passed to the callback in an array', function (done) {

		var mockDb = {
			view: function(viewName, parameters, cb) {
				cb(null, [{
					identity: 'IDENTITY'
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


	it ('Given many matching users are found ' +
		'When getting a user record by identity ' +
		'Then an error is passed to the callback', function (done) {

		var mockDb = {
			view: function(identity, parameters, cb) {
				cb(null, [{
					identity: 'IDENTITY'
				},{
					identity: 'IDENTITY'
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

	it ('Given user details ' +
		'When creating a user record ' +
		'Then the appropriate type of record is created', function (done) {

		var mockDb = {
			save: function (record) {
				record.identity.should.equal('IDENTITY')
				bcrypt.compareSync('PASSWORD', record.pwHash).should.equal(true)
				record.type.should.equal('user')
				record.identityConfirmed.should.equal(false)
				record.createdDate.should.exist
				done()
			}
		}
		var couch = new Couch(mockDb)
		couch.createUser('IDENTITY', 'PASSWORD')
	})

	it ('Given an error is thrown ' +
		'When creating a user record ' +
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

	it ('Given a record is successfully created ' +
		'When creating a user record ' +
		'Then the new record is returned', function (done) {

		var mockUser = {
			someProperty: 'some value'
		}
		var mockDb = {
			save: function (record, cb) {
				cb(null, mockUser)
			}
		}
		var couch = new Couch(mockDb)
		couch.createUser('IDENTITY', 'PASSWORD', function(e, result) {
			should.not.exist(e)
			result.should.equal(mockUser)
			done()
		})
	})

})
})