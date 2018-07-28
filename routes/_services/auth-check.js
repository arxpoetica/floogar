import jwt from 'jsonwebtoken'

export const validate = function(req) {
	try {
		return jwt.verify(req.cookies.ds, process.env.JWT_SECRET)
	} catch (error) {
		return {
			unauthorized: true,
			message: 'Unauthorized',
		}
	}
}
