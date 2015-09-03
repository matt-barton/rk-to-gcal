'use strict'

module.exports = function(app){

	var auth = app.lib.auth

	// GET /
	app.get('/', function(request, response, next) {
	    response.render('index')
	})

	// GET /auth/login
	app.get('/auth/login', function(){

	})

	// GET /auth/runkeeper
	app.get('/auth/runkeeper', auth.requiresAuthentication, function (request, response, next) {
		app.lib.rk.redirectToRKAuth(response)
	})
}