'use strict'

module.exports = {
	
	assertHandlerExists: function (done, path, method, useMiddleware, useAuthMiddleware) {

		var correctUri = false
		var mockFn = function mockFn () {
			var who = 'i am the mock authentication middleware'
		}
		var mockAuth = {
			requiresAuthentication: mockFn
		}
		var mockExpressApp = {
			post: function (uri, fn) {
				if (uri == path) {
					if (method == 'POST') correctUri = true
				}
			}, 

			get: function (uri, fn1, fn2) {

				if (uri == path) {
					if (method == 'GET') correctUri = true
					var fn1Type = typeof fn1
					var fn2Type = typeof fn2

					fn1Type.should.equal('function')
					fn2Type.should.equal(useMiddleware 
						? 'function' 
						: 'undefined')

					if (useAuthMiddleware) {
						fn1.should.equal(mockFn)
					}

					done()
				}
			},

			use: function () {},

			lib: {
				auth: mockAuth
			}
		}

		var routes = require('../lib/routes')(mockExpressApp)
		correctUri.should.equal(true)
	}
}