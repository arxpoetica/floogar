const dotenv = require('dotenv-extended')
const dotenvExpand = require('dotenv-expand')
const dotenvParseVariables = require('dotenv-parse-variables')

// NOTE: this doesn't actually set the environment variable -- it just tells dotenv whether to be silent or not
const silent = !!(process.env.NODE_ENV || 'development').match(/(production|staging)/g)
const settings = { silent }
let config = dotenv.load(settings)

// TODO: I'm not sure `dotenvExpand` and `dotenvParseVariables` are
// working their way down to `process.env`
config = dotenvExpand(config)
config = dotenvParseVariables(config)
config.self = true

module.exports = process.env
