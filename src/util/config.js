//
// Application configuration
//
const secretkey = process.env.JWT_SECRET || 'DitIsEenGeheim'

const config = {
    secretkey: secretkey,
}

module.exports = config
