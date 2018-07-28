export const preloader = function(query, convertRawKeys) {
	convertRawKeys = convertRawKeys ? convertRawKeys : []
	convertRawKeys = Array.isArray(convertRawKeys) ? convertRawKeys : [convertRawKeys]
	return function() {
		return this
			.fetch('api/pure-graphql', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ query }),
			})
			.then(response => response.json())
			.then(json => {
				convertRawKeys.forEach(key => {
					json.data[key] = JSON.parse(json.data[key])
				})
				return json.data
			})
	}
}

export const fetchJSON = async function(url, body) {
	const options = {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'same-origin',
	}
	if (body) {
		options.method = 'POST'
		options.body = JSON.stringify(body)
	}
	const response = this ? await this.fetch(url, options) : await fetch(url, options)
	return await response.json()
}
