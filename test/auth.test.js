'use strict'

var should = require('should')

describe ('auth', function () {

	describe ('requiresAuthentication', function () {

		it ('Given a request session doesn\'t exist ' +
			'When authentication status is tested ' +
			'Then the result.redirect method is invoked', function (done) {

			var redirectCalled = false
			var mockRequest = {

			}
			var mockResult = {
				redirect: function() {
					redirectCalled = true
					done()
				}
			}

			var auth = require ('../lib/auth')

			auth.requiresAuthentication(mockRequest, mockResult)

			redirectCalled.should.equal(true)
		})
	})
})