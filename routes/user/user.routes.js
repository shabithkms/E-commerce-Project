const express = require('express')
const router = express.Router()
require('express-group-routes')

const dashboardController = require('../../controller/user/dashboard.controller')
const authController = require('../../controller/user/auth.controller')

router.group('/auth', router => {
    router.get('/login', authController.login)
    router.post('/login', authController.loginSubmit)
    router.get('/signup', authController.signup)
    router.post('/signup', authController.signupSubmit)
})

router.get('/', dashboardController.homePage)




module.exports = router