//Middleware for checking admin login
const verifyAdminLogin = (req, res, next) => {
    if (req.session.adminLoggedIn && req.session.authAdmin?._id) {
        res.locals.authAdmin = req.session.authAdmin
        res.locals.moduleConfig = {}
        res.locals.mainNav = []
        res.locals.activeNav = req.originalUrl
        res.locals.sd_req_period = {}
        res.locals.sd_prev_period = {}
        res.locals.dateObject = {}
        next()
    } else {
        res.redirect('/admin/auth/login')
    }
}

module.exports = {
    verifyAdminLogin,
}
