let userRoutes = require('./user')
let operationRoutes = require('./operation')
let authRoutes = require('./auth')
let jwt = require('jsonwebtoken')

let checkToken = (req, res, next) => {
    try{
        // Bearer myToken
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next()
    }
    catch(err){
        res.sendStatus(400)
    }
}

module.exports = function routes(app){
    app.use('/user', checkToken, userRoutes)
    app.use('/operation', checkToken, operationRoutes)
    app.use('/auth', authRoutes)
}
