var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt')
const objectId = require('mongodb').ObjectID
const moment = require('moment')
const Razorpay = require('razorpay')
const { response } = require('../app')
const e = require('express')
const paypal=require('paypal-rest-sdk')
var instance = new Razorpay({
    key_id: process.env.key_id,
    key_secret: process.env.key_secret,
});


module.exports = {

    //User section starting...

    doSignUp: (userData) => {
        return new Promise(async (resolve, reject) => {


            // console.log(userData);

            userData.password = await bcrypt.hash(userData.password, 10)
            user = {
                firstname: userData.firstName,
                lastname: userData.lastName,
                email: userData.email,
                mobileNo: `+91${userData.mobileNo}`,
                password: userData.password,
                status: true
            }
            db.get().collection(collection.USER_COLLECTION).insertOne(user).then((data) => {

                resolve(user)

            }).catch((err) => {
                // console.log(err,"err");
                reject(err)
            })
        })
    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let newMob = `+91${userData.mobileNo}`
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ mobileNo: newMob })
            if (user) {
                response.userStatus = true
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        console.log("login success");
                        response.user = user 
                        response.status = true
                        resolve(response)
                    } else {
                        console.log("login failed");
                        resolve({ status: false, userStatus: true })
                    }

                })
            } else {
                console.log("failed");
                resolve({ status: false, userStatus: false })
            }
        })
    },
    updateProfile: (id, newData) => {
        return new Promise((resolve, reject) => {
            let newf = newData.firstname
            let newl = newData.lastname
            let newm = newData.mobile
            let newe = newData.email
            let len = newm.length
            console.log(len);
            if (len == 10) {
                newm = `+91${newm}`
            }
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(id) }, {
                $set: {
                    firstname: newf,
                    lastname: newl,
                    mobileNo: newm,
                    email: newe
                }
            }).then((response) => {
                console.log(response);
                resolve(response)
            }).catch((err) => {
                console.log(err);
            })
        })
    },
    getUserdetails: (No) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ mobileNo: No })
            if (user) {
                resolve(user)
                console.log(user, "grt");
            } else {
                console.log("else");
                resolve(false)
            }
        })


    },
    setPassword: (No, data, user) => {
        return new Promise(async (resolve, reject) => {


            console.log("user", user);
            data.password1 = await bcrypt.hash(data.password1, 10)
            let passwordNew = data.password1
            db.get().collection(collection.USER_COLLECTION).updateOne({ mobileNo: No },
                {
                    $set: {
                        firstname: user.firstname,
                        lastname: user.lastname,
                        email: user.email,
                        mobileNo: user.mobileNo,
                        password: passwordNew,
                        status: user.status

                    }
                }).then((response) => {
                    resolve(response)
                })
        })
    },
    addressChecker: (userId) => {
        return new Promise(async (resolve, reject) => {
            let status = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) })
            if (user.address) {
                status.address = true
            }
            resolve(status)
        })
    },
    getUserAddress: (userId) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) })
            let address = user.address
            resolve(address)
        })
    },
    addNewAddress: (details) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(details.User) })
            details._id = objectId()
            console.log(details, "de");
            if (user.address) {
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(details.User) }, {
                    $push: {
                        address: details
                    }
                }).then(() => {
                    resolve()
                })
            } else {

                addr = [details]
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(details.User) }, {
                    $set: {
                        address: addr
                    }
                }).then((user) => {
                    resolve(user)
                })
            }

        })
    },
    getSingleAddress: (Id, uId) => {
        return new Promise(async (resolve, reject) => {
            console.log(Id);
            let address = await db.get().collection(collection.USER_COLLECTION).aggregate([
                {
                    $match:{
                        _id:objectId(uId)
                    }
                },
                {
                    $unwind:"$address"
                },
                {
                    $match:{
                        "address._id":objectId(Id)
                    }
                },
                {
                    $project:{
                        address:1,
                        _id:0
                    }
                }
            ]).toArray()
            resolve(address)
            
            

        })
    },
    editAddress: (newData) => {
        console.log(newData, "new");

        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(newData.User), "address._id": objectId(newData._id) }, {
                $set: {
                    "address.$.FirstName": newData.FirstName,
                    "address.$.LastName": newData.LastName,
                    "address.$.House": newData.House,
                    "address.$.Street": newData.Street,
                    "address.$.Town": newData.Town,
                    "address.$.PIN": newData.PIN,
                    "address.$.Mobile": newData.Mobile,
                    "address.$.Email": newData.Email,


                }
            }).then((response) => {
                resolve(response)
                console.log("response=,", response);
            })
        })
    },
    deleteAddress: (Id, uId) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(uId) })
            if (user) {
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(uId) }, {
                    $pull: {
                        address: { _id: objectId(Id) }
                    }
                }).then((response) => {
                    resolve(response)
                    console.log(response, "red");
                })
            }
        })
    },
    changePassword: (Id, data) => {
        return new Promise(async (resolve, reject) => {
            // response={}
            console.log(data);
            let p1 = data.password1
            let p2 = data.password2
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(Id) })
            if (user) {
                console.log(user, "user");
                data1 = await bcrypt.hash(data.password1, 10)
                if (p1 == p2) {
                    bcrypt.compare(data.current, user.password).then((status) => {
                        if (status) {
                            console.log(status);
                            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(Id) }, {
                                $set: {
                                    password: data1
                                }
                            }).then((response) => {
                                resolve(response)
                                console.log(response, "then");
                            })
                        } else {
                            console.log("current password is invalid");
                        }
                    })
                } else {
                    console.log("password must be same");
                    // response({ notSame: true })
                    resolve(response)
                    console.log(response);
                }

            }

        })
    },

    //User section ends...




    // Cart section Starting

    addToCart: (proId, userId) => {
        let proObj = {
            item: objectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })

            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == proId)
                console.log(proExist);
                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId), 'products.item': objectId(proId) },
                        {
                            $inc: { 'products.$.quantity': 1 }
                        }
                    ).then(() => {
                        resolve()
                    })
                } else {

                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId) },
                        {

                            $push: {
                                products: proObj
                            }


                        }).then((response) => {
                            resolve(response)
                        })
                }
            } else {
                let cartObj = {
                    user: objectId(userId),
                    products: [proObj],

                }

                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve(response)
                })
            }
        })
    },
    getCartProducts: (Id) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(Id) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] },
                        subtotal: { $multiply: [{ $arrayElemAt: ["$product.price", 0] }, "$quantity"] }
                    }
                }

            ]).toArray()
            // console.log(cartItems);
            resolve(cartItems)
        })
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            console.log(cart, "cart");

            if (cart) {
                count = cart.products.length
            }
            resolve(count)
        })
    },
    changeProductQuantity: (details) => {
        let cartId = details.cart
        let proId = details.product
        let count = details.count
        let quantity = details.quantity
        count = parseInt(count)
        quantity = parseInt(quantity)
        return new Promise((resolve, reject) => {
            if (count == -1 && quantity == 1) {
                db.get().collection(collection.CART_COLLECTION).updateOne(
                    { _id: objectId(cartId) },
                    {
                        $pull: { products: { item: objectId(proId) } }
                    }).then((response) => {
                        resolve({ removeProduct: true })
                    })
            } else {
                db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectId(cartId), 'products.item': objectId(proId) }, {
                    $inc: {
                        'products.$.quantity': count
                    }
                }).then((response) => {

                    resolve({ status: true })
                })
            }

        })
    },
    deleteCartProduct: (cartId, proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).updateOne(
                { _id: objectId(cartId) },
                {
                    $pull: { products: { item: objectId(proId) } }
                }).then((response) => {
                    resolve({ removeProduct: true })
                })
        })
    },
    getSubTotal: (userId, proId) => {
        return new Promise(async (resolve, reject) => {
            let subtotal = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: {
                        user: objectId(userId)
                    }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'products'

                    }
                },
                {
                    $match: {
                        item: objectId(proId)
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$products', 0] }

                    }

                },
                {
                    $project: {
                        unitPrice: { $toInt: '$product.price' },
                        quantity: { $toInt: '$quantity' }
                    }
                },
                {
                    $project: {
                        _id: null,
                        subtotal: { $sum: { $multiply: ['$quantity', '$unitPrice'] } }
                    }
                }

            ]).toArray()
            console.log(subtotal, "in u");
            if (subtotal.length > 0) {
                resolve(subtotal[0].subtotal)
            }
            else {
                subtotal = 0
                resolve(subtotal)
            }


        })
    },
    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (cart) {
                if (cart.products.length > 0) {
                    let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                        {
                            $match: { user: objectId(userId) }
                        },
                        {
                            $unwind: '$products'
                        },
                        {
                            $project: {
                                item: '$products.item',
                                quantity: '$products.quantity'
                            }
                        },
                        {
                            $lookup: {
                                from: collection.PRODUCT_COLLECTION,
                                localField: 'item',
                                foreignField: '_id',
                                as: 'product'
                            }
                        },
                        {
                            $project: {
                                item: 1,
                                quantity: 1,
                                product: { $arrayElemAt: ['$product', 0] }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                total: { $sum: { $multiply: [{ '$toInt': '$quantity' }, { '$toInt': '$product.price' }] } }
                            }
                        }

                    ]).toArray()
                    console.log(total, "t");
                    resolve(total[0].total)
                } else {
                    console.log('no products');
                    let total = [{ total: 0 }]
                    resolve(total[0].total)
                    console.log(response);
                }
            } else {
                console.log("No cart");
                resolve()
            }


        }).catch((err) => {
            console.log(err, "err in total");
        })
    },
    getCartProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            resolve(cart.products)
        })
    },

    //Cart ends...

    //Order section starting

    placeOrder: (order, products, total) => {
        return new Promise((resolve, reject) => {
            
            let Status = order.Payment === 'COD' ? 'Placed' : 'Pending'
            let len=products.length
            for(i=0;i<len;i++){
              products[i].proStatus=order.Payment === 'COD' ? 'Placed' : 'Pending'
            }
            console.log("products=",products);
            


            let dateIso = new Date()
            let date = moment(dateIso).format('DD/MM/YYYY')
            let time = moment(dateIso).format('HH:mm:ss')
            let orderObj = {
                deliveryDetails: {
                    FirstName: order.FirstName,
                    LastName: order.LastName,
                    House: order.House,
                    Street: order.Street,
                    Town: order.Town,
                    PIN: order.PIN,
                    Mobile: order.Mobile
                },
                Email: order.Email,
                User: order.User,
                PaymentMethod: order.Payment,
                Products: products,
                Total: total,
                Discount: order.Discount,
                Date: date,
                Time: time,
                Status: Status

            }
            

            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                console.log("order inserted");
                resolve(response)
                
               
            })

        })

    },
    clearCart:(User)=>{
        return new Promise ((resolve,reject)=>{
            db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectId(User) }).then(()=>{
                resolve()
            })
        })
    }, 
    //Razor pay
    generateRazorpay: (orderId,total) => {
        return new Promise((resolve, reject) => {
            var options={
                amount:total*100,
                currency:"INR",
                receipt:orderId.toString()
            };
            instance.orders.create(options,(err,order)=>{
                if(err){
                    console.log("No order");
                    console.log("error=",err);
                }else{
                    console.log("order=",order);
                    resolve(order)
                }
            })
        })
    },

    verifyPayment:(details)=>{
        return new Promise((resolve,reject)=>{
            console.log("Details=",details);
            const crypto=require('crypto')
            // console.log(process.env.key_secret,"key");
            let hmac=crypto.createHmac('sha256',process.env.key_secret)
            console.log(details['response[razorpay_order_id]'],"order");
            console.log(details['response[razorpay_payment_id]'],"payment");
            console.log(details['response[razorpay_signature]'],"sign");
            hmac.update(details['response[razorpay_order_id]']+'|'+details['response[razorpay_payment_id]']);
            hmac=hmac.digest('hex')
            if(hmac==details['response[razorpay_signature]']){
                console.log("hmac matched");
                resolve()
            }else{
                console.log("hmac reject");
                reject()
            }
        })
    },

    //Paypal
    
    changePaymentStatus:(oId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(oId)},
            {
                $set:{
                    Status:'Placed'
                }
            }).then(()=>{
                resolve()
            })
        })
    },


    getUserOrders: (Id) => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find().sort({$natural:-1}).toArray()
           
            console.log("sortted");
            resolve(orders)
        })
    },
    cancelOrder:(Id)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(Id)},
            {
                $set:{
                    Status:'Cancelled'
                }
            }).then(()=>{
                resolve()
            })
        })
    },
    stockChanger: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let prod = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        _id: objectId(orderId)
                    }
                },
                {
                    $unwind: '$Products'
                },
                {
                    $project: {
                        item: '$Products.item',
                        quantity: '$Products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'products'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$products', 0] },
                        newQty: { $subtract: [{ $arrayElemAt: ['$products.stock', 0] }, '$quantity'] }
                    }
                }
            ]).toArray()
            let proLen = prod.length
            
            for (let i = 0; i < proLen; i++) {
                let itemMain = prod[i]
                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(itemMain.item) }, {
                    $set: {
                        stock: itemMain.newQty
                    }
                })
                if (itemMain.newQty < 1) {
                    db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(itemMain.item) }, {
                        $set: {
                            stockout: true
                        }
                    })
                } else {
                    db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(itemMain.item) }, {
                        $unset: {
                            stockout: ""
                        }
                    })
                }
            }
            resolve()
        })
    },

    //Header banners

    getBrands: () => {
        return new Promise(async (resolve, reject) => {
            let brands = await db.get().collection(collection.BRAND_COLLECTION).find().limit(6).toArray()

            resolve(brands)
        })
    },
    getHomeProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().sort({$natural:-1}).limit(6).toArray()

            resolve(products)
        })
    },

    //All products

    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },

    //By Name

    getProductsByName: (name) => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ name: name })
            resolve(products)
            console.log("by name=", products);
        })
    },

    //By Brands
    getProductsByBrand: (name) => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({ brand: name }).toArray()
            resolve(products)
        })
    },

    //Banners
    getAllBanners:()=>{
        return new Promise(async(resolve,reject)=>{
         let banners=await   db.get().collection(collection.BANNER_COLLECTION).find().toArray()
         resolve(banners)
        })
    }


}