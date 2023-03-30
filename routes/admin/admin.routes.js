const express = require('express')
const router = express.Router()
require('express-group-routes')

// BEGIN:: Route Groups
const authRoutes = require('./auth.routes')
const dashboardRoutes = require('./dashboard.routes')

// Controller
const brandController = require('../../controller/admin/brand.controller')

const { verifyAdminLogin } = require('../../middleware/admin/auth.middleware')
const { setAdminLayout } = require('../../services/admin/LayoutServiceProvider')

// router.use(setAdminLayout)
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

router.use('/auth', authRoutes)

router.use(verifyAdminLogin)
router.use('/', dashboardRoutes)

router.group('/brands', (router) => {
    router.get('/', brandController.list)
    router.get('/add', brandController.add)
    router.post('/add', upload.any(), brandController.save)
})

//The 404 Route (ALWAYS Keep this as the last route)
router.get('*', function (req, res) {
    res.render('error-404', { login: true, adminErrorPage: true })
})

module.exports = router
