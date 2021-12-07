var express = require('express');
var router = express.Router();
const { Db } = require('mongodb');
const userHelper = require('../helpers/user-helper');
var db = require('../config/connection')
var collection = require('../config/collection');
const { response } = require('express');
const productHelper = require('../helpers/product-helper');
const adminHelpers = require('../helpers/admin-helper');
const { Client } = require('twilio/lib/twiml/VoiceResponse');
const { render } = require('../app');
var fs = require('fs')
const objectId = require('mongodb').ObjectID
const paypal = require('paypal-rest-sdk');
const voucher = require('voucher-code-generator')

let coupons = voucher.generate({
  length: 8,
  count: 1
});



//Twilio
const accountSID = process.env.accountSID
const authToken = process.env.authToken
const serviceSID = process.env.serviceSID
//Paypal
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': process.env.CLIENT,
  'client_secret': process.env.SECRET
});

const client = require('twilio')(accountSID, authToken)




const verifyUserLogin = (req, res, next) => {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  if (req.session.userLoggedIn) {
    let userId = req.session.user._id
    adminHelpers.getUserdetails(userId).then((user) => {
      console.log("In verify login");
      if (user) {
        console.log(user.status);
        if (user.status === true) {
          next()
        } else {

          req.session.blockErr = true
          req.session.deleteErr = false
          req.session.user = null
          req.session.userLoggedIn = false
          res.redirect('/login')
        }

      } else {
        console.log('no user');
        req.session.deleteErr = true
        req.session.user = null
        req.session.userLoggedIn = false
        res.redirect('/login')

      }

    })


  } else {
    res.redirect('/login')
  }
}

//Home page
router.get('/', async function (req, res, next) {
  let user = req.session.user
  req.session.noCartPro = false
  let cartCount = null
  if (req.session.user) {
    let Id = req.session.user._id
    cartCount = await userHelper.getCartCount(Id)
  }
  let products = await productHelper.getAllProducts()
  let brand = await userHelper.getBrands()
  let homePro = await userHelper.getHomeProducts()
  let banners = await userHelper.getAllBanners()

  // let result1 = await producthelpers.startCategoryOffers(todayDate);
  // let result2 = await producthelpers.startProductOffers(todayDate);
  // let result3 = await producthelpers.startCoupenOffers(todayDate); 

  res.render('user/home', { user, userPage: true, products, banners, brand, homePro, cartCount })
});


//Login Page------------------------

router.get('/login', async (req, res) => {

  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  if (req.session.userLoggedIn) {
    res.redirect('/')
  } else {
    let brand = await userHelper.getBrands()
    let homePro = await userHelper.getHomeProducts()
    res.render('user/user-login', { brand, homePro, "loginErr": req.session.loggedInErr, "otpErr": req.session.otpErr, "blockErr": req.session.blockErr, "noUser": req.session.noUser })
    req.session.loggedInErr = false
    req.session.blockErr = false
    req.session.noUser = false
    req.session.otpErr = false
  }


})

router.post('/login', (req, res) => {


  console.log("login");
  console.log(req.body);
  userHelper.doLogin(req.body).then((response) => {
    let userStatus = response.userStatus
    if (response.status) {
      let status = response.user.status

      console.log(status);
      if (status) {
        req.session.user = response.user
        req.session.userLoggedIn = true
        res.redirect('/')
      } else {
        req.session.blockErr = true
        req.session.user = null
        req.session.userLoggedIn = false
        res.redirect('/login')
      }

    } else {
      if (!userStatus) {
        req.session.noUser = true
        res.redirect('/login')
      } else {
        req.session.loggedInErr = true
        res.redirect('/login')
      }
    }

  })

})

//Login with OTP

router.get('/loginOtp', async (req, res) => {
  if (req.session.userLoggedIn) {
    res.redirect('/')
  } else {
    let brand = await userHelper.getBrands()
    let homePro = await userHelper.getHomeProducts()
    res.render('user/user-mobile', { otp: true, login: true, brand, homePro, "noUser": req.session.noUserMobile })
    req.session.noUserMobile = false

  }

})

router.post('/loginOtp', (req, res) => {
  let No = req.body.mobileNo
  let no = `+91${No}`
  userHelper.getUserdetails(no).then((user) => {
    if (user) {
      console.log(req.body);
      client.verify
        .services(serviceSID)
        .verifications.create({
          to: `+91${req.body.mobileNo}`,
          channel: "sms"
        }).then((resp) => {
          console.log(resp.to);
          req.session.number = resp.to


          req.session.loginHalf = true
          res.redirect('/login/otp')
        }).catch((err) => {
          console.log(err, "err");
          req.session.otpErr = true
          res.redirect('/login/otp')
        })
    } else {
      req.session.noUserMobile = true
      res.redirect('/loginOtp')
    }

  })

})



//OTP

router.get('/login/otp', async (req, res) => {
  if (req.session.userLoggedIn) {

    res.redirect('/')


  } else {
    if (req.session.loginHalf) {
      let brand = await userHelper.getBrands()
      let homePro = await userHelper.getHomeProducts()
      res.render('user/user-otp', { otp: true, login: true, brand, homePro, "invalidOtp": req.session.invalidOtp, "otpErr": req.session.otpErr })
      req.session.otpErr = false
      req.session.invalidOtp = false
    } else {
      res.redirect('/login')
    }

  }

})

