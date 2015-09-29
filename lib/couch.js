'use strict'

var bcrypt = require ('bcrypt-nodejs')
var utils = require('./utils')
var uuid = require('node-uuid')
var async = require('async')

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
	var that = this
	var user
	if (!identity) return callback(new Error('No identity supplied'))

	async.series([
		function (complete) {
			that.getUserByIdentity(identity, function (e, result) {
				if (e) return callback(e)
				user = result[0]
				user.identityConfirmed = true
				user.activatedDate = utils.UTCNow()
				complete()
			})
		},
		function (complete) {
			that.db.save(user, function(e) {
				if (e) return callback(e)
				callback(null, {
					success: true
				})
				complete()
			})
		}
	])
}

couch.prototype.saveUserRKCode = function (identity, rkCode, callback) {
	var that = this
	var user
	if (!identity) return callback(new Error ('No user identity supplied to save RK code for.'))
	if (!rkCode) return callback(new Error ('No rk code supplied to save for user.'))

	async.series([
		function (complete) {
			that.getUserByIdentity(identity, function(e, result) {
				if (e) return callback(e)
				user = result[0]
				user.rkCode = rkCode
				user.rkConnectedDate = utils.UTCNow()
				complete()
			})			
		},
		function (complete) {
			that.db.save(user, function (e) {
				if (e) return callback(e)
				callback(null, {
					success: true
				})
				complete()
			})
		}
	])
}

module.exports = couch