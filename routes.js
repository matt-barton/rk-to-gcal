'use strict'

module.exports = function(app){

	// GET/index
	app.get('/', function(request, response, next) {
	    response.render('index')
	})

}