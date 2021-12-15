var express = require('express');
var router = express.Router();
const { Db } = require('mongodb');
const adminHelpers = require('../helpers/admin-helper');
const productHelpers = require('../helpers/product-helper');
var db = require('../config/connection')
var collection = require('../config/collection');
var s3 = require('../config/s3')
var fs = require('fs')
var swal = require('sweetalert');
const userHelper = require('../helpers/user-helper');
const productHelper = require('../helpers/product-helper');
const { uploadFile } = require('../config/s3');
const { response } = require('express');
//Middleware for checking admin login
const verifyAdminLogin = (req, res, next) => {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  if (req.session.adminLoggedIn) {
    next()
  } else {
    res.redirect('/admin/login')
  }
}

//Admin login
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
  adminHelpers.doAdminLogin(req.body).then(async (response) => {
    let status = response.status
    let adminStatus = response.adminStatus
    if (status) {
      req.session.admin = response.admin
      req.session.adminLoggedIn = true
      res.redirect('/admin')
      let todayDate = new Date().toISOString().slice(0, 10);
      let result1 = await adminHelpers.startCategoryOffer(todayDate);
      let result2 = await adminHelpers.startProductOffer(todayDate);
    } else {
      if (!adminStatus) {
        req.session.noAdmin = true
        res.redirect('/admin/login')
      } else {
        req.session.loginErr = true
        res.redirect('/admin/login')
      }
    }
  })
})

//Admin dashboard
router.get('/', async function (req, res, next) {
  if (req.session.adminLoggedIn) {
    let newOrders = await productHelper.getNewOrders()
    let newProducts = await productHelper.getNewProducts()
    let newUsers = await productHelper.getNewUsers()
    let totalIncome = await productHelper.getTotalIncome()
    let totalUsers = await productHelper.getTotalUsers()
    let totalProducts = await productHelper.getTotalProducts()
    let totalOrders = await productHelper.getTotalOrders()
    let allOrderStatus = await productHelper.getAllOrderStatus()
    let allMethods = await productHelper.getAllMethods()
    res.render('admin/dashboard', { admin: true, dashboard: true, newOrders, newUsers, newProducts, totalIncome, totalUsers, totalProducts, totalOrders, allOrderStatus, allMethods });
  } else {
    res.redirect('/admin/login')
  }
});

// User Management  Section
//get all users
router.get('/users', verifyAdminLogin, (req, res) => {
  adminHelpers.getAllUsers().then((users) => {
    res.render('admin/all-users', { admin: true, users })
  })
})
//get all active users
router.get('/active-users', verifyAdminLogin, (req, res) => {
  adminHelpers.getActiveUsers().then((activeUsers) => {
    res.render('admin/active-users', { admin: true, activeUsers })
  })
})
//get all blocked users
router.get('/blocked-users', verifyAdminLogin, (req, res) => {
  adminHelpers.getBlockedUsers().then((blockedUsers) => {
    res.render('admin/blocked-users', { admin: true, blockedUsers })
  })
})
//Block user
router.get('/block-user/:id', verifyAdminLogin, (req, res) => {
  let id = req.params.id
  adminHelpers.blockUser(id).then((response) => {
    res.redirect('/admin/users')
  })
})
//Unblock user
router.get('/unblock-user/:id', verifyAdminLogin, (req, res) => {
  let id = req.params.id
  adminHelpers.unblockUser(id).then((response) => {
    res.redirect('/admin/users')
  })
})

// Product Management Section
router.get('/products', verifyAdminLogin, function (req, res, next) {
  productHelpers.getAllProducts().then((products) => {
    res.render('admin/view-products', { admin: true, products });
  })
});
//Add new products
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
  uploadFile(req.files.image1)
});
router.get('/edit-product/:id', verifyAdminLogin, async (req, res) => {
  let id = req.params.id
  let categories = await adminHelpers.getAllCategory()
  let brands = await adminHelpers.getAllBrands()
  productHelpers.getProductDetails(id).then((product) => {
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
    fs.unlinkSync('public/productImages/' + id + 'b.jpg')
    fs.unlinkSync('public/productImages/' + id + 'c.jpg')
    fs.unlinkSync('public/productImages/' + id + 'd.jpg')
    res.redirect('/admin/products')
  })
})

//Brand Management Section
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
})
router.get('/delete-brand/:id', verifyAdminLogin, (req, res) => {
  let id = req.params.id
  adminHelpers.deleteBrand(id).then((response) => {
    fs.unlinkSync('public/brandLogos/' + id + '.jpg')
    res.redirect('/admin/view-brands')
  })
})

//Categories Management section
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
//Order management section
router.get('/orders', verifyAdminLogin, async (req, res) => {
  let ordersList = await adminHelpers.getAllOrders()
  res.render('admin/all-orders', { admin: true, ordersList })
})
//get products in order
router.get('/singleOrder/:id', verifyAdminLogin, (req, res) => {
  let oId = req.params.id
  adminHelpers.getOrderProducts(oId).then((products) => {
    console.log(products);
    res.render('admin/single-order', { products, admin: true })
  })
})
//Order Status changing----
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

//Banner management section----
router.get('/banners', verifyAdminLogin, async (req, res) => {
  let banners = await userHelper.getAllBanners()
  res.render('admin/banners', { admin: true, banners })
})
router.post('/add-banner', (req, res) => {
  adminHelpers.addBanner(req.body).then((id) => {
    let image = req.files.Image3
    image.mv('public/banners/' + id + '.jpg', (err, done) => {
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
})
router.get('/delete-banner/:id', verifyAdminLogin, (req, res) => {
  let id = req.params.id
  adminHelpers.deleteBanner(id).then((response) => {
    fs.unlinkSync('public/banners/' + id + '.jpg')
    res.redirect('/admin/banners')
  })
})

//Offer Management Section....
//Category offers
router.get('/category-offers', verifyAdminLogin, async (req, res) => {
  let category = await adminHelpers.getAllCategory()
  let catOffers = await adminHelpers.getAllCatOffers()
  res.render('admin/category-offer', { admin: true, category, catOffers, "catOfferExist": req.session.catOfferExist })
  req.session.catOfferExist = false
})

router.post('/category-offers', verifyAdminLogin, (req, res) => {
  adminHelpers.addCategoryOffer(req.body).then((response) => {
    if (response.exist) {
      req.session.catOfferExist = true
      res.redirect('/admin/category-offers')
    } else {
      res.redirect('/admin/category-offers')
    }

  }).catch((err) => {
    if (err.code == 11000) {
      req.session.catOfferExist = true
      res.redirect('/admin/category-offers')
    }
  })
})

router.get('/edit-catOffer/:id', verifyAdminLogin, async function (req, res, next) {
  let id = req.params.id
  let category = await adminHelpers.getAllCategory()
  adminHelpers.getCatOfferDetails(id).then((catOffer) => {
    res.render('admin/edit-catOffers', { admin: true, catOffer, category, "bannerExist": req.session.brandExist });
  })
});


router.post('/edit-catOffer/:id', verifyAdminLogin, async (req, res) => {
  let id = req.params.id
  adminHelpers.updateCatOffer(id, req.body).then((response) => {
    res.redirect('/admin/category-offers')
  })
})

router.get('/delete-catOffer/:id', verifyAdminLogin, (req, res) => {
  let id = req.params.id
  adminHelpers.deleteCatOffer(id).then((response) => {
    res.redirect('/admin/category-offers')
  })
})
//Product offer
router.get('/product-offers', verifyAdminLogin, async (req, res) => {
  let products = await userHelper.getAllProducts()
  let proOffers = await adminHelpers.getAllProOffers()
  res.render('admin/product-offer', { admin: true, products, proOffers, "proOfferExist": req.session.proOfferExist })
  req.session.proOfferExist = false
})

router.post('/product-offers', verifyAdminLogin, (req, res) => {
  console.log(req.body);
  adminHelpers.addProductOffer(req.body).then((response) => { 
    if (response.exist) {
      req.session.proOfferExist = true
      res.redirect('/admin/product-offers')
    } else {
      res.redirect('/admin/product-offers')
    }
  }).catch((err) => {
    if (err.code == 11000) {
      req.session.proOfferExist = true
      res.redirect('/admin/product-offers')
    }
  })
})
router.get('/edit-proOffer/:id', verifyAdminLogin, async function (req, res, next) {
  let id = req.params.id
  let products = await userHelper.getAllProducts()
  adminHelpers.getProOffersDetails(id).then((proOffer) => {
    res.render('admin/edit-proOffers', { admin: true, proOffer, products, "bannerExist": req.session.brandExist });
  })
});

router.post('/edit-proOffer/:id', verifyAdminLogin, async (req, res) => {
  let id = req.params.id
  adminHelpers.updateProOffer(id, req.body).then((response) => {
    res.redirect('/admin/product-offers')
  })
})
router.get('/delete-proOffer/:id', verifyAdminLogin, (req, res) => {
  let id = req.params.id
  res.redirect('/admin/product-offers')
})

//Coupon Management section
router.get('/coupons', verifyAdminLogin, async (req, res) => {
  let coupons = await adminHelpers.getAllCoupons()
  res.render('admin/coupons', { admin: true, coupons, "couponExist": req.session.couponExist })
  req.session.couponExist = false
})
router.post('/add-coupon', verifyAdminLogin, (req, res) => {
  adminHelpers.addCoupon(req.body).then(() => {
    res.redirect('/admin/coupons')
  }).catch((err) => {
    if (err.code == 11000) {
      req.session.couponExist = true
      res.redirect('/admin/coupons')
    }
  })
})
router.get('/edit-coupon/:id', verifyAdminLogin, async function (req, res, next) {
  let id = req.params.id
  let products = await userHelper.getAllProducts()
  adminHelpers.getCouponDetails(id).then((coupon) => {
    res.render('admin/edit-coupons', { admin: true, coupon, products, "bannerExist": req.session.couponExist });
  })
});

router.post('/edit-coupon/:id', verifyAdminLogin, async (req, res) => {
  let id = req.params.id
  adminHelpers.updtaeCoupon(id, req.body).then((response) => {
    res.redirect('/admin/coupons')
  })
})

router.get('/delete-coupon/:id', verifyAdminLogin, (req, res) => {
  let id = req.params.id
  adminHelpers.deleteCoupon(id).then(() => {
    res.redirect('/admin/coupons')
  })
})
//Sales report section
router.get('/report', verifyAdminLogin, async (req, res) => {
  let profit = await productHelper.getTotalProfit()
  adminHelpers.monthlyReport().then((data) => {
    res.render('admin/report', { admin: true, report: true, data })
  })
})
router.post('/report', (req, res) => {
  adminHelpers.salesReport(req.body).then((data) => {
    res.render('admin/report', { admin: true, report: true, data, })
  })
})

//Logout
router.get('/logout', (req, res) => {
  req.session.admin = null
  req.session.adminLoggedIn = false
  res.redirect('/admin/login')
})


//S3
// const multer  = require('multer')
// const upload = multer({ dest: 'uploads/' })
// router.get('/images',upload.single('image'),(req,res)=>{
//   res.render('user/s3')
// })
// router.post('/images',(req,res)=>{
//   upload.single(req.files)
//   console.log(req.files);
// })

module.exports = router;
