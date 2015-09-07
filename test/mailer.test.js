'use strict'

var should = require('should')

var Mailer = require('../lib/mailer')

describe('mailer', function() {

var mockSmtpTransport
var mockNodeMailer 
var mockFs

beforeEach (function () {
	process.env.RK2GCAL_SMTP_HOST = 'the host'
	process.env.RK2GCAL_SMTP_PORT = 'the port'
	process.env.RK2GCAL_EMAIL_ADDRESS = 'the email address'
	process.env.RK2GCAL_SMTP_PW = 'the password'

	mockSmtpTransport = function () {}
	mockNodeMailer = {
		createTransport: function () {}
	}
	mockFs = {
		readFileSync: function () {}
	}

})

describe('sendIdentityConfirmation', function() {

	it ('Given no transport is set up ' +
		'When an identity confirmation email is requested ' +
		'Then a transport is set up', function (done) {

		mockSmtpTransport = function (options) {
			options.host.should.equal('the host')
			options.port.should.equal('the port')
			options.auth.user.should.equal('the email address')
			options.auth.pass.should.equal('the password')
			return 'woof'
		}

		mockNodeMailer = {
			createTransport: function (transport) {
				transport.should.equal('woof')
				done()
			}
		}
		var mailer = new Mailer(mockNodeMailer, mockSmtpTransport, mockFs)

		mailer.sendIdentityConfirmation(function(){})
	})

	it ('Given no transport is set up ' +
		'When an identity confirmation email is requested twice ' +
		'Then a transport is set up only once', function (done) {

		var called = 0
		var mockNodeMailer = {
			createTransport: function () {
				called++
				return 1
			}
		}
		var mailer = new Mailer(mockNodeMailer, mockSmtpTransport, mockFs)

		mailer.sendIdentityConfirmation(function() {})
		mailer.sendIdentityConfirmation(function() {
			called.should.equal(1)
			done()
		})
	})

	it ('Given a transport is set up ' +
		'When an identity confirmation email is requested ' +
		'Then the identity confirmation email template is obtained', function (done) {

		var mockFs = {
			readFileSync: function (filename, options) {
				filename.should.equal('email-templates/identityConfirmation.tmpl')
				options.encoding.should.equal('utf8')
				done()
			}
		}
		var mailer = new Mailer(mockNodeMailer, mockSmtpTransport, mockFs)

		mailer.sendIdentityConfirmation(function() {})
	})

	// sends an email to the recipient

})
})