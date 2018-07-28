import { init, goto } from 'sapper/runtime.js'
import { Store } from 'svelte/store.js'
import { manifest } from './manifest/client.js'

init({
	target: document.querySelector('#sapper'),
	// `data` is whatever was in the server-side store
	store: data => {
		const store = new Store(data)

		// TODO: do we really only need to check if the cookie is set?
		// someone *could* fake the cookie, right?
		fetch('api/paywall.json', {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'same-origin',
		}).then(res => res.json()).then(test => {
			const user = JSON.parse(window.localStorage.getItem('ds'))
			if (test.authentic && user) {
				store.set({ user })
			} else {
				window.localStorage.removeItem('ds')
				// SEE: https://stackoverflow.com/questions/10593013/delete-cookie-by-name
				document.cookie = 'ds=;expires=Sun, 09 Jan 1974 00:00:01 GMT;';
				store.set({ user: null })
			}
			// TODO: is this acceptable? I think it's probably okay...
			setTimeout(() => store.set({ loaded: true }), 250)
		})

		store.set({
			signout: () => {
				return fetch('auth/signout', { method: 'POST'/* , credentials: 'include' */ }).then(() => {
					window.localStorage.removeItem('ds')
					// SEE: https://stackoverflow.com/questions/10593013/delete-cookie-by-name
					document.cookie = 'ds=;expires=Sun, 09 Jan 1974 00:00:01 GMT;';
					store.set({ user: null })
					goto('/')
				})
			},
		})

		window.store = store
		return store
	},
	manifest,
})
