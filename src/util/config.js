//
// Application configuration
//
const secretkey = process.env.JWT_KEY || 'DitIsEenGeheim'

const config = {
    secretkey: secretkey,
}

module.exports = config
