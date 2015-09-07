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
	},

	validString: function (theString) {
		if (theString === null) return false
		var type = typeof theString
		if (type != 'string') return false
		if (theString.length == 0) return false
		if (theString.trim().length == 0) return false
		return true
	},

	UTCNow: function () {
		return new Date()
			.toISOString()
			.replace(/T/, ' ')
			.replace(/\..+/, '')
	}
}