const homePage = async (req, res) => {
    try {
        
        return res.render('user/index')
    } catch (error) {
        console.log(error)
        return res.render('error-404')
    }
}

module.exports = {
    homePage,
}
