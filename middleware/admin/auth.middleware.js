//Middleware for checking admin login
const verifyAdminLogin = (req, res, next) => {
    if (req.session.adminLoggedIn) {
        next()
    } else {
        res.redirect('/admin/auth/login')
    }
}

module.exports = {
    verifyAdminLogin,
}
