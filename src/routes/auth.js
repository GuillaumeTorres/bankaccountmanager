let express = require('express')
let router = express.Router()
let User = require('../db/db').User
let bcrypt = require('bcrypt')
let jwt = require('jsonwebtoken')
let mailer = require('../services/mailer')

const createToken = userData => jwt.sign(userData, process.env.JWT_SECRET)
const addToken = userData => Object.assign(userData, {token: createToken(userData)})

const filterUserData = user => ({
    _id: user._id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email
})

/**
 * @api {post} /auth/register Create User
 * @apiName createUser
 * @apiGroup User
 *
 * @apiParam {String} username Username
 * @apiParam {String} first_name First name
 * @apiParam {String} last_name Last name
 * @apiParam {String} email Email address
 * @apiParam {String} password Password
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          username: "jdupond",
            first_name: "Jean",
            last_name: "Dupond",
            email: "jean@gmail.com",
            "password": "$2a$10$sI45ho/YSKX5P1mlv/DjfeoJW4jJWnYtWC4WRl9aDCUpe2/k8eGtu",
            "salt": "$2a$10$sI45ho/YSKX5P1mlv",
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
       }
 */
router.post('/register', (req, res) => {
    const userData = req.body
    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync(userData.password, salt)
    userData.password = hash
    userData.salt = salt

    const user = new User(userData)
    user.save()
        .then(user => {
            let body = '<h2>Inscription validé</h2>' +
                '<p>Votre inscription a bien été validé, vous pouvez dès à présent vous connecter avec vos identifiants</p>'
            let mailOptions = {
                from: '"Admin" <admin@airbnblike.com>',
                to: user.email,
                subject: 'Confirmation d\'inscription',
                html: body
            }
            mailer(mailOptions)
            userData._id = user._id
            const userDataWithToken = addToken(filterUserData(userData))
            res.send(userDataWithToken)
        })
        .catch(err => res.status(400).send(err.message || 500))
})

/**
 * @api {post} /auth/login Login
 * @apiName login
 * @apiGroup User
 *
 * @apiParam {String} email     Email
 * @apiParam {String} password  Password
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
            first_name: "Jean",
            last_name: "Dupond",
            email: "jean@gmail.com",
            "password": "$2a$10$sI45ho/YSKX5P1mlv/DjfeoJW4jJWnYtWC4WRl9aDCUpe2/k8eGtu",
            "salt": "$2a$10$sI45ho/YSKX5P1mlv",
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
       }
 */
router.post('/login', (req, res) => {
    User.findOne({email: req.body.email})
        .then(user => User.findOne({
            email: user.email,
            password: bcrypt.hashSync(req.body.password, user.salt)
        }))
        .then(user => {
            if (!user) return res.send({error: 'Wrong password'})
            const userDataWithToken = addToken(filterUserData(user))
            res.send(userDataWithToken)
        })
        .catch(err => res.status(404).send({ error: 'User not found' }))
})

module.exports = router;