router.post('/login/otp', (req, res) => {
  console.log(req.body, "hjh");

  let a = Object.values(req.body.otp)
  let b = a.join('')
  console.log(b, "new");
  let number = req.session.number
  client.verify
    .services(serviceSID)
    .verificationChecks.create({
      to: number,
      code: b
    }).then((response) => {
      if (response.valid) {
        console.log(number, "num");
        userHelper.getUserdetails(number).then((user) => {
          // console.log(user, "otpiser");
          req.session.loginHalf = false
          req.session.user = user
          req.session.userLoggedIn = true
          res.redirect('/')
        })

      } else {
        console.log("error");
        req.session.invalidOtp = true
        res.redirect('/login/otp')
      }
    }).catch((err) => {
      console.log(err, "err");
      if (err.code == 60200) {
        req.session.invalidOtp = true
        res.redirect('/login/otp')
      } else if (err.code == 60203) {
        req.session.maxOtp = true
        res.redirect('/login/otp')
      }
    })
})

//Resend OTP

router.get('/login/resend-otp', (req, res) => {
  console.log("ressend");
  console.log(req.session.number, "reser");
  let number = req.session.number
  client.verify
    .services(serviceSID)
    .verifications.create({
      to: `${number}`,
      channel: "sms"
    }).then((response) => {
      console.log(response, "rse");
      req.session.user = response.user
      req.session.resend = true
      res.redirect('/login/otp')
    }).catch((err) => {
      console.log(err, "err");
      req.session.otpErr = true
      res.redirect('/login')
    })

})

router.get('/signup/resend-otp', (req, res) => {
  console.log("ressend");
  console.log(req.session.number, "reser");
  let number = req.session.number
  client.verify
    .services(serviceSID)
    .verifications.create({
      to: `${number}`,
      channel: "sms"
    }).then((response) => {
      console.log(response, "rse");
      req.session.user = response.user
      req.session.resend = true
      res.redirect('/signup/otp')
    }).catch((err) => {
      console.log(err, "err");
      req.session.otpErr = true
      res.redirect('/signup')
    })

})


router.get('/forget/resend-otp', (req, res) => {
  console.log("ressend");
  console.log(req.session.number, "reser");
  let number = req.session.number
  client.verify
    .services(serviceSID)
    .verifications.create({
      to: `${number}`,
      channel: "sms"
    }).then((response) => {
      console.log(response, "rse");
      req.session.user = response.user
      req.session.resend = true
      res.redirect('/forgetPasswordOtp')
    }).catch((err) => {
      console.log(err, "err");
      req.session.otpErr = true
      res.redirect('/forgetPassword')
    })

})

//Forget Password

router.get('/forgetPassword', async (req, res) => {
  if (req.session.userLoggedIn) {
    res.redirect('/')
  } else {
    let brand = await userHelper.getBrands()
    let homePro = await userHelper.getHomeProducts()
    res.render('user/user-changePassword', { otp: true, brand, homePro, login: true, "noUser": req.session.noUserMobile })
    req.session.noUserMobile = false
  }


})

router.post('/forgetPassword', (req, res) => {
  let no = req.body.mobileNo
  let No = `+91${no}`
  userHelper.getUserdetails(No).then((user) => {
    if (user) {
      client.verify
        .services(serviceSID)
        .verifications.create({
          to: `+91${req.body.mobileNo}`,
          channel: "sms"
        }).then((resp) => {
          console.log(resp.to);
          req.session.number = resp.to


          req.session.loginHalf = true
          res.redirect('/forgetPasswordOtp')
        }).catch((err) => {
          req.session.loginHalf = false
          console.log(err, "err");
          req.session.otpErr = true
          res.redirect('/login/otp')
        })
    } else {
      req.session.noUserMobile = true
      res.redirect('/forgetPassword')
    }

  })

})

router.get('/forgetPasswordOtp', (req, res) => {
  if (req.session.userLoggedIn) {
    res.redirect('/')
  } else {
    if (req.session.loginHalf) {

      res.render('user/user-setPasswordOtp', { otp: true, login: true, "invalidOtp": req.session.invalidOtp, "otpErr": req.session.otpErr })
      req.session.otpErr = false
      req.session.invalidOtp = false
    } else {
      res.redirect('/login')
    }

  }

})

router.post('/forgetPasswordOtp', (req, res) => {
  let a = Object.values(req.body.otp)
  let b = a.join('')
  console.log(b, "new");
  let number = req.session.number
  client.verify
    .services(serviceSID)
    .verificationChecks.create({
      to: number,
      code: b
    }).then((response) => {
      if (response.valid) {
        console.log(number, "num");
        userHelper.getUserdetails(number).then((user) => {
          req.session.halfPassword = true
          console.log(user, "otpiser");
          req.session.loginHalf = false
          req.session.user = user

          res.redirect('/setPassword')
        })

      } else {
        console.log("error");
        req.session.invalidOtp = true
        res.redirect('/forgetPasswordOtp')
      }

    }).catch((err) => {
      console.log(err.code, "err");
      if (err.code == 60200) {
        req.session.invalidOtp = true
        res.redirect('/forgetPasswordOtp')
      } else if (err.code == 60203) {
        req.session.maxOtp = true
        res.redirect('/forgetPasswordOtp')
      }

    })
})

