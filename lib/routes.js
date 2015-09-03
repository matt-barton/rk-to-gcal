'use strict'

module.exports = function(app){

	var auth = app.lib.auth

	// GET /
	app.get('/', function(request, response, next) {
	    response.render('index')
	})

	// GET /auth/login
	app.get('/auth/login', function(request, response){
	    response.render('login')
	})

	// POST /auth/login
	app.post('/auth/login', function(request, response) {

		var data = request.body

		var onAuthDenied = function (message) {
		    response.render('login', {
		    	loginError: message
		    })		
		}

		if (data.identity == null || data.password == null) {
			onAuthDenied(data.identity == null
				? 'Unknown email address or password'
				: 'Password is required')
		}
		else {
			auth.login(data.identity, data.password, function(e, result) {
				if (e) return response.render('error')
				if (result) return response.render('account')
				onAuthDenied('Unknown email address or password')
			})
		}
	})

	// GET /auth/runkeeper
	app.get('/auth/runkeeper', auth.requiresAuthentication, function (request, response, next) {
		app.lib.rk.redirectToRKAuth(response)
	})
}