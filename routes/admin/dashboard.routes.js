const express = require('express')
const router = express.Router()
require('express-group-routes')

// Controllers
const dashboardController = require('../../controller/admin/dashboard.controller')

router.group('/', (router) => {
    router.get('/', dashboardController.dashboard)
})

module.exports = router
