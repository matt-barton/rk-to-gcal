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

		if (data.identity == null || data.password == null) {
			var message = data.identity == null
				? 'Unknown email address or password'
				: 'Password is required'
		    response.render('login', {
		    	loginError: message
		    })		
		}
		else {
			auth.login(data.identity, data.password, function(e) {
				if (e) return response.render('error')
				response.render('account')
			})
		}
	})

	// GET /auth/runkeeper
	app.get('/auth/runkeeper', auth.requiresAuthentication, function (request, response, next) {
		app.lib.rk.redirectToRKAuth(response)
	})
}