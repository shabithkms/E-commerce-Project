const Brand = require('../../model/Brand')

const list = async (req, res, next) => {
    try {
        let brands = await Brand.find()
        res.render('admin/brands/list', { admin: true, brands })
    } catch (error) {
        return res.render(`error-500`)
    }
}

const add = async (req, res, next) => {
    try {
        let brands = await Brand.find()
        res.render('admin/brands/add', { admin: true, brands })
    } catch (error) {
        return res.render(`error-500`)
    }
}

const save = async (req, res, next) => {
    try {
        console.log('req.files :>> ', req.files);
        let logo = req.files
    } catch (error) {
        return res.render(`error-500`)
    }
}

module.exports = {
    list,
    add,
    save
}