router.get('/setPassword', (req, res) => {
  if (req.session.userLoggedIn) {
    res.redirect('/')
  } else {
    if (req.session.halfPassword) {
      res.render('user/user-setPassword', { login: true, otp: true, "notSame": req.session.notSame })
      req.session.notSame = false
    } else {
      res.redirect('/login')
    }
  }

})

router.post('/setPassword', async (req, res) => {
  console.log(req.body);
  let p1 = req.body.password1
  let p2 = req.body.password2
  console.log(req.session.number, "set");
  let mobileNo = req.session.number
  let user = await userHelper.getUserdetails(mobileNo)

  if (p1 === p2) {
    userHelper.setPassword(mobileNo, req.body, user).then((response) => {
      req.session.userLoggedIn = false
      req.session.user = null
      res.redirect('/login')
    })
  } else {
    req.session.notSame = true
    res.redirect('/setPassword')
  }
})



//Signup

router.get('/signup', async (req, res) => {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  if (req.session.userLoggedIn) {
    res.redirect('/')
  } else {
    let brand = await userHelper.getBrands()
    let homePro = await userHelper.getHomeProducts()
    res.render('user/user-signup', { brand, homePro, "mobileNoExist": req.session.mobileNoExist })
    req.session.mobileNoExist = false
    req.session.loginErr = false
    req.session.blockErr = false
  }

})


router.post('/signup', (req, res) => {
  let No = req.body.mobileNo
  let mobileNo = `+91${No}`

  userHelper.getUserdetails(mobileNo).then((user) => {
    console.log(user, "in signup");
    if (user) {
      req.session.mobileNoExist = true
      res.redirect('/signup')
    } else {
      req.session.signUpUser = req.body
      console.log("signup", req.session.signUpUser);
      client.verify
        .services(serviceSID)
        .verifications.create({
          to: `+91${req.body.mobileNo}`,
          channel: "sms"
        }).then((resp) => {
          console.log(resp.to);
          req.session.number = resp.to
          req.session.loginHalf = true
          res.redirect('/signup/otp')
        }).catch((err) => {
          // console.log(err, "err");
        })
    }
  })

})

router.get('/signup/otp', (req, res) => {


  if (req.session.loginHalf) {
    res.render('user/user-signUpOtp', { "maxOtp": req.session.maxOtp, login: true, otp: true, "invalidOtp": req.session.invalidOtp, })
    req.session.maxOtp = false
    req.session.invalidOtp = false
  } else {
    res.redirect('/signup')
  }


})

router.post('/signup/otp', async (req, res) => {
  let userData = req.session.signUpUser
  console.log("signup otp", userData);
  let a = Object.values(req.body.otp)
  let b = a.join('')
  console.log(b, "new");
  let number = `+91${userData.mobileNo}`
  client.verify
    .services(serviceSID)
    .verificationChecks.create({
      to: number,
      code: b
    }).then((response) => {
      if (response.valid) {
        console.log(number, "num");
        userHelper.doSignUp(userData).then(async (response) => {
          console.log(response, "otpiser");
          req.session.loginHalf = false
          let id = response.mobileNo
          console.log(id, "mob");
          let user = await userHelper.getUserdetails(id)
          req.session.user = user
          req.session.userLoggedIn = true
          res.redirect('/')
        }).catch((err) => {
          console.log("Error in signup", err);
        })

      } else {
        console.log("error");
        req.session.invalidOtp = true
        res.redirect('/signup/otp')
      }

    }).catch((err) => {
      console.log(err, "err");
      if (err.code == 60200) {
        req.session.invalidOtp = true
        res.redirect('/signup/otp')
      } else if (err.code == 60203) {
        req.session.maxOtp = true
        res.redirect('/signup/otp')
      }

    })


})



//Product secction starting--------------------------------------

//By Id
router.get('/product/:id', async (req, res) => {
  let id = req.params.id
  let cartCount = null
  if (req.session.user) {
    let Id = req.session.user._id
    cartCount = await userHelper.getCartCount(Id)
  }
  let realtedProducts = await productHelper.getRelatedProducts()
  let brand = await userHelper.getBrands()
  let homePro = await userHelper.getHomeProducts()
  let user = req.session.user
  let product = await productHelper.getProductDetails(id).then((product) => {

    res.render('user/single-product', { userPage: true, brand, homePro, cartCount, user, product, realtedProducts })
  })

})


//All products
router.get('/products', async (req, res) => {
  let user = req.session.user
  let products = await userHelper.getAllProducts()
  let brand = await userHelper.getBrands()
  let homePro = await userHelper.getHomeProducts()
  let cartCount = null
  if (req.session.user) {
    let Id = req.session.user._id
    cartCount = await userHelper.getCartCount(Id)
  }
  res.render('user/all-products', { products, brand, homePro, cartCount, user, userPage: true })
})

