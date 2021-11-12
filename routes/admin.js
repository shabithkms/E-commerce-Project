var express = require('express');
var router = express.Router();
const { Db } = require('mongodb');
const adminHelpers = require('../helpers/admin-helper');
const productHelpers = require('../helpers/product-helper');
var db = require('../config/connection')
var collection = require('../config/collection');

/* GET home page. */
router.get('/', function (req, res, next) {
  if (req.session.adminLoggedIn) {
    res.render('admin/dashboard', { admin: true });
  } else {
    res.redirect('/admin/login')
  }

});

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
  // console.log(req.body,"hjhdjhkwj");
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


router.get('/users', (req, res) => {

  res.render('admin/all-users', { admin: true })
})

// Product Section

router.get('/products', function (req, res, next) {
  productHelpers.getAllProducts().then((products) => {
    res.render('admin/view-products', { admin: true, products });
  })

});

router.get('/add-product', async function (req, res, next) {
  let categories = await adminHelpers.getAllCategory()
  let brands = await adminHelpers.getAllBrands()
  
  res.render('admin/add-product', { admin: true, categories, brands });
});

router.post('/add-product', async function (req, res, next) {
  
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


  })
});

router.get('/edit-product/:id',async (req, res) => {
  let id = req.params.id
  let categories = await adminHelpers.getAllCategory()
  let brands = await adminHelpers.getAllBrands()
  productHelpers.getProductDetails(id).then((product) => {
    console.log(product);
    res.render('admin/edit-product',{admin:true,categories, brands,product})
  })
})

router.post('/edit-product/:id',async (req, res) => {
  let id = req.params.id
  
  productHelpers.updateProduct(id,req.body).then((response) => {
    
    res.redirect('/admin/products')
    if (req.files.image1) {
      let image1 = req.files.image1
      image1.mv('public/productImages/' + id + 'a.jpg')
    }
    if (req.files.image2) {
      let image2= req.files.image2
      image2.mv('public/productImages/' + id + 'b.jpg')
    }
    if (req.files.image3) {
      let image3 = req.files.image3
      image1.mv('public/productImages/' + id + 'c.jpg')
    }
    if (req.files.image4) {
      let image4= req.files.image4
      image4.mv('public/productImages/' + id + 'd.jpg')
    }
  })
})

router.get('/delete-product/:id',(req,res)=>{
  let id = req.params.id
  productHelpers.deleteProduct(id).then((response)=>{
    res.redirect('/admin/products')
  })
})


//Brand Section

router.get('/view-brands', async function (req, res, next) {
  let brands = await adminHelpers.getAllBrands()
  res.render('admin/view-brands', { admin: true, brands });
});

router.get('/add-brands', function (req, res, next) {
  res.render('admin/add-brands', { admin: true });
});

router.post('/add-brands', function (req, res) {

  adminHelpers.addBrands(req.body).then((id) => {
    let image = req.files.logo
    image.mv('public/brandLogos/' + id + '.jpg', (err, done) => {
      if (!err) {
        res.redirect('/admin/view-brands')
      } else {
        res.redirect('/admin/add-brands')
      }

    })
  })
});

router.get('/edit-brand/:id', function (req, res, next) {
  let id = req.params.id
  adminHelpers.getBrandDetails(id).then((brand) => {
    res.render('admin/edit-brand', { admin: true, brand });
  })
});


router.post('/edit-brand/:id', async (req, res) => {
  let id = req.params.id
  adminHelpers.updateBrand(id, req.body).then((response) => {
    res.redirect('/admin/view-brands')
    if (req.files.logo) {
      let image = req.files.logo
      image.mv('public/brandLogos/' + id + '.jpg')
    }

  })

})

router.get('/delete-brand/:id', (req, res) => {
  let id = req.params.id
  adminHelpers.deleteBrand(id).then((response) => {
    res.redirect('/admin/view-brands')
  })
})


//Categories

router.get('/categories', function (req, res, next) {
  adminHelpers.getAllCategory().then((categories) => {

    res.render('admin/view-categories', { admin: true, categories });
  })

});

router.get('/add-category', function (req, res, next) {

  res.render('admin/add-category', { admin: true });
});


router.post('/add-category', function (req, res, next) {
  adminHelpers.addCategory(req.body).then((response) => {

  })

  res.redirect('/admin/categories');
});

router.get('/edit-category/:id', function (req, res, next) {
  let id = req.params.id
  adminHelpers.getCategoryDetails(id).then((category) => {
    res.render('admin/edit-category', { admin: true, category });
  })
});

router.post('/edit-category/:id', async (req, res) => {
  let id = req.params.id
  adminHelpers.updateCategory(id, req.body).then((response) => {
    res.redirect('/admin/categories')

  })

})

router.get('/delete-category/:id', (req, res) => {
  let id = req.params.id
  adminHelpers.deleteCategory(id).then((response) => {
    res.redirect('/admin/categories')
  })
})



//Logout
router.get('/logout', (req, res) => {
  req.session.admin = null
  req.session.adminLoggedIn = false
  res.redirect('/admin/login')
})

module.exports = router;
