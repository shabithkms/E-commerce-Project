var express = require('express');
var router = express.Router();
const { Db } = require('mongodb');
const adminHelpers = require('../helpers/admin-helper');
const productHelpers = require('../helpers/product-helper');
var db = require('../config/connection')
var collection = require('../config/collection');
var fs = require('fs')
var swal = require('sweetalert');
const userHelper = require('../helpers/user-helper');

const verifyAdminLogin = (req, res, next) => {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  if (req.session.adminLoggedIn) {

    next()
  } else {
    res.redirect('/admin/login')
  }
}


//Home


router.get('/', function (req, res, next) {
  if (req.session.adminLoggedIn) {
    res.render('admin/dashboard', { admin: true });
  } else {
    res.redirect('/admin/login')
  }

});
//LOgin

router.get('/login', function (req, res, next) {
  if (req.session.adminLoggedIn) {
    res.redirect('/admin')
  } else {
    res.render('admin/admin-login', { login: true, "loginErr": req.session.loginErr, "noAdmin": req.session.noAdmin });
    req.session.loginErr = false
    req.session.noAdmin = false
  }

});


router.post('/login', (req, res) => {

  adminHelpers.doAdminLogin(req.body).then((response) => {

    let status = response.status
    let adminStatus = response.adminStatus
    if (status) {
      req.session.admin = response.admin
      req.session.adminLoggedIn = true
      res.redirect('/admin')
    } else {

      if (!adminStatus) {
        req.session.noAdmin = true
        res.redirect('/admin/login')
      } else {
        req.session.loginErr = true
        res.redirect('/admin/login')
      }
      // req.session.loginErr=true
      // res.redirect('/admin/login')
    }
  })
})

// User Section


router.get('/users', verifyAdminLogin, (req, res) => {
  adminHelpers.getAllUsers().then((users) => {

    res.render('admin/all-users', { admin: true, users })
  })

})

router.get('/active-users', verifyAdminLogin, (req, res) => {
  adminHelpers.getActiveUsers().then((activeUsers) => {

    res.render('admin/active-users', { admin: true, activeUsers })
  })

})

router.get('/blocked-users', verifyAdminLogin, (req, res) => {
  adminHelpers.getBlockedUsers().then((blockedUsers) => {

    res.render('admin/blocked-users', { admin: true, blockedUsers })
  })

})

router.get('/block-user/:id', verifyAdminLogin, (req, res) => {
  let id = req.params.id


  adminHelpers.blockUser(id).then((response) => {
    res.redirect('/admin/users')
  })

})

router.get('/unblock-user/:id', verifyAdminLogin, (req, res) => {
  let id = req.params.id


  adminHelpers.unblockUser(id).then((response) => {
    res.redirect('/admin/users')
  })

})

// Product Section

router.get('/products', verifyAdminLogin, function (req, res, next) {
  productHelpers.getAllProducts().then((products) => {
    res.render('admin/view-products', { admin: true, products });
  })

});

router.get('/add-product', verifyAdminLogin, async function (req, res, next) {
  let categories = await adminHelpers.getAllCategory()
  let brands = await adminHelpers.getAllBrands()

  res.render('admin/add-product', { "productExist": req.session.productExist, admin: true, categories, brands });
  req.session.productExist = false
});

router.post('/add-product', verifyAdminLogin, async function (req, res, next) {

  productHelpers.addProduct(req.body).then((id) => {

    let image1 = req.files.image1
    let image2 = req.files.image2
    let image3 = req.files.image3
    let image4 = req.files.image4
    image1.mv('public/productImages/' + id + 'a.jpg')
    image2.mv('public/productImages/' + id + 'b.jpg')
    image3.mv('public/productImages/' + id + 'c.jpg')
    image4.mv('public/productImages/' + id + 'd.jpg')
    res.redirect('/admin/products')


  }).catch((err) => {
    if (err.code == 11000) {
      req.session.productExist = true
      res.redirect('/admin/add-product')
    }

  })
});

