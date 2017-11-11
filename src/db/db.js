let mongoose = require('mongoose');
let Schema = mongoose.Schema

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

let Transfer = mongoose.model('Transfer', {
    user_sender: { type: Schema.ObjectId, required: true },
    user_target: { type: Schema.ObjectId, required: true },
    amount: { type: Number, required: true },
    job_name: { type: String, required: true },
    day: { type: Number, required: true }
})

module.exports.User = User
module.exports.Transfer = Transfer