//By name------------------------------------------

router.get('/products/:name', async (req, res) => {
  let name = req.params.name
  let user = req.session.user
  let brand = await userHelper.getBrands()
  let homePro = await userHelper.getHomeProducts()
  let product = await userHelper.getProductsByName(name)
  let nameProducts = await productHelper.getRelatedProducts()
  let cartCount = null
  if (req.session.user) {
    let Id = req.session.user._id
    cartCount = await userHelper.getCartCount(Id)
  }
  res.render('user/name-products', { userPage: true, brand, user, nameProducts, cartCount, homePro, product })
})

//By brand......................................................

router.get('/brandProducts/:brand', async (req, res) => {
  let name = req.params.brand
  let brandName = name.toUpperCase()
  console.log(brandName);
  let user = req.session.user
  let brand = await userHelper.getBrands()
  let homePro = await userHelper.getHomeProducts()
  let product = await userHelper.getProductsByBrand(name)
  console.log(product);
  let cartCount = null
  if (req.session.user) {
    let Id = req.session.user._id
    cartCount = await userHelper.getCartCount(Id)
  }
  res.render('user/brand-products', { userPage: true, brand, user, brandName, cartCount, homePro, product })
})


//By category
router.get('/categoryProducts/:category', async (req, res) => {
  let category = req.params.category
  let brandName = name.toUpperCase()
  let user = req.session.user
  let brand = await userHelper.getBrands()
  let homePro = await userHelper.getHomeProducts()
  let product = await userHelper.getProductsByCateogry(category)
  console.log(product);
  let cartCount = null
  if (req.session.user) {
    let Id = req.session.user._id
    cartCount = await userHelper.getCartCount(Id)
  }
  res.render('user/category-products', { userPage: true, brand, user, brandName, cartCount, homePro, product })
})




//Cart section starting

router.get('/cart', verifyUserLogin, async (req, res, next) => {

  let id = req.session.user._id
  console.log("cart starting");
  let products = await userHelper.getCartProducts(id)
  console.log("//got products");
  let user = req.session.user
  let totals = 0
  console.log("-----------------------------------1");
  if (products.length > 0) {
    totals = await userHelper.getTotalAmount(id)
  }
  console.log("// ------------------------------------2");
  let brand = await userHelper.getBrands()
  // ------------------------------------3
  let homePro = await userHelper.getHomeProducts()
  if (req.session.user) {
    let Id = req.session.user._id
    // ------------------------------------4
    cartCount = await userHelper.getCartCount(Id)
  }
  if (cartCount > 0) {
    // console.log(products);
    res.render('user/newCart', { cart: true, userPage: true, brand, homePro, user, 'noCart': req.session.noCartPro, cartCount, products, totals })
    req.session.noCartPro = false
  } else {
    let brand = await userHelper.getBrands()
    let homePro = await userHelper.getHomeProducts()
    res.render('user/empty-cart', { userPage: true, brand, homePro, user })
  }
})


router.get('/add-to-cart/:id', (req, res) => {
  if (req.session.userLoggedIn) {
    console.log("Api call");
    let proId = req.params.id
    let userId = req.session.user._id
    userHelper.addToCart(proId, userId).then((response) => {
      req.session.noCartPro = false
      res.json({ status: true })
    })
  } else {
    console.log("no user");
    res.json({ status: false })
  }
})

router.post('/change-product-quantity', (req, res) => {
  console.log(req.body, "jijij");
  let id = req.body.user
  let proId = req.body.product
  userHelper.changeProductQuantity(req.body).then(async (response) => {
    // userHelper.checkStock()
    response.total = await userHelper.getTotalAmount(id)
    response.subTotal = await userHelper.getSubTotal(id, proId)
    console.log(response, "res");
    res.json(response)
  })
})
router.post('/delete-cart-product', (req, res) => {
  let cartId = req.body.cart
  let proId = req.body.product
  console.log(req.body);
  console.log(cartId);
  console.log(proId);
  userHelper.deleteCartProduct(cartId, proId).then((response) => {
    res.json(response)
  })
})

//Wishlist----------------------------------------------------------
router.get('/wishlist', verifyUserLogin, async (req, res) => {
  let brand = await userHelper.getBrands()
  let homePro = await userHelper.getHomeProducts()
  let user = req.session.user
  let cartCount = null
  if (req.session.user) {
    let Id = req.session.user._id
    cartCount = await userHelper.getCartCount(Id)
  }

  userHelper.getWishlistProducts(req.session.user._id).then(async (wishlistProducts) => {
    let len = wishlistProducts.length
    console.log(len);
    if (len > 0) {
      res.render('user/wishlist', { userPage: true, user, cartCount, brand, homePro, wishlistProducts })
    } else {
      let brand = await userHelper.getBrands()
      let homePro = await userHelper.getHomeProducts()
      res.render('user/empty-wishlist', { userPage: true, brand, homePro, user })
    }

  })
})

