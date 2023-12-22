module.exports = {
	env: Object.assign(process.env, require('dotenv').config({path: '.env.local'}).parsed)
}
