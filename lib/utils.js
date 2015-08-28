'use strict'

module.exports = {
	
	buildUrl: function (base, queryParams) {
		var paramCounter = 0
		for (var key in queryParams) {
			if (queryParams.hasOwnProperty(key)) {
				paramCounter++
				if (paramCounter == 1) {
					base += '?'
				}
				if (paramCounter > 1) base += '&'
				base += key + '=' + encodeURIComponent(queryParams[key])
			}
		}
		return base
	}
}