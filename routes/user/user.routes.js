const express = require('express')
const router = express.Router()
require('express-group-routes')

const userController = require('../../controller/user/user.controller')

router.get('/',userController.homePage)




module.exports = router