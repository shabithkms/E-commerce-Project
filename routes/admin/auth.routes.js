const express = require('express')
const router = express.Router()
require('express-group-routes')

// Controllers
const authController = require('../../controller/admin/auth.controller')

router.group('/', (router) => {
    router.get('/login', authController.login)
    router.post('/login', authController.loginSubmit)
    router.get('/logout',authController.logout)
})

module.exports = router
