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

const accountSID = process.env.accountSID
const authToken = process.env.authToken
const serviceSID = process.env.serviceSID

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
  // console.log(homePro);
  res.render('user/home', { user, userPage: true, products, brand, homePro, cartCount })

});


//Login Page
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

router.get('/loginOtp',async (req, res) => {
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

router.get('/login/otp',async (req, res) => {
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
          console.log(user, "otpiser");
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
      console.log(err.code, "err");
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

router.get('/forgetPassword',async (req, res) => {
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



//Product secction starting

//By Id
router.get('/product/:id', async (req, res) => {
  let id = req.params.id
  let cartCount = null
  if (req.session.user) {
    let Id = req.session.user._id
    cartCount = await userHelper.getCartCount(Id) 
  }
  let realtedProducts = await productHelper.getRelatedProducts()
  console.log("Related", realtedProducts);
  let brand = await userHelper.getBrands()
  let homePro = await userHelper.getHomeProducts()
  let user = req.session.user
  let product = await productHelper.getProductDetails(id).then((product) => {
    console.log(product, "pro in single")
    res.render('user/single-product', { userPage: true, brand, homePro, cartCount, user, product, realtedProducts })
  })

})
//All products
router.get('/products',async(req,res)=>{
  let products=await userHelper.getAllProducts()
  let brand = await userHelper.getBrands()
  let homePro = await userHelper.getHomeProducts()
  res.render('user/all-products',{products,brand,homePro, userPage:true})
})

//By name

router.get('/products/:name',async(req,res)=>{
  let name=req.params.name
  console.log(name,"=name");
  let brand = await userHelper.getBrands()
  let homePro = await userHelper.getHomeProducts()
  let product=await userHelper.getProductsByName(name)
  res.render('user/name-products',{userPage:true,brand,homePro,product})
})




//Cart section starting

router.get('/cart', verifyUserLogin, async (req, res, next) => {

  let id = req.session.user._id
  console.log(req.session.user);
  let products = await userHelper.getCartProducts(id)
  console.log(products);
  let user = req.session.user
  let totals = 0
  if (products.length > 0) {
    totals = await userHelper.getTotalAmount(id)
  }
  let brand = await userHelper.getBrands()
  let homePro = await userHelper.getHomeProducts()


  if (req.session.user) {
    let Id = req.session.user._id
    cartCount = await userHelper.getCartCount(Id)
  }
  if (cartCount > 0) {

    res.render('user/newCart', { cart: true, userPage: true,brand,homePro, user, 'noCart': req.session.noCartPro, cartCount, products, totals })
    req.session.noCartPro = false
  } else {
    let brand = await userHelper.getBrands()
    let homePro = await userHelper.getHomeProducts()
    res.render('user/empty-cart', { userPage: true, brand, homePro, user })
  }

  // userHelper.deleteAddress(id).then((res)=>{
  //   console.log("pulled");
  // })


})


router.get('/add-to-cart/:id', (req, res) => {
  console.log("Api call");

  let proId = req.params.id
  let userId = req.session.user._id

  userHelper.addToCart(proId, userId).then((response) => {
    req.session.noCartPro = false
    res.json({ status: true })
  })
})

router.post('/change-product-quantity', (req, res) => {
  console.log(req.body);
  let id = req.body.user
  let proId = req.body.product
  userHelper.changeProductQuantity(req.body).then(async (response) => {
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

//Checkout

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
    console.log(addr, "addr");
    let len = addr.length
    address = addr.slice(len - 2, len)
  }

  console.log(address, "address");

  if (cartCount > 0) {
    res.render('user/checkout', { total, cart: true,brand,homePro, cartCount, products, address, user })
  } else {
    req.session.noCartPro = true
    res.redirect('/cart')
  }
})

router.post('/place-order', async (req, res) => {
  console.log(req.body);
  let id = req.session.user._id
  let products = await userHelper.getCartProductList(id)
  let total = await userHelper.getTotalAmount(id)
  userHelper.placeOrder(req.body, products, total).then((resp) => {
    response.orderId = resp.insertedId.toString()
    req.session.orderId = resp.insertedId.toString()
    console.log(req.session.orderId, "order id");
    userHelper.stockChanger(req.session.orderId).then(() => {
      req.session.ordered = true
      res.json({ status: true })
    })

  })
})

router.get('/order-success', verifyUserLogin,async (req, res) => {
  let user = req.session.user
  let brand = await userHelper.getBrands()
  let homePro = await userHelper.getHomeProducts()
  if (req.session.ordered) {
    res.render('user/order-success', { user,brand,homePro })
  } else {
    res.redirect('/cart')
  }

  req.session.ordered = false
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
  res.render('user/add-new-address', { user,brand,homePro, cartCount })
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
    let Id = req.session.user._id
    cartCount = await userHelper.getCartCount(Id)
  }
  userHelper.getUserOrders(id).then((orders) => {
    console.log(orders, "order");
    let len = orders.length
    // for(i=0;i<len;i++){
    //   console.log(orders[i].Status);
    // }
    // let result = orders.map(({ Status }) => Status)
    // console.log(result, "res");

    res.render('user/user-orders', { orders,brand,homePro, cartCount, user })
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
    console.log(products, "pr o");
    res.render('user/single-orders', { products,brand,homePro, user, cartCount })
  })
})

//My profile

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
    address = addr.slice(len - 2, len)
  }

  res.render('user/my-profile', { user,brand,homePro, address, cartCount })
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
  res.render('user/add-new-addressProfile', { user, brand,homePro,cartCount })
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
  res.render('user/edit-address',brand,homePro, address)
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
  })
})

router.get('/change-password', verifyUserLogin,async (req, res) => {
  let user = req.session.user
  let brand = await userHelper.getBrands()
  let homePro = await userHelper.getHomeProducts()
  res.render('user/change-password', { user,brand,homePro })
})

router.post('/change-password', (req, res) => {
  console.log(req.body, "req");
  let id = req.session.user._id
  userHelper.changePassword(id, req.body).then((response) => {
    console.log(response);
    req.session.userLoggedIn = false
    req.session.user = null
    res.redirect('/login')
  })
})


router.get('/logout', (req, res) => {    
  req.session.user = null
  req.session.userLoggedIn = false
  res.redirect('/')
})


module.exports = router;
