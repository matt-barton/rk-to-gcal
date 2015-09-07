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
		done()
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
		done()
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
		done()
	})
})

describe('validString', function() {

	it ('Given the variable to test is undefined ' +
		'When testing string validity ' +
		'Then false is returned', function (done) {
		var result = utils.validString()
		result.should.equal(false)
		done()		
	})

	it ('Given the variable to test is null ' +
		'When testing string validity ' +
		'Then false is returned', function (done) {
		var result = utils.validString(null)
		result.should.equal(false)
		done()		
	})

	it ('Given the variable to test is an array ' +
		'When testing string validity ' +
		'Then false is returned', function (done) {
		var result = utils.validString([])
		result.should.equal(false)
		done()		
	})

	it ('Given the variable to test is an object ' +
		'When testing string validity ' +
		'Then false is returned', function (done) {
		var result = utils.validString(new Object)
		result.should.equal(false)
		done()		
	})

	it ('Given the variable to test is an empty string ' +
		'When testing string validity ' +
		'Then false is returned', function (done) {
		var result = utils.validString('')
		result.should.equal(false)
		done()		
	})

	it ('Given the variable to test is a string containing just whitespace ' +
		'When testing string validity ' +
		'Then false is returned', function (done) {
		var result = utils.validString('   ')
		result.should.equal(false)
		done()		
	})

	it ('Given the variable to test is a string non-whitespace characters ' +
		'When testing string validity ' +
		'Then true is returned', function (done) {
		var result = utils.validString('  x ')
		result.should.equal(true)
		done()		
	})
})

describe('UTCNow', function () {

	it ('When a UTC formatted timestamp is requested ' +
		'Then a correctly formatted string is returned', function (done) {

		var result = utils.UTCNow()
		var regex = new RegExp(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
		var success = regex.test(result)
		success.should.equal(true)
		done()
	})
})
})
