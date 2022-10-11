const setAdminLayout = (req,res,next)=>{
    res.locals.layout='admin-layout'
    next()
}

module.exports={
    setAdminLayout
}