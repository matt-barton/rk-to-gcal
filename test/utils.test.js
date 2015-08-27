'use strict'

var should = require('should')
var utilsModule = require('../lib/utils')

describe('utils', function() {

	describe('buildUrl', function() {
		it ('Given a base url ' +
		'and no query parameters '+
		'When a url is built ' +
		'Then the base url is returned', function(done){
			var utils = new utilsModule
			var baseUrl = '<base url>'
			var test = utils.buildUrl(baseUrl, {})
			test.should.equal(baseUrl)
			done()
		})
	})
})
