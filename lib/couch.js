'use strict'

var bcrypt = require ('bcrypt-nodejs')
var utils = require('./utils')
var uuid = require('node-uuid')

function couch(db) {
	this.db = db
}

couch.prototype.getUserByIdentity = function (identity, callback) {
	this.db.view('users/byIdentity', {
		key: identity
	}, function(e, result) {
		if (e) return callback(e)
		if (result.length > 1) {
			var error = new Error('Database integrity error: multiple user records with identity = ' + identity)
			return callback(error)
		}
		if (result.length == 0) return callback(null, [])
		callback(null, [result[0].value])
	})
}

couch.prototype.createUser = function(identity, password, callback) {
	var user = {
		type: 'user',
		identityConfirmed: false,
		identity: identity,
		pwHash: bcrypt.hashSync(password),
		createdDate: utils.UTCNow(),
		activationCode: uuid.v1().replace(/-/g, '')
	}
	this.db.save(user, function(e, result) {
		if (e) return callback(e)
		user.id = result.id
		callback(null, user)
	})
}

couch.prototype.activateUser = function (identity, callback) {
	var db = this.db
	if (!identity) return callback(new Error('No identity supplied'))
	this.getUserByIdentity(identity, function (e, result) {
		if (e) return callback(e)
		var user = result[0]
		user.identityConfirmed = true
		user.activatedDate = utils.UTCNow()
		db.save(user, function(e) {
			if (e) return callback(e)
			callback(null, {
				success: true
			})
		})
	})
}

module.exports = couch