router.get('/add-to-wishlist/:id', async (req, res) => {
  console.log("ajax call");

  let pId = await req.params.id

  console.log(pId);
  console.log(req.session.userLoggedIn);
  if (req.session.userLoggedIn) {
    let user = await req.session.user._id
    console.log("Api call");

    userHelper.addToWishlist(pId, user).then((response) => {
      console.log("in userjs", response);
      if (response.pulled) {
        res.json({ pulled: true })
      } else {
        res.json(response)
      }
    })
  } else {
    console.log("no user");
    res.json({ status: true })
  }
})

router.post('/delete-wishlist-product', (req, res) => {
  console.log("api call");
  let proId = req.body.product
  let userId = req.session.user._id

  userHelper.deleteWishlistProduct(userId, proId).then((response) => {
    res.json(response)
  })
})

//Checkout---------------------------------------------------------------

router.get('/checkout', verifyUserLogin, async (req, res) => {
  let userId = req.session.user._id
  let user = req.session.user
  let total = await userHelper.getTotalAmount(userId)
  let products = await userHelper.getCartProducts(userId)
  let brand = await userHelper.getBrands()
  let homePro = await userHelper.getHomeProducts()
  //cart count
  let cartCount = null
  if (req.session.user) {
    let Id = req.session.user._id
    cartCount = await userHelper.getCartCount(Id)
  }
  //get Address
  var address = null
  let status = await userHelper.addressChecker(req.session.user._id)
  console.log(status);
  if (status.address) {
    console.log(status.address, "st a");
    let addr = await userHelper.getUserAddress(req.session.user._id)
    // console.log(addr, "addr");
    let len = addr.length
    address = addr.slice(len - 2, len)
  }

  // console.log(address, "address");

  if (cartCount > 0) {
    res.render('user/checkout', { total, cart: true, brand, homePro, cartCount, products, address, user })
  } else {
    req.session.noCartPro = true
    res.redirect('/cart')
  }
})

router.post('/place-order', async (req, res) => {
  req.session.placeOrderData = req.body
  let newId = new objectId()
  console.log(newId)
  let total = await userHelper.getTotalAmount(req.session.user._id)
  if (req.body['Payment'] == 'COD') {
    console.log("in cod");
    let id = req.session.user._id
    let products = await userHelper.getCartProductList(id)
    console.log(products, "cartt pro");
    let total = await userHelper.getTotalAmount(id)
    userHelper.placeOrder(req.body, products, total).then((resp) => {
      req.session.orderId = resp.insertedId.toString()
      let orderId = req.session.orderId
      console.log(req.session.orderId, "order id");
      userHelper.stockChanger(req.session.orderId).then(() => {
        req.session.ordered = true
        res.json({ codSuccess: true })
        userHelper.clearCart(id).then(() => {
          console.log("cart cleared");
        })
      })
    })
  } else if (req.body['Payment'] == 'Razorpay') {

    userHelper.generateRazorpay(newId, total).then((resp) => {
      console.log("response=", resp);
      res.json({ resp, razorpay: true })

    })
  } else if (req.body['Payment'] == 'Paypal') {
    console.log("in paypal");
    req.session.total = req.body.Total
    val = total / 74
    console.log(val)
    total = val.toFixed(2)
    totals = total.toString()
    response.total = parseInt(total)
    response.paypal = true
    var create_payment_json = {
      "intent": "sale",
      "payer": {
        "payment_method": "paypal"
      },
      "redirect_urls": {
        "return_url": "http://localhost:3000/success",
        "cancel_url": "http://localhost:3000/cancelled"
      },
      "transactions": [{
        "item_list": {
          "items": [{
            "name": "cart products",
            "sku": "001",
            "price": totals,
            "currency": "USD",
            "quantity": 1
          }]
        },
        "amount": {
          "currency": "USD",
          "total": totals
        },
        "description": "This is the payment description."
      }]
    };
    paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
        throw error;
      } else {
        console.log("Create Payment Response");
        // console.log(payment); 
        console.log(payment.links);
        for (let i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === 'approval_url') {
            console.log("success");
            // res.redirect(payment.links[i].href)
            let url = payment.links[i].href
            console.log(response, "res");
            res.json({ url })



          } else {
            console.log("failed");
          }
        }

      }
    });

  }


})

//Coupon------------------------------------

router.post('/couponApply', (req, res) => {
  console.log(req.body);
  let id = req.session.user._id

  userHelper.couponValidate(req.body, id).then((response) => {
    console.log(response);
    if (response.success) {
      res.json({ couponSuccess: true, total: response.total })
    } else if (response.couponUsed) {
      res.json({ couponUsed: true })
    }
    else if (response.couponExpired) {
      res.json({ couponExpired: true })
    }
    else {
      res.json({ invalidCoupon: true })
    }

  })
})

//Buynow section--------------------------------------------------

