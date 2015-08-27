'use strict'

module.exports = function(app){

	// GET /
	app.get('/', function(request, response, next) {
	    response.render('index')
	})
}