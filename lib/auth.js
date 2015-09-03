'use strict'

var bcrypt = require('bcrypt-nodejs')

function auth (db) {
	this.db = db
}

auth.prototype.requiresAuthentication = function requiresAuthentication (request, response, next) {
	if (request.session != null && 
		request.session.user != null && 
		request.session.user.identity != null) return next()
	response.redirect('/auth/login')
}

auth.prototype.login = function login (username, password, callback) {
	if (typeof username == 'undefined' ||
	    username == null ||
	    username.length == 0) {
		return callback(new Error('Username is required'))
	}
	if (typeof password == 'undefined' ||
	    password == null ||
	    password.length == 0) {
		return callback(new Error('Password is required'))
	}

	this.db.getUser(username, function(e, result) {
		if (e) return callback(e)
		if (result.length == 0) return callback(null, false)
		var user = result[0]
		return callback(null, bcrypt.compareSync(password, user.pwHash)
			? user
			: false)
	})
}

module.exports = auth