router.get('/buyNow/:id', verifyUserLogin, async (req, res) => {
  let pId = req.params.id
  req.session.proId = pId
  let userId = req.session.user._id
  let user = req.session.user
  let productDetails = await userHelper.getBuyNowProductDetails(pId)
  let total = await userHelper.getBuyNowTotal(pId)
  let brand = await userHelper.getBrands()
  let homePro = await userHelper.getHomeProducts()
  req.session.pId = pId
  //cart count
  let cartCount = null
  if (req.session.user) {
    let Id = req.session.user._id
    cartCount = await userHelper.getCartCount(Id)
  }
  //get Address
  var address = null
  let status = await userHelper.addressChecker(req.session.user._id)
  console.log(status);
  if (status.address) {
    // console.log(status.address, "st a");
    let addr = await userHelper.getUserAddress(req.session.user._id)
    // console.log(addr, "addr");
    let len = addr.length
    address = addr.slice(len - 2, len)
  }
  res.render('user/buy-now', { total, cart: true, pId, brand, homePro, cartCount, productDetails, address, user })
})


router.post('/buyNow', async (req, res) => {
  if (req.session.userLoggedIn) {
    req.session.buyNowData = req.body
    console.log(req.session.buyNowData);
    let newId = new objectId()
    let product = await userHelper.getBuyNowProduct(req.body.ProId)
    let total = await userHelper.getBuyNowTotal(req.body.ProId)
    if (req.body['Payment'] == 'COD') {
      console.log("in cod");
      let id = req.session.user._id
      let product = await userHelper.getBuyNowProduct(req.body.ProId)
      let total = await userHelper.getBuyNowTotal(req.body.ProId)
      console.log("in buy now userjs post=", total);
      userHelper.placeOrder(req.body, product, total).then((resp) => {

        req.session.orderId = resp.insertedId.toString()
        let orderId = req.session.orderId
        console.log(req.session.orderId, "order id");
        userHelper.stockChanger(req.session.orderId).then(() => {
          req.session.ordered = true
          res.json({ codSuccess: true })

        })
      })
    } else if (req.body['Payment'] == 'Razorpay') {
      console.log("in online payment");

      userHelper.generateRazorpay(newId, total).then((resp) => {
        console.log("response=", resp);
        res.json({ resp, razorpay: true })

      })
    } else if (req.body['Payment'] == 'Paypal') {
      console.log("in paypal");
      req.session.total = req.body.Total
      console.log(req.session.buyNowData);
      val = total / 74
      console.log(val)
      total = val.toFixed(2)
      totals = total.toString()
      response.total = parseInt(total)
      response.paypal = true
      var create_payment_json = {
        "intent": "sale",
        "payer": {
          "payment_method": "paypal"
        },
        "redirect_urls": {
          "return_url": "http://localhost:3000/buyNowSuccess",
          "cancel_url": "http://localhost:3000/buyNowCancelled"
        },
        "transactions": [{
          "item_list": {
            "items": [{
              "name": "cart products",
              "sku": "001",
              "price": totals,
              "currency": "USD",
              "quantity": 1
            }]
          },
          "amount": {
            "currency": "USD",
            "total": totals
          },
          "description": "This is the payment description."
        }]
      };
      paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
          throw error;
        } else {
          console.log("Create Payment Response");
          // console.log(payment); 
          console.log(payment.links);
          for (let i = 0; i < payment.links.length; i++) {
            if (payment.links[i].rel === 'approval_url') {
              console.log("success");
              // res.redirect(payment.links[i].href)
              let url = payment.links[i].href
              // console.log(response, "res");
              res.json({ url })



            } else {
              console.log("failed");
            }
          }

        }
      });

    }
  } else {
    res.redirect('/login')
  }

})

//Paypal Buynow success---------------------------------------------------

router.get('/buyNowSuccess', verifyUserLogin, (req, res) => {
  let val = req.session.total
  val = val / 74
  let total = val.toFixed(2)

  console.log(total, "in success");
  console.log(val, "in success");

  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
      "amount": {
        "currency": "USD",
        "total": total
      }
    }]
  };
  paypal.payment.execute(paymentId, execute_payment_json, async function (error, payment) {
    if (error) {
      console.log("error response", error.response);
      throw error;
    } else {
      let data = req.session.buyNowData
      console.log(data);
      let id = req.session.user._id
      let pId = req.session.proId
      console.log(req.session.proId, "proid");
      let product = await userHelper.getBuyNowProduct(pId)
      let total = await userHelper.getBuyNowTotal(pId)
      console.log(id, data, product, total);
      userHelper.placeOrder(data, product, total).then((resp) => {
        req.session.orderId = resp.insertedId.toString()
        let orderId = req.session.orderId
        console.log(req.session.orderId, "order id");
        userHelper.stockChanger(req.session.orderId).then(() => {
          req.session.ordered = true
          let user = req.session.user
          console.log("cart cleared");
          res.render('user/order-success', { user })
          req.session.buyNowData = null

        })
      })

    }
  })

})

// Paypal Order Success------------------------------------------------

