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

mailer.prototype.sendIdentityConfirmation = function (callback) {

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
	this.fs.readFileSync('email-templates/identityConfirmation.tmpl', {
		encoding: 'utf-8'
	})
	callback()
}

module.exports = mailer