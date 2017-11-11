let express = require('express')
let router = express.Router()
let User  = require('../db/db').User
let Transfer  = require('../db/db').Transfer
let mailer = require('../services/mailer')
let schedule = require('node-schedule')

/**
 * @api {post} /operation/transfer Simple transfer
 * @apiName transfer
 * @apiGroup Operation
 *
 * @apiParam {Number} user_id   Id of receiver user
 * @apiParam {Number} amount    Amount to transfer
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          success: 'Transfer successful'
       }
 */
router.post('/transfer', (req, res) => {
    transferOperation(req.user, req.body.user_id, req.body.amount, res)
})

/**
 * @api {post} /operation/permanent_transfer Simple transfer
 * @apiName permanentTransfer
 * @apiGroup Operation
 *
 * @apiParam {Number} user_id   Id of receiver user
 * @apiParam {Number} amount    Amount to transfer
 * @apiParam {Number} day       Day of month
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          success: 'Operation complete'
       }
 */
router.post('/permanent_transfer', (req, res) => {

    const jobId = Math.floor(Date.now() / 1000).toString()
    const targetUserId = req.body.user_id
    const currentUser = req.user
    const amount = req.body.amount
    const day = req.body.day

    schedule.scheduleJob(jobId, `00 25 15 ${day} * *`, () => {
        transferOperation(currentUser, targetUserId, amount, res, true)
    },
    true, // Start the job right now
    'Europe/Paris'
    )
    const transferData = {
        user_sender: currentUser._id,
        user_target: targetUserId,
        amount: amount,
        job_name: jobId,
        day: day
    }
    const transfer = new Transfer(transferData)
    transfer.save()
        .then(transfer => res.send(transfer))
        .catch(err => res.status(400).send(err.message || 500))
    // Exemple to get by id
})

const checkAccount = (user_id, amount, res) => {
    User.findOne({ _id: user_id })
        .then(user => {
            res(amount <= user.balance)
        })
        .catch(err => console.log(err))
}

const transferOperation = (userFrom, userTo, amount, res, permanent = false) => {
    checkAccount(userFrom._id, amount, (isValid) => {
        if (!isValid) {
            let body = '<h2>Virement refusé</h2>' +
                '<p>Les fonds sur votre virement ne sont pas suffisants, votre virement mensuel a été annulé</p>'
            let mailOptions = {
                from: '"Admin" <admin@airbnblike.com>',
                to: userFrom.email,
                subject: 'Virement refusé',
                html: body
            }
            mailer(mailOptions)

            if (!permanent) res.send({error: 'Insufficient balance'})
            console.log(`User transfer failed: ${userFrom.email}(${userFrom._id})`)
            return
        }

        User.findOneAndUpdate({ _id: userFrom }, { $inc: { balance: amount * -1}})
            .then(user => {
                User.findOneAndUpdate({ _id: userTo }, { $inc: { balance: amount}})
                    .then(user => {
                        if (!permanent) res.send({success: 'Transfer successful'})
                    })
                    .catch(err => console.log(err))
            })
    })
}

module.exports = router;