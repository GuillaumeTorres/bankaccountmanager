let express = require('express')
let router = express.Router()
let User  = require('../db/db').User

const checkAccount = (user_id, amount) => {
    User.findOne({ _id: user_id })
        .then(user => {
            return amount <= user.balance
        })
}

/**
 * @api {get} /operation/transfer Simple transfer
 * @apiName transfer
 * @apiGroup Operation
 *
 * @apiParam {Number} user_id   Id of receiver user
 * @apiParam {Number} amount    Amount to transfer
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          success: 'transfer successful'
       }
 */
router.post('/transfer', (req, res) => {
    const amount = req.body.amount
    if (checkAccount(req.user._id, amount)) return res.status(400).send({error: 'insufficient amount'})

    User.findOneAndUpdate({ _id: req.user._id }, { $inc: { balance: amount * -1}})
        .then(user => {
            console.log(req.body.user_id)
            User.findOneAndUpdate({ _id: req.body.user_id }, { $inc: { balance: amount}})
                .then(res.send({success: 'transfer successful'}))
                .catch(err => res.status(404).send(err.message || 500))
            }
        )
        .catch(err => res.status(404).send(err.message || 500))
})

module.exports = router;