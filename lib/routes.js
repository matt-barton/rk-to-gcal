'use strict'

module.exports = function(app, rk){

	// GET /
	app.get('/', function(request, response, next) {
	    response.render('index')
	})

	// GET /auth/runkeeper
	app.get('/auth/runkeeper', function (request, response, next) {
		rk.redirectToRKAuth(response)
	})
}