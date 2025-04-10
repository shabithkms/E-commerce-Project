const express = require('express')
const app = express()
const router = express.Router()
const path = require('path')
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

// // Template Engine
// router.set('views', path.join(__dirname, '/views')) 
// router.set('view engine', 'pug')
// Set the view engine and views directory for the admin router
app.set('views', path.join(__dirname, 'views'));
app.engine('pug', require('pug').__express);

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
    res.render(`${process.env.VERSION}/admin/error-404`)
})

module.exports = router
