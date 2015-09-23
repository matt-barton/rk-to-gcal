'use strict'

var bcrypt = require('bcrypt-nodejs')

function auth (app) {
	this.db = app.lib.db
	this.utils = app.lib.utils
	this.emailer = app.lib.emailer
}

auth.prototype.requiresAuthentication = function requiresAuthentication (request, response, next) {
	if (request.session != null && 
		request.session.user != null && 
		request.session.user.identity != null) return next()
	response.redirect('/auth/login')
}

auth.prototype.login = function login (request, callback) {

	var identity = request.body.identity
	var password = request.body.password
	if (typeof identity == 'undefined' ||
	    identity == null ||
	    identity.length == 0) {
		return callback(new Error('Username is required'))
	}
	if (typeof password == 'undefined' ||
	    password == null ||
	    password.length == 0) {
		return callback(new Error('Password is required'))
	}

	this.db.getUserByIdentity(identity, function(e, result) {
		if (e) return callback(e)
		if (result.length == 0) return callback(null, false)
		var user = result[0]
		if (bcrypt.compareSync(password, user.pwHash)) {
			request.session.user = user
			return callback(null, user)
		}
		else {
			return callback(null, false)
		}
	})
}

auth.prototype.register = function register (request, callback) {

	var db = this.db
	var emailer = this.emailer
	var identity = request.body.identity
	var password = request.body.password

	var onFail = function (message) {
		callback(null, {
			success: false,
			message: message
		})
	}

	if (!this.utils.validString(identity) ||
		!this.utils.validString(password)) {
		return onFail(this.utils.validString(identity) 
				? 'Password is required'
				: 'Username is required')
	}
	db.getUserByIdentity(identity, function (e, result) {
		if (e) return callback(e)
		if (result.length > 0) {
			return onFail('That email address is already registered')
		}
		db.createUser(identity, password, function (e, result) {
			if (e) return callback(e)
			request.session.user = result
			emailer.sendIdentityConfirmation(result, request.headers.host)
			callback(null, {
				success: true
			})
		})
	})
}

auth.prototype.logout = function logout (request, callback) {
	request.session.user = null
	callback()
}

module.exports = auth