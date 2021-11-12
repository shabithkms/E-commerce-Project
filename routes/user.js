var express = require('express');
var router = express.Router();
const { Db } = require('mongodb');
const userHelper = require('../helpers/user-helper');
var db = require('../config/connection')
var collection = require('../config/collection');
const { response } = require('express');
const productHelper = require('../helpers/product-helper');
const { Client } = require('twilio/lib/twiml/VoiceResponse');
const { render } = require('../app');
const serviceSID = "VA4f6cca5d15fccc194e8862a54bbcf116"
const accountSID = "ACef72f523eca7c62a1505e6aca1fcaa1a"
const authToken = "febc47a5cba24670884f237d84c0ab24"
const client = require('twilio')(accountSID, authToken)


const verifyUserLogin = (req, res, next) => {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  if (req.session.userloggedIn) {
    // let userId = req.session.user._id
    // userHelper.getUserDetails(userId).then((user) => {
    //   console.log("In verify login");
    //   if (user) {
    //     console.log(user.status);
    //     if (user.status === "Active") {
    //       next()
    //     } else {

    //       req.session.blockErr = true
    //       req.session.deleteErr = false
    //       req.session.user = null
    //       req.session.userloggedIn = false
    //       res.redirect('/login')
    //     }

    //   } else {
    //     console.log('no user');
    //     req.session.deleteErr = true
    //     req.session.user = null
    //     req.session.userloggedIn = false
    //     res.redirect('/login')

    //   }

    // })
    next()
  } else {
    res.redirect('/login')
  }
}

//Home page
router.get('/', async function (req, res, next) {
  let user = req.session.user
  console.log(user, "user");
  let products = await productHelper.getAllProducts()
  // console.log(products);

  res.render('user/home', { user, users: true, products })
});


//Login Page
router.get('/login', (req, res) => {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  if (req.session.userLoggedIn) {
    res.redirect('/')
  } else {
    res.render('user/user-login', { "loginErr": req.session.loggedInErr,"otpErr": req.session.otpErr, "blockErr": req.session.blockErr, "noUser": req.session.noUser })
    req.session.loggedInErr = false
    req.session.blockErr = false
    req.session.noUser = false
    req.session.otpErr=false 
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

        client.verify
          .services(serviceSID)
          .verifications.create({
            to: `+91${req.body.mobileNo}`,
            channel: "sms"
          }).then((resp) => {
            console.log(resp.to);
            req.session.number = resp.to
            // req.session.user = response.user

            req.session.loginHalf = true
            res.redirect('/login/otp')
          }).catch((err) => {
            console.log(err, "err");
            req.session.otpErr = true
            res.redirect('/login/otp')
          })


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



//OTP

router.get('/login/otp', (req, res) => {
  if (req.session.userLoggedIn) {
    res.redirect('/')
  } else {
    if (req.session.loginHalf) {
      res.render('user/user-otp', { otp: true, login: true, "otpErr": req.session.otpErr })
      req.sessio.otpErr = false
    } else {
      res.redirect('/login')
    }

  }

})

router.post('/login/otp', (req, res) => {

  let a = Object.values(req.body)
  let b = a.join('')


  let otp = `"${b}"`
  console.log(otp, "new");

  // let otp = req.body.otp
  // console.log(req.session.number, "otp");
  let number = req.session.number
  // console.log(number);
  client.verify
    .services(serviceSID)
    .verificationChecks.create({
      to: number,
      code: otp
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
        res.redirect('/login/otp')
      }

    }).catch((err) => {
      console.log(err, "err");
      req.session.otpErr = true
      res.redirect('/login/otp')
    })

})

router.get('/resendOtp', (req, res) => {
  console.log("ressend");
  client.verify
    .services(serviceSID)
    .verifications.create({
      to: `+91${req.body.mobileNo}`,
      channel: "sms"
    }).then((response) => {
      console.log(response, "rse");
      req.session.user = response.user
      res.redirect('/login/otp')
    }).catch((err) => {
      console.log(err, "err");
      req.session.otpErr = true
      res.redirect('/login')
    })
  res.render('user/user-otp')
})



//Signup

router.get('/signup', (req, res) => {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  if (req.session.userLoggedIn) {
    res.redirect('/')
  } else {
    res.render('user/user-signup')
    req.session.loginErr = false
    req.session.blockErr = false
  }

})


router.post('/signup', (req, res) => {

  userHelper.doSignUp(req.body).then((user) => {
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
      })

  })
})

//Cart

router.get('/cart', verifyUserLogin, (req, res) => {
  res.render('user/cart', { user: true })
})


router.get('/logout', (req, res) => {
  req.session.user = null
  req.session.userLoggedIn = false
  res.redirect('/')
})


module.exports = router;
