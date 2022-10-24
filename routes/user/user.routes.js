const express = require('express')
const router = express.Router()
require('express-group-routes')

const dashboardController = require('../../controller/user/dashboard.controller')

router.get('/',dashboardController.homePage)




module.exports = router