import { api } from '../../../db/arangodb-api'
import mappers from '../../utils/mappers'

export default {
	Query: {
		users: async function() {
			const users = await api.getAll('users')
			return users.map(user => mappers.user(user))
		},
		user: async function(_, { username }) {
			const user = await api.get('users', username)
			return mappers.user(user)
		},
	},
	// Mutation: {
	// 	addUser: (_, data) => {
	// 		const uid = uuid()
	// 		users[uid] = Object.assign({}, data, {
	// 			id: uid,
	// 		})
	// 		return friendsMapper(uid)
	// 	},
	// },
	// User: {
	// },
}
