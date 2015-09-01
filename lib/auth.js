'use strict'

module.exports = {

	requiresAuthentication: function(request, response) {
		if (request.session == null) response.redirect()
	}
}