router.get('/success', verifyUserLogin, (req, res) => {
  let val = req.session.total
  val = val / 74
  let total = val.toFixed(2)

  console.log(total, "in success");
  console.log(val, "in success");

  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
      "amount": {
        "currency": "USD",
        "total": total
      }
    }]
  };
  paypal.payment.execute(paymentId, execute_payment_json, async function (error, payment) {
    if (error) {
      console.log("error response", error.response);
      throw error;
    } else {
      console.log(req.session.orderId, "orderid");
      let id = req.session.user._id
      let data = req.session.placeOrderData
      let products = await userHelper.getCartProductList(id)
      let total = await userHelper.getTotalAmount(id)
      userHelper.placeOrder(data, products, total).then((resp) => {
        req.session.orderId = resp.insertedId.toString()
        let orderId = req.session.orderId
        console.log(req.session.orderId, "order id");
        userHelper.stockChanger(req.session.orderId).then(() => {

          userHelper.clearCart(id).then(() => {
            let user = req.session.user
            console.log("cart cleared");
            res.render('user/order-success', { user })
            req.session.placeOrderData = null
          })
        })
      })


    }
  })

})



router.post('/verify-buyNowPayment', (req, res) => {
  let id = req.session.user._id
  userHelper.verifyPayment(req.body).then(async (response) => {
    let id = req.session.user._id
    let data = req.session.buyNowData

    let ProId = data.ProId
    let product = await userHelper.getBuyNowProduct(ProId)
    let total = await userHelper.getBuyNowTotal(ProId)

    userHelper.placeOrder(data, product, total).then((resp) => {
      req.session.orderId = resp.insertedId.toString()
      let orderId = req.session.orderId
      console.log(req.session.orderId, "order id");
      userHelper.stockChanger(req.session.orderId).then(() => {
        req.session.ordered = true
        console.log("cart cleared");
        req.session.buyNowData = null
        res.json({ status: true })
      })
    })
  }).catch((err) => {
    console.log("failed");
    console.log(err, "err");
    res.json({ status: false })
  })
})


router.post('/verify-payment', (req, res) => {
  let id = req.session.user._id
  userHelper.verifyPayment(req.body).then(async (response) => {
    let id = req.session.user._id
    let products = await userHelper.getCartProductList(id)
    let total = await userHelper.getTotalAmount(id)
    let data = req.session.placeOrderData
    userHelper.placeOrder(data, products, total).then((resp) => {
      let newId = new objectId()
      console.log(newId)
      req.session.orderId = resp.insertedId.toString()
      let orderId = req.session.orderId
      console.log(req.session.orderId, "order id");
      userHelper.stockChanger(req.session.orderId).then(() => {
        req.session.ordered = true
        console.log("success");
        userHelper.clearCart(id).then(() => {
          console.log("cart cleared");
          res.json({ status: true })
          req.session.placeOrderData = null
        })

      }).catch((err) => {
        console.log("failed");
        console.log(err, "err");
        res.json({ status: false })
      })
    })
  })
})

router.get('/order-success', verifyUserLogin, async (req, res) => {
  let user = req.session.user
  let brand = await userHelper.getBrands()
  let homePro = await userHelper.getHomeProducts()
  if (req.session.ordered) {
    res.render('user/order-success', { user, brand, homePro })
  } else {
    res.redirect('/cart')
  }
  req.session.ordered = false
})


//Cancelled

router.get('/buyNowCancelled', verifyUserLogin, async (req, res) => {
  let user = req.session.user
  let cartCount = null
  let brand = await userHelper.getBrands()
  let homePro = await userHelper.getHomeProducts()
  if (req.session.user) {
    let Id = req.session.user._id
    cartCount = await userHelper.getCartCount(Id)
  }
  res.render('user/cancel', { user, brand, homePro, cartCount })
})

router.get('/cancelled', verifyUserLogin, async (req, res) => {
  let user = req.session.user
  let cartCount = null
  let brand = await userHelper.getBrands()
  let homePro = await userHelper.getHomeProducts()
  if (req.session.user) {
    let Id = req.session.user._id
    cartCount = await userHelper.getCartCount(Id)
  }
  res.render('user/cancel', { user, brand, homePro, cartCount })
})


router.get('/addNewAddress', verifyUserLogin, async (req, res) => {
  let cartCount = null
  let brand = await userHelper.getBrands()
  let homePro = await userHelper.getHomeProducts()
  if (req.session.user) {
    let Id = req.session.user._id
    cartCount = await userHelper.getCartCount(Id)
  }
  let user = req.session.user
  console.log(user);
  res.render('user/add-new-address', { user, brand, homePro, cartCount })
})

router.post('/addNewAddress', (req, res) => {
  console.log(req.body);
  userHelper.addNewAddress(req.body).then((response) => {
    console.log(response, "address");
    res.redirect('/checkout')
  })

})

router.get('/myOrders', verifyUserLogin, async (req, res) => {
  let user = req.session.user
  let id = req.session.user._id
  let brand = await userHelper.getBrands()
  let homePro = await userHelper.getHomeProducts()
  console.log(id);
  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelper.getCartCount(id)
  }
  userHelper.getUserOrders(id).then((orders) => {

    let len = orders.length


    res.render('user/my-orders', { orders, brand, homePro, cartCount, user })
  })

})

router.get('/cancelOrder/:id', (req, res) => {
  let id = req.params.id
  userHelper.cancelOrder(id).then((reaponse) => {
    res.redirect('/myOrders')
  })
})


