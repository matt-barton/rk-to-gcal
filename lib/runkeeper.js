'use strict'

function runkeeper (options, app) {
	this.options = options
	options.client_id = process.env.RK2GCAL_RK_CLIENT_ID
	options.client_secret = process.env.RK2GCAL_RK_CLIENT_SECRET
	this.utils = app.lib.utils
}

runkeeper.prototype.redirectToRKAuth = function (response) {

    var urlParams = {
        client_id: this.options.client_id,
        response_type: 'code',
        redirect_uri: this.options.redirect_uri
    }
	var url = this.utils.buildUrl(this.options.auth_url, urlParams)
	response.writeHead(301, {
		Location: url
	})
	response.end()
}

module.exports = runkeeper