let version = process.env.VERSION
const homePage = async (req, res) => {
    try {
        return res.render(`${version}/user/index`)
    } catch (error) {
        console.log(error)
        return res.render('error-404')
    }
}

module.exports = {
    homePage,
}
