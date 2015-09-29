'use strict'

var should = require('should')

var Mailer = require('../lib/mailer')

describe('mailer', function() {

var mockSmtpTransport
var mockNodeMailer 
var mockFs
var mockRecipient
var mockTransport
var protectProcessEnv

before (function () {
	protectProcessEnv = {
		RK2GCAL_SMTP_HOST: process.env.RK2GCAL_SMTP_HOST,
		RK2GCAL_SMTP_PORT: process.env.RK2GCAL_SMTP_PORT,
		RK2GCAL_EMAIL_ADDRESS: process.env.RK2GCAL_EMAIL_ADDRESS,
		RK2GCAL_SMTP_PW: process.env.RK2GCAL_SMTP_PW
	}
})

after (function () {
	process.env.RK2GCAL_SMTP_HOST = protectProcessEnv.RK2GCAL_SMTP_HOST
	process.env.RK2GCAL_SMTP_PORT = protectProcessEnv.RK2GCAL_SMTP_PORT
	process.env.RK2GCAL_EMAIL_ADDRESS = protectProcessEnv.RK2GCAL_EMAIL_ADDRESS
	process.env.RK2GCAL_SMTP_PW = protectProcessEnv.RK2GCAL_SMTP_PW
})

beforeEach (function () {
	process.env.RK2GCAL_SMTP_HOST = 'the host'
	process.env.RK2GCAL_SMTP_PORT = 'the port'
	process.env.RK2GCAL_EMAIL_ADDRESS = 'the email address'
	process.env.RK2GCAL_SMTP_PW = 'the password'

	mockSmtpTransport = function () {}
	mockTransport = {
		sendMail: function () {}
	}
	mockNodeMailer = {
		createTransport: function () {
			return mockTransport
		}
	}
	mockFs = {
		readFileSync: function () {
			return ''
		}
	}
	mockRecipient = {
		identity: 'IDENTITY',
		activationCode: 'CONFIRMATION CODE'
	}
})

describe('sendIdentityConfirmation', function() {

	it ('Given no transport is set up\n' +
		'When an identity confirmation email is requested\n' +
		'Then a transport is set up', function (done) {

		mockSmtpTransport = function (options) {
			options.host.should.equal('the host')
			options.port.should.equal('the port')
			options.auth.user.should.equal('the email address')
			options.auth.pass.should.equal('the password')
			return mockTransport
		}

		mockNodeMailer.createTransport = function (transport) {
			done()
			return mockTransport
		}
		var mailer = new Mailer(mockNodeMailer, mockSmtpTransport, mockFs)

		mailer.sendIdentityConfirmation(mockRecipient, null, function(){})
	})

	it ('Given no transport is set up\n ' +
		'When an identity confirmation email is requested twice\n ' +
		'Then a transport is set up only once', function (done) {

		var called = 0
		mockNodeMailer.createTransport = function () {
			called++
			return mockTransport
		}
		var mailer = new Mailer(mockNodeMailer, mockSmtpTransport, mockFs)

		mailer.sendIdentityConfirmation(mockRecipient, null, function() {})
		mailer.sendIdentityConfirmation(mockRecipient, null, function() {
			called.should.equal(1)
			done()
		})
	})

	it ('Given a transport is set up\n ' +
		'When an identity confirmation email is requested\n ' +
		'Then the identity confirmation email template is obtained', function (done) {

		var mockFs = {
			readFileSync: function (filename, options) {
				filename.should.equal('email-templates/identityConfirmation.tmpl')
				options.encoding.should.equal('utf-8')
				done()
				return ''
			}
		}
		var mailer = new Mailer(mockNodeMailer, mockSmtpTransport, mockFs)

		mailer.sendIdentityConfirmation(mockRecipient, null, function() {})
	})

	it ('Given a transport is set up\n' +
		'When an identity confirmation email is requested\n ' +
		'Then an email is sent via the transport', function (done) {

		mockFs.readFileSync = function () {
			return 'email content {{url}} {{code}}'
		}
		mockNodeMailer.createTransport = function (transport) {
			return {
				sendMail: function (options) {
					options.from.should.equal('the email address')
					options.to.should.equal('IDENTITY')
					options.subject.should.equal('Activate your account')
					options.text.should.equal('email content http://rk2gcal/auth/activate?x=CONFIRMATION CODE CONFIRMATION CODE')
					done()
				}
			}
		}
		var recipient = {
			identity: 'IDENTITY',
			activationCode: 'CONFIRMATION CODE'
		}
		var mailer = new Mailer(mockNodeMailer, mockSmtpTransport, mockFs)
		mailer.sendIdentityConfirmation(recipient, 'rk2gcal', function() {})
	})
})
})