router.get('/singleOrder/:id', verifyUserLogin, async (req, res) => {
  let user = req.session.user
  let oId = req.params.id
  let brand = await userHelper.getBrands()
  let homePro = await userHelper.getHomeProducts()

  let cartCount = null
  if (req.session.user) {
    let Id = req.session.user._id
    cartCount = await userHelper.getCartCount(Id)
  }

  adminHelpers.getOrderProducts(oId).then((products) => {
    console.log(oId);
    console.log(products, "pr o");
    res.render('user/single-orders', { products, brand, homePro, user, cartCount })
  })
})


//My profile----------------------------------------------

router.get('/profile', verifyUserLogin, async (req, res) => {
  let id = req.session.user._id
  let brand = await userHelper.getBrands()
  let homePro = await userHelper.getHomeProducts()
  let user = await adminHelpers.getUserdetails(id)
  let cartCount = null
  if (req.session.user) {
    let Id = req.session.user._id
    cartCount = await userHelper.getCartCount(Id)
  }

  //get Address
  var address = null
  let status = await userHelper.addressChecker(req.session.user._id)
  console.log(status);
  if (status.address) {
    console.log(status.address, "st a");
    let addr = await userHelper.getUserAddress(req.session.user._id)
    console.log(addr, "addr");
    let len = addr.length
    address = addr
  }
  res.render('user/my-profile', { user, brand, homePro, address, cartCount })
})

router.post('/edit-profile', (req, res) => {
  console.log(req.body);
  let id = req.session.user._id
  userHelper.updateProfile(id, req.body).then((response) => {
    res.redirect('/profile')
  })
})

router.get('/addNewAddressProfile', verifyUserLogin, async (req, res) => {
  let cartCount = null
  if (req.session.user) {
    let Id = req.session.user._id
    cartCount = await userHelper.getCartCount(Id)
  }
  let brand = await userHelper.getBrands()
  let homePro = await userHelper.getHomeProducts()
  let user = req.session.user
  console.log(user);
  res.render('user/add-new-addressProfile', { user, brand, homePro, cartCount })
})

router.post('/addNewAddressProfile', (req, res) => {
  console.log(req.body, "fyfy");
  userHelper.addNewAddress(req.body).then((response) => {
    console.log(response);
    res.redirect('/profile')
  })

})

router.get('/edit-address/:id', verifyUserLogin, async (req, res) => {
  let brand = await userHelper.getBrands()
  let homePro = await userHelper.getHomeProducts()
  let aId = req.params.id
  let uId = req.session.user._id
  console.log(aId);
  let address = await userHelper.getSingleAddress(aId, uId)
  console.log("address=", address);
  res.render('user/edit-address', { brand, homePro, address })
})

router.post('/edit-address', (req, res) => {
  console.log(req.body, "req.body");
  userHelper.editAddress(req.body).then((response) => {
    res.redirect('/profile')
  })
})

router.get('/delete-address/:id', verifyUserLogin, (req, res) => {
  let Id = req.params.id
  let uId = req.session.user._id

  userHelper.deleteAddress(Id, uId).then((response) => {
    console.log("deleted");
    res.redirect('/profile')
  })
})

router.get('/addProfile', verifyUserLogin, (req, res) => {
  res.render('user/add-profile')
})

//Add pic----------------------

router.post('/addProfile', verifyUserLogin, (req, res) => {
  let id = req.session.user._id
  console.log(req.files);
  if (req.files) {
    let image = req.files.image3
    image.mv('public/userImages/' + id + '.jpg', (err, done) => {
      if (!err) {

        res.redirect('/profile')
      } else {
        console.log(err);
        res.redirect('/profile')
      }

    })
  } else {
    res.redirect('/profile')
  }
})

//Cahnge passsword------------------------------------------------

router.get('/change-password', verifyUserLogin, async (req, res) => {
  let user = req.session.user
  let brand = await userHelper.getBrands()
  let homePro = await userHelper.getHomeProducts()
  let cartCount = null
  if (req.session.user) {
    let Id = req.session.user._id
    cartCount = await userHelper.getCartCount(Id)
  }
  res.render('user/change-password', { user, brand, cartCount, homePro, "notSame": req.session.pswdNotSame, "invalid": req.session.invalidpswd })
  req.session.pswdNotSame = false
  req.session.invalidpswd = false
})

router.post('/change-password', verifyUserLogin, (req, res) => {
  console.log(req.body, "req");
  let id = req.session.user._id
  let pass1 = req.body.password1
  let pass2 = req.body.password2
  console.log(pass1, " ", pass2);
  if (pass1 == pass2) {
    userHelper.changePassword(id, req.body).then((response) => {
      if (response.status) {
        console.log(response);
        req.session.userLoggedIn = false
        req.session.user = null
        res.redirect('/login')
      } else {
        req.session.invalidpswd = true
        res.redirect('/change-password')
      }


    })
  } else {
    req.session.pswdNotSame = true
    res.redirect('/change-password')
  }

})


router.get('/logout', (req, res) => {
  req.session.user = null
  req.session.userLoggedIn = false
  res.redirect('/')
})


module.exports = router;
