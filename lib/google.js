'use strict'

function google (options, app) {
	this.options = options
	this.options.client_id = process.env.RK2GCAL_GOOGLE_CLIENT_ID
	this.options.client_secret = process.env.RK2GCAL_GOOGLE_CLIENT_SECRET
	this.utils = app.lib.utils
	this.googleAuth = app.lib.googleAuth
}

google.prototype.redirectToAuth = function redirectToAuth(request, response) {
	var redirectUrl = 'http://' + request.headers.host + '/auth/google/callback'
	var oAuthClient = new this.googleAuth.OAuth2(
		this.options.client_id,
		this.options.client_secret,
		redirectUrl)
	var authUrl = oAuthClient.generateAuthUrl({
		access_type: 'offline',
		scope: [
		 'https://www.googleapis.com/auth/calendar'
		]
	})
	response.writeHead(301, {
		Location: authUrl
	})
	response.end()
}

module.exports = google