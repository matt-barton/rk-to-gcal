'use strict'

function runkeeper (options, app) {
	this.options = options
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