router.get('/edit-product/:id', verifyAdminLogin, async (req, res) => {
  let id = req.params.id
  let categories = await adminHelpers.getAllCategory()
  let brands = await adminHelpers.getAllBrands()
  productHelpers.getProductDetails(id).then((product) => {
    console.log(product);
    res.render('admin/edit-product', { admin: true, categories, brands, product })
  })
})

router.post('/edit-product/:id', verifyAdminLogin, async (req, res) => {
  let id = req.params.id

  productHelpers.updateProduct(id, req.body).then((response) => {

    res.redirect('/admin/products')
    if (req.files.image1) {
      let image1 = req.files.image1
      image1.mv('public/productImages/' + id + 'a.jpg')
    }
    if (req.files.image2) {
      let image2 = req.files.image2
      image2.mv('public/productImages/' + id + 'b.jpg')
    }
    if (req.files.image3) {
      let image3 = req.files.image3
      image3.mv('public/productImages/' + id + 'c.jpg')
    }
    if (req.files.image4) {
      let image4 = req.files.image4
      image4.mv('public/productImages/' + id + 'd.jpg')
    }
  })
})

router.get('/delete-product/:id', verifyAdminLogin, (req, res) => {
  let id = req.params.id
  productHelpers.deleteProduct(id).then((response) => {

    console.log(id, "Id in deelete");
    fs.unlinkSync('public/productImages/' + id + 'a.jpg')
    fs.unlinkSync('public/productImages/' + id + 'b.jpg')
    fs.unlinkSync('public/productImages/' + id + 'c.jpg')
    fs.unlinkSync('public/productImages/' + id + 'd.jpg')
    res.redirect('/admin/products')

  })
})


//Brand Section

router.get('/view-brands', verifyAdminLogin, async function (req, res, next) {
  let brands = await adminHelpers.getAllBrands()
  res.render('admin/view-brands', { admin: true, brands });
});

router.get('/add-brands', verifyAdminLogin, function (req, res, next) {
  res.render('admin/add-brands', { admin: true, "brandExist": req.session.brandExist });
  req.session.brandExist = false
});

router.post('/add-brands', verifyAdminLogin, function (req, res) {

  adminHelpers.addBrands(req.body).then((id) => {
    let image = req.files.logo
    image.mv('public/brandLogos/' + id + '.jpg', (err, done) => {
      if (!err) {
        res.redirect('/admin/view-brands')
      } else {
        res.redirect('/admin/add-brands')
      }

    })
  }).catch((err) => {
    if (err.code == 11000) {
      req.session.brandExist = true
      res.redirect('/admin/add-brands')
    }

  })
});

router.get('/edit-brand/:id', verifyAdminLogin, function (req, res, next) {
  let id = req.params.id
  adminHelpers.getBrandDetails(id).then((brand) => {
    res.render('admin/edit-brand', { admin: true, brand, "brandExist": req.session.brandExist });
  })
});


router.post('/edit-brand/:id', verifyAdminLogin, async (req, res) => {
  let id = req.params.id
  adminHelpers.updateBrand(id, req.body).then((response) => {
    res.redirect('/admin/view-brands')
    if (req.files.logo) {
      let image = req.files.logo
      image.mv('public/brandLogos/' + id + '.jpg')
    }

  })
  // .catch((err)=>{
  //   if(err.code==11000){
  //     req.session.brandExist=true
  //     res.redirect('/admin/edit-brand/id')
  //   }
  // })

})

router.get('/delete-brand/:id', verifyAdminLogin, (req, res) => {
  let id = req.params.id
  adminHelpers.deleteBrand(id).then((response) => {
    fs.unlinkSync('public/brandLogos/' + id + '.jpg')
    res.redirect('/admin/view-brands')
  })
})


//Categories

router.get('/categories', verifyAdminLogin, function (req, res, next) {
  adminHelpers.getAllCategory().then((categories) => {

    res.render('admin/view-categories', { admin: true, categories });
  })

});

router.get('/add-category', verifyAdminLogin, function (req, res, next) {

  res.render('admin/add-category', { admin: true, "categoryExist": req.session.categoryExist });
  req.session.categoryExist = false
});


