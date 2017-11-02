let express = require('express')
let router = express.Router()
let User = require('../db/db').User
let bcrypt = require('bcrypt')
let mailer = require('../services/mailer')

const formatUser = user => {
    user.password = undefined
    user.salt = undefined

    return user
}

/**
 * @api {get} /user Show current user
 * @apiName showUser
 * @apiGroup User
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
            first_name: "Jean",
            last_name: "Dupond",
            email: "jean@gmail.com"
       }
 */
router.get('/', (req, res) => {
    User.findOne({ _id: req.user._id })
        .then(formatUser)
        .then(user => res.send(user))
        .catch(err => res.status(404).send(err.message || 500))
})

/**
 * @api {put} /user/edit/:id Edit User
 * @apiName editUser
 * @apiGroup User
 *
 * @apiParam {String} username      Username
 * @apiParam {String} first_name    First name
 * @apiParam {String} last_name     Last name
 * @apiParam {String} email         Email address
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
            first_name: "Jean",
            last_name: "Dupond",
            email: "jean.dupond@gmail.com"
       }
 */
router.put('/edit/:id', (req, res) => {
    User.findOneAndUpdate({ _id: req.params.id }, req.body)
        .then(formatUser)
        .then(user => res.send(user))
        .catch(err => res.status(404).send(err.message || 500))
})

/**
 * @api {delete} /user/delete/:id Delete User
 * @apiName deleteUser
 * @apiGroup User
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
            "success": "User deleted"
       }
 */
router.delete('/delete/:id', (req, res) => {
    User.remove({ _id: req.params.id })
        .then(res.send({success: 'User deleted'}))
        .catch(err => res.status(404).send(err.message || 500))
})

/**
 * @api {get} /user/password Edit user password
 * @apiName editPassword
 * @apiGroup User
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
            first_name: "Jean",
            last_name: "Dupond",
            email: "jean@gmail.com"
       }
 */
router.post('/password', (req, res) => {
    User.findOne({ _id: req.user._id })
        .then(user => {
            User.findOneAndUpdate({ _id: user._id }, { $set: { password: bcrypt.hashSync(req.body.password, user.salt) }})
                .then(user => {
                    let body = '<h2>Mot de passe modifié</h2>' +
                        '<p>Votre changement de mot de passe a bien été validé, si cette demande n\'est pas de vous, merci de contacter le support</p>'
                    let mailOptions = {
                        from: '"Admin" <admin@airbnblike.com>',
                        to: user.email,
                        subject: 'Changement de mot de passe',
                        html: body
                    }
                    mailer(mailOptions)
                    res.send(user)
                })
                .catch(err => res.status(400).send(err.message || 500))
        })
        .catch(err => res.status(404).send(err.message || 500))
})

module.exports = router;