const express = require('express')
const router = express.Router()
require('express-group-routes')


// BEGIN:: Route Groups
const authRoutes = require('./auth.routes')


const {verifyAdminLogin}  = require('../../middleware/admin/auth.middleware')
const {setAdminLayout} = require('../../services/admin/LayoutServiceProvider')

router.use(setAdminLayout)
router.use("/auth",authRoutes)

router.use(verifyAdminLogin)


module.exports = router