router.post('/add-category', verifyAdminLogin, function (req, res, next) {
  adminHelpers.addCategory(req.body).then((response) => {
    res.redirect('/admin/categories');
  }).catch((err) => {
    console.log(err, "exist");
    req.session.categoryExist = true
    res.redirect('/admin/add-category')
  })


});

router.get('/edit-category/:id', verifyAdminLogin, function (req, res, next) {
  let id = req.params.id
  adminHelpers.getCategoryDetails(id).then((category) => {
    res.render('admin/edit-category', { admin: true, category });
  })
});

router.post('/edit-category/:id', verifyAdminLogin, async (req, res) => {
  let id = req.params.id
  adminHelpers.updateCategory(id, req.body).then((response) => {
    res.redirect('/admin/categories')

  })

})

router.get('/delete-category/:id', verifyAdminLogin, (req, res) => {
  let id = req.params.id
  adminHelpers.deleteCategory(id).then((response) => {
    res.redirect('/admin/categories')
  })
})

router.get('/orders', verifyAdminLogin, async (req, res) => {
  let ordersList = await adminHelpers.getAllOrders()
  console.log(ordersList);
  res.render('admin/all-orders', { admin: true, ordersList })
})

router.get('/singleOrder/:id', verifyAdminLogin, (req, res) => {
  let oId = req.params.id
  adminHelpers.getOrderProducts(oId).then((products) => {
    console.log(products);
    res.render('admin/single-order', { products, admin: true })
  })
})


router.get('/shipped/:id', (req, res) => {
  status = 'Shipped'
  adminHelpers.changeOrderStatus(req.params.id, status).then(() => {
    res.redirect('/admin/orders')
  })
})
router.get('/delivered/:id', (req, res) => {
  status = 'Delivered'
  adminHelpers.changeOrderStatus(req.params.id, status).then(() => {
    res.redirect('/admin/orders')
  })
})
router.get('/cancelled/:id', (req, res) => {
  status = 'Cancelled'
  adminHelpers.changeOrderStatus(req.params.id, status).then(() => {
    res.redirect('/admin/orders')
  })
})

router.post('/crop', (req, res) => {
  // console.log(req.body.image,"crop");
  let image = req.body.image
  req.session.image = image
  // let newImage=toDataURL(image)
  // console.log(newImage,"cr");
  res.json({ satus: true })
})

router.get('/banners', verifyAdminLogin, async(req, res) => {
  let banners= await userHelper.getAllBanners()
  res.render('admin/banners', { admin: true,banners })
})


router.post('/add-banner', (req, res) => {
  
  adminHelpers.addBanner(req.body).then((id) => {
    let image = req.files.Image3
    image.mv('public/banners/' + id +'.jpg', (err, done) => {
      if (!err) {
        res.redirect('/admin/banners')
      } else {
        res.redirect('/admin/banners')
      }

    })
  }).catch((err) => {
    if (err.code == 11000) {
      req.session.brandExist = true
      res.redirect('/admin/add-brands')
    }

  })
})

router.get('/edit-banner/:id', verifyAdminLogin, function (req, res, next) {
  let id = req.params.id
  adminHelpers.getBannerDetails(id).then((banner) => {
    res.render('admin/edit-banner', { admin: true, banner, "bannerExist": req.session.brandExist });
  })
});


router.post('/edit-banner/:id', verifyAdminLogin, async (req, res) => {
  let id = req.params.id
  adminHelpers.updateBanner(id, req.body).then((response) => {
    res.redirect('/admin/banners')
    if (req.files.Image3) {
      let image = req.files.Image3
      image.mv('public/banners/' + id + '.jpg')
    }

  })
  // .catch((err)=>{
  //   if(err.code==11000){
  //     req.session.brandExist=true
  //     res.redirect('/admin/edit-brand/id')
  //   }
  // })

})

router.get('/delete-banner/:id', verifyAdminLogin, (req, res) => {
  let id = req.params.id
  adminHelpers.deleteBanner(id).then((response) => {
    fs.unlinkSync('public/banners/' + id + '.jpg')
    res.redirect('/admin/banners')
  })
})



//Logout
router.get('/logout', (req, res) => {
  req.session.admin = null
  req.session.adminLoggedIn = false
  res.redirect('/admin/login')
})

module.exports = router;
