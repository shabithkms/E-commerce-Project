const Admin = require('../../model/Admin')
const bcrypt = require('bcryptjs')
const Joi = require('joi')

const version = process.env.VERSION

const login = (req, res) => {
    try {
        return res.render(`${version}/admin/auth/login`)
    } catch (error) {
        console.log(error)
        return res.render('error-404')
    }
}

const loginSubmit = async (req, res) => {
    try {
        const schema = Joi.object({
            email: Joi.string().email().required().max(60),
            password: Joi.string().required().min(4).max(15),
        })

        const validationResult = schema.validate(req.body, {
            abortEarly: false,
        })

        if (validationResult.error) {
            return res.status(422).json(validationResult.error)
        }

        const admin = await Admin.findOne({ email: req.body.email })
        if (!admin) {
            return res.status(401).json({ error: 'Invalid email or password' })
        }
        if (bcrypt.compareSync(req.body.password, admin.password)) {
            req.session.adminLoggedIn = true
            delete admin.password
            req.session.authAdmin = admin
            res.redirect('/admin')
        } else {
            return res.status(401).json({ error: 'Invalid email or password' })
        }
    } catch (error) {
        return res.status(500).json({ error: 'Something went wrong' })
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
