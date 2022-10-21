const express = require('express')
const router = express.Router()
require('express-group-routes')

// BEGIN:: Route Groups
const authRoutes = require('./auth.routes')
const dashboardRoutes = require('./dashboard.routes')

const { verifyAdminLogin } = require('../../middleware/admin/auth.middleware')
const { setAdminLayout } = require('../../services/admin/LayoutServiceProvider')

// router.use(setAdminLayout)

router.use('/auth', authRoutes)

router.use(verifyAdminLogin)
router.use('/', dashboardRoutes)

//The 404 Route (ALWAYS Keep this as the last route)
router.get('*', function (req, res) {
    res.render('error-404', { login: true, adminErrorPage: true })
})

module.exports = router
