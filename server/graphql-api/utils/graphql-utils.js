// SEE: https://github.com/tadejstanic/graphql-api-example/blob/f8a8dd4f19f25bee8a9d32005ae047e0b7edf4e0/src/lib/graphqlFileLoader.js

import fs from 'fs'
import path from 'path'
import util from 'util'
import { merge } from 'lodash'
import globby from 'globby'
const readFile = util.promisify(fs.readFile)

export const loadTypes = async pattern => {
	try {
		const files = await globby(pattern)
		if (!files.length) { throw new Error('globby found zero GraphQL type definition files. What gives?') }
		const filePromises = files.map(filename => readFile(filename, 'utf8'))
		const loadedFiles = await Promise.all(filePromises)
		return loadedFiles.join('\n')
	} catch (error) {
		throw new Error(error)
	}
}

export const loadResolvers = async pattern => {
	try {
		const files = await globby(pattern)
		if (!files.length) { throw new Error }
		const imports = files.map(filename => filename.split('/server/graphql-api/models/')[1])
		const modulePromises = imports.map(importPath => import('../models/' + importPath))
		const loadedModules = await Promise.all(modulePromises)
		return merge(...loadedModules).default
	} catch (error) {
		throw new Error(error)
	}
}
