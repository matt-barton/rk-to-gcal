'use strict'

var should = require('should')
var Couch = require('../lib/couch')

describe('couch', function () {

describe('getUserByIdentity', function() {

	it ('Given an identity is supplied ' +
		'When getting a user record by identity ' +
		'Then the users/all view is queried', function (done) {

		var identity = 'IDENTITY'
		var mockDb = {
			view: function(viewName, parameters, cb) {
				viewName.should.equal('users/all')
				parameters.should.be.type('object')
				parameters.identity.should.equal('IDENTITY')
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
		'Then the user object is passed to the callback', function (done) {

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
			result.identity.should.equal('IDENTITY')
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
})