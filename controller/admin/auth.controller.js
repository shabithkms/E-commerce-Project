const Admin = require('../../model/Admin')
const bcrypt = require('bcryptjs')

const login = (req, res) => {
    try {
        return res.render('admin/auth/login', {
            login: true,
            layout: 'admin-login-layout',
            loginError: req.flash('loginError'),
        })
    } catch (error) {
        console.log(error)
        return res.render('error-404')
    }
}

const loginSubmit = async (req, res) => {
    try {
        const admin = await Admin.findOne({ email: req.body.email })
        if (!admin) {
            req.flash('loginError', 'Invalid Email or Password')
            return res.redirect('back')
        }
        if (bcrypt.compareSync(req.body.password, admin.password)) {
            req.session.adminLoggedIn = true
            delete admin.password
            req.session.admin = admin
            res.redirect('/admin')
        } else {
            req.flash('loginError', 'Invalid Email or Password')
            return res.redirect('back')
        }
    } catch (error) {
        req.flash('loginError', 'Invalid Email or Password')
        return res.redirect('back')
    }
}

const logout = (req, res) => {
    req.session.adminLoggedIn = false
    req.session.admin = false
    res.redirect('/admin/auth/login')
}

module.exports = {
    login,
    loginSubmit,
    logout,
}
