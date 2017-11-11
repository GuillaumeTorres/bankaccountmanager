let express = require('express')
let router = express.Router()
let Transfer = require('../db/db').Transfer
let schedule = require('node-schedule')

/**
 * @api {get} /transfer Show current user transfer
 * @apiName showTransfer
 * @apiGroup Transfer
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *  [
     {
         "_id": "59ff1f2556860f15e87623ae",
         "user_sender": "59f8a00c74d1b12b0830a3bc",
         "user_target": "59fb319d506d82553b2fb6d5",
         "amount": 20,
         "job_name": "1509891877",
         "day": 5,
         "__v": 0
     }
    ]
 */
router.get('/', (req, res) => {
    Transfer.find({ user_sender: req.user._id })
        .then(transfers => res.send(transfers))
        .catch(err => res.status(404).send(err.message || 500))
})

/**
 * @api {delete} /transfer Show current user transfer
 * @apiName showTransfer
 * @apiGroup Transfer
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
            "success": "Transfer deleted"
       }
 */
router.delete('/delete/:id', (req, res) => {
    Transfer.findOne({ _id: req.params.id })
        .then(transfer => {
            Transfer.remove({ _id: req.params.id })
                .then(response => {
                    let job = schedule.scheduledJobs[transfer.job_name]
                    job.cancel()
                    res.send({success: 'job deleted'})
                })
                .catch(err => res.status(404).send(err.message || 500))
        })
})

module.exports = router;