'use strict'

var should = require('should')
var utils = require('../lib/utils')

describe('utils', function() {

	describe('buildUrl', function() {

		it ('Given a base url ' +
			'and no query parameters '+
			'When a url is built ' +
			'Then the base url is returned', function(done){
			var baseUrl = '<base url>'
			var test = utils.buildUrl(baseUrl, {})
			test.should.equal(baseUrl)
			done()
		})

		it ('Given a base url ' +
			'and one parameter ' +
			'When a url is built ' +
			'Then a url containing the parameter is returned', function (done) {
			var baseUrl = 'http://example.com'
			var parameters = {
				'param1': 'value1'
			}
			var test = utils.buildUrl(baseUrl, parameters)
			test.should.equal('http://example.com?param1=value1')
			done();
		})

		it ('Given a base url ' +
			'and many parameters ' +
			'When a url is built ' +
			'Then a url containing all the parameters is returned', function (done) {
			var baseUrl = 'http://example.com'
			var parameters = {
				'p1': 'v1',
				'p2': 'v2',
				'p3': 'v3'				
			}
			var test = utils.buildUrl(baseUrl, parameters)
			test.should.equal('http://example.com?p1=v1&p2=v2&p3=v3')
			done();
		})


		it ('Given a parameter with special characters ' +
			'When a url is built ' +
			'Then a url containing url-encoded characters is returned', function (done) {
			var baseUrl = 'http://example.com'
			var parameters = {
				'p1': 'v 1',
				'p2': 'v&2'				
			}
			var test = utils.buildUrl(baseUrl, parameters)
			test.should.equal('http://example.com?p1=v%201&p2=v%262')
			done();
		})

	})
})
