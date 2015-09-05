'use strict'

module.exports = function(app){

	var auth = app.lib.auth
	var utils = app.lib.utils

	// GET /
	app.get('/', function(request, response, next) {
	    response.render('index')
	})

	// GET /auth/login
	app.get('/auth/login', function(request, response){
	    response.render('login')
	})

	// POST /auth/login
	app.post('/auth/login', function(request, response, next) {

		var data = request.body

		var onAuthDenied = function (message) {
		    response.render('login', {
		    	loginError: message
		    })		
		}

		if (!utils.validString(data.identity) ||
			!utils.validString(data.password)) {
			onAuthDenied(!utils.validString(data.identity)
				? 'Unknown email address or password'
				: 'Password is required')
		}
		else {
			auth.login(request, function(e, result) {
				if (e) return next(e)
				if (result) return response.render('account')
				onAuthDenied('Unknown email address or password')
			})
		}
	})

	// GET /auth/register
	app.get('/auth/register', function (request, response) {
		response.render('register')
	})

	// POST /auth/register
	app.post('/auth/register', function (request, response, next) {
		var data = request.body

		var onFailure = function (message) {
		    response.render('register', {
		    	registrationError: message
		    })		
		}

		if (!utils.validString(data.identity) ||
			!utils.validString(data.password) || 
			!utils.validString(data.pwRepeat)) {
			return onFailure(!utils.validString(data.identity)
				? 'Email address is required'
				: !utils.validString(data.password)
					? 'Password is required'
					: 'Password is required twice')
		}

		if (data.password != data.pwRepeat) return onFailure ('Password and Repeat do not match')
		if (data.password.length < 10) return onFailure ('Password should be 10 characters or longer')
		if (data.password == data.identity) return onFailure ('Password cannot be the same as your email address')

		auth.register(request, function (e) {
			if (e) return next (e)
		})	
	})


	// GET /auth/runkeeper
	app.get('/auth/runkeeper', auth.requiresAuthentication, function (request, response, next) {
		app.lib.rk.redirectToRKAuth(response)
	})

	// error handling
	app.use(function(e, request, response, next) {
		if (response.headersSent) {
			return next(e)
		}
		response.status = 500
		response.render('error', {
			message: process.env.NODE_ENV == 'production'
				? 'An unexpected error occurred.'
				: e.message
		})
	})
}