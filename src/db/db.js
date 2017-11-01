let mongoose = require('mongoose');

const localUri = 'mongodb://localhost/bankaccountmanager'

mongoose.connect(localUri, { useMongoClient: true })

let User = mongoose.model('User', {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    balance: { type: Number, required: true, default: 500 },
	password: { type: String, required: true },
	salt: String
})

module.exports.User = User