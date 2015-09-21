'use strict'

function mailer (nodeMailer, smtpTransport, fs) {

	this.transport = null

	this.nodeMailer = nodeMailer
		? nodeMailer
		: require('nodemailer')

	this.smtpTransport = smtpTransport
		? smtpTransport
		: require('nodemailer-smtp-transport')

	this.fs = fs
		? fs
		: require('fs')
}

mailer.prototype.sendIdentityConfirmation = function (recipient, host, callback) {

	if (this.transport == null) {
		this.transport = this.nodeMailer.createTransport(this.smtpTransport({
			host: process.env.RK2GCAL_SMTP_HOST,
			port: process.env.RK2GCAL_SMTP_PORT,
			auth: {
				user: process.env.RK2GCAL_EMAIL_ADDRESS,
				pass: process.env.RK2GCAL_SMTP_PW
			}
		}))
	}
	var template = this.fs.readFileSync('email-templates/identityConfirmation.tmpl', {
		encoding: 'utf-8'
	})

	var url = 'http://' + host + '/auth/activate?x=' + recipient.confirmationCode

	this.transport.sendMail({
		from: process.env.RK2GCAL_EMAIL_ADDRESS,
		to: recipient.identity,
		subject: 'Activate your account',
		text: template.replace('{{url}}', url)

	}, function (e, info) {
		if (e) console.error(e)
	})
	if (typeof callback == 'function') callback()
}

module.exports = mailer