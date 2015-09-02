'use strict'

module.exports = {

	requiresAuthentication: function (request, response, next) {
		if (request.session != null && 
			request.session.user != null && 
			request.session.user.identity != null) return next()
		response.redirect('/auth/login')
	}
}