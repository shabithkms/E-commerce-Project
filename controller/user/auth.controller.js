const Admin = require('../../model/Admin')
const bcrypt = require('bcryptjs')
const User = require('../../model/User')

const login = (req, res) => {
    try {
        return res.render('user/auth/login', {
            loginError: req.flash('loginError')
        })
    } catch (error) {
        console.log(error)
        return res.render('error-404')
    }
}

const loginSubmit = async (req, res) => {
    try {
        console.log(req.body);
        const user = await User.findOne({ email: req.body.email })
        if (!user) {
            req.flash('loginError', 'Invalid Email or Password')
            return res.redirect('back')
        }
        if (bcrypt.compareSync(req.body.password, user.password)) {
            req.session.userLoggedIn = true
            delete user.password
            req.session.authUser = user
            res.redirect('/')
        } else {
            req.flash('loginError', 'Invalid Email or Password')
            return res.redirect('back')
        }
    } catch (error) {
        req.flash('loginError', 'Invalid Email or Password')
        return res.redirect('back')
    }
}

const signup = (req, res) => {
    try {
        return res.render('user/auth/signup', {
            signupError: req.flash('signupError')
        })
    } catch (error) {
        console.log(error)
        return res.render('error-404')
    }
}

const signupSubmit = async (req, res) => {
    try {
        const isMobileExist = await User.findOne({ mobile: req.body.mobileNo })
        if (isMobileExist) {
            req.flash('signupError', 'Mobile Number already exist')
            return res.redirect('back')
        }
        const isEmailExist = await User.findOne({ email: req.body.email })
        if (isEmailExist) {
            req.flash('signupError', 'Email already exist')
            return res.redirect('back')
        }
        let body = req.body
        const saltRounds = 10
        const salt = bcrypt.genSaltSync(saltRounds)
        let obj = {
            first_name: body.firstName,
            last_name: body.lastName,
            email: body.email,
            mobile: body.mobileNo,
            password: bcrypt.hashSync(body.password, salt)
        }
        const save = await User.create(obj)
        if (!save?._id) {
            req.flash('signupError', 'Something Went wrong')
            return res.redirect('back')
        }
        return res.redirect('/')
    } catch (error) {
        req.flash('signupError', 'Something Went wrong')
        return res.redirect('back')
    }
}

const logout = (req, res) => {
    req.session.userLoggedIn = false
    req.session.user = false
    res.redirect('/auth/login')
}

module.exports = {
    login,
    loginSubmit,
    signup,
    signupSubmit,
    logout,
}
