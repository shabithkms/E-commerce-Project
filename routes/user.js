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

//service1
// const serviceSID ="VA5a8ef04e14678a8226f1d6f5d8d30549"
// const accountSID = "ACef72f523eca7c62a1505e6aca1fcaa1a"
// const authToken = "febc47a5cba24670884f237d84c0ab24"
//Service2  
//const serviceSID = "VAe89712e0ae1b1f867d8672dfbf582432"
//const accountSID = "ACd7f6eccaeb97ca60a7fb411c4a68d22e"
//const authToken = "491b304d87215980f117a7b37e3dd416"
//service3
const serviceSID = "VA16f9513e1b7658ace6d44a0d9ac7a3ef"
const accountSID = "AC81d9954beb80e9bee0ce1c9588a5f266"
const authToken = "6613e9c8282fb122e7e5a89755dc4d16"
//Service 4
// const serviceSID = "VA6580cfcd0919f0304c7920ca71bf4f2a"
// const accountSID = "AC04c91fa3b4e1f6dc9fd80ba41c63acdd"
// const authToken = "60a34da2097c569dc4f54b5e431b9e18"


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
    res.render('user/user-login', { "loginErr": req.session.loggedInErr, "otpErr": req.session.otpErr, "blockErr": req.session.blockErr, "noUser": req.session.noUser })
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

        // client.verify
        //   .services(serviceSID)
        //   .verifications.create({
        //     to: `+91${req.body.mobileNo}`,
        //     channel: "sms"
        //   }).then((resp) => {
        //     console.log(resp.to);
        //     req.session.number = resp.to


        //     req.session.loginHalf = true
        //     res.redirect('/login/otp')
        //   }).catch((err) => {
        //     console.log(err, "err");
        //     req.session.otpErr = true
        //     res.redirect('/login/otp')
        //   })
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

router.get('/loginOtp', (req, res) => {
  res.render('user/user-mobile', { otp: true })
})

router.post('/loginOtp', (req, res) => {
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
})



//OTP

router.get('/login/otp', (req, res) => {
  if (req.session.userLoggedIn) {
    
      res.redirect('/')
    
    
  } else {
    if (req.session.loginHalf) {
      res.render('user/user-otp', { otp: true, login: true, "invalidOtp": req.session.invalidOtp, "otpErr": req.session.otpErr })
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
      } else if(err.code==60203) {
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

//Forget Password

router.get('/forgetPassword', (req, res) => {
  res.render('user/user-changePassword', { otp: true, login: true })

})

router.post('/forgetPassword', (req, res) => {
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
      console.log(err, "err");
      req.session.otpErr = true
      res.redirect('/login/otp')
    })
})

router.get('/forgetPasswordOtp',(req,res)=>{
  res.render('user/user-setPasswordOtp', { otp: true, login: true, "invalidOtp": req.session.invalidOtp, "otpErr": req.session.otpErr })
  req.session.otpErr = false
  req.session.invalidOtp = false
})

router.post('/forgetPasswordOtp',(req,res)=>{
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
      } else if(err.code==60203) {
        req.session.maxOtp = true
        res.redirect('/forgetPasswordOtp')
      }

    })
})

router.get('/setPassword',(req,res)=>{
  res.render('user/user-setPassword',{login:true,otp:true,"notSame":req.session.notSame})
  req.session.notSame=false 
})

router.post('/setPassword',async (req,res)=>{
  console.log(req.body);
  let p1=req.body.password1
  let p2=req.body.password2
  console.log(req.session.number,"set");
  let mobileNo=req.session.number
  let user=await userHelper.getUserdetails(mobileNo)
  
  if(p1===p2){
    userHelper.setPassword(mobileNo,req.body,user).then((response)=>{
      req.session.userLoggedIn=false
      req.session.user=null
      res.redirect('/login')
    })
  }else{
    req.session.notSame=true
    res.redirect('/setPassword')
  }
})



//Signup

router.get('/signup', (req, res) => {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  if (req.session.userLoggedIn) {
    res.redirect('/')
  } else {
    res.render('user/user-signup', { "mobileNoExist": req.session.mobileNoExist })
    req.session.mobileNoExist = false
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
        // console.log(err, "err");
      })

  }).catch((err) => {
    // console.log("in catch");
    // console.log(err.code,"exist");
    if (err.code == 11000) {
      req.session.mobileNoExist = true
      res.redirect('/signup')
    }

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
