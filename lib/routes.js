'use strict'

module.exports = function(app, rk){

	// GET /
	app.get('/', function(request, response, next) {
	    response.render('index')
	})

	// GET /rkConnect
	app.get('/rkConnect', function (request, response, next) {
		rk.redirectToRKAuth(response)
	})
}