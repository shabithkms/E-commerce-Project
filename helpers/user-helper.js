var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt')
const objectId = require('mongodb').ObjectID
const moment = require('moment')
const Razorpay = require('razorpay')
const { response } = require('../app')
const e = require('express')
const paypal = require('paypal-rest-sdk')
const { resolve } = require('path')
//Creating razor pay instance
var instance = new Razorpay({
    key_id: process.env.key_id,
    key_secret: process.env.key_secret,
});

module.exports = {

    //User section starting...
    doSignUp: (userData) => {
        return new Promise(async (resolve, reject) => {
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
    //Edit profile of user
    updateProfile: (id, newData) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(id) })
            console.log(user);
            let newf = newData.firstname
            let newl = newData.lastname
            let newm = newData.mobile
            let newe = newData.email
            let len = newm.length
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
                resolve(response)
            }).catch((err) => {
                resolve(err)
            })
        })
    },
    //Getting user details using mobile numbers for session creation
    getUserdetails: (No) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ mobileNo: No })
            if (user) {
                resolve(user)
            } else {
                console.log("else");
                resolve(false)
            }
        })
    },
    //User forgot  password
    setPassword: (No, data, user) => {
        return new Promise(async (resolve, reject) => {
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
    //Checking user have a address or not with user id
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
    //Get user address with user Id
    getUserAddress: (userId) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) })
            let address = user.address
            resolve(address)
        })
    },
    //Add new address
    addNewAddress: (details) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(details.User) })
            details._id = objectId()
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
    //Getting addresses for editing address with address id and user id
    getSingleAddress: (Id, uId) => {
        return new Promise(async (resolve, reject) => {
            let address = await db.get().collection(collection.USER_COLLECTION).aggregate([
                {
                    $match: {
                        _id: objectId(uId)
                    }
                },
                {
                    $unwind: "$address"
                },
                {
                    $match: {
                        "address._id": objectId(Id)
                    }
                },
                {
                    $project: {
                        address: 1,
                        _id: 0
                    }
                }
            ]).toArray()
            resolve(address)
        })
    },
    //edit address
    editAddress: (newData) => {
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
            })
        })
    },
    //Deleting address
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
                })
            }
        })
    },
    //Change password in user profile
    changePassword: (Id, data) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let p1 = data.password1
            let p2 = data.password2
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(Id) })
            if (user) {
                data1 = await bcrypt.hash(data.password1, 10)
                bcrypt.compare(data.current, user.password).then((status) => {
                    if (status) {
                        response.status = true
                        db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(Id) }, {
                            $set: {
                                password: data1
                            }
                        }).then(() => {
                            resolve(response)
                        })
                    } else {
                        response.status = false
                        resolve(response)
                        console.log("current password is invalid");
                    }
                })
            }
        })
    },
    //User section ends...

    // Cart section Starting
    addToCart: (proId, userId) => {

        return new Promise(async (resolve, reject) => {
            let price = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                {
                    $match: {
                        _id: objectId(proId)
                    }
                },
                {
                    $project: {
                        _id: 0,
                        price: 1
                    }
                }

            ]).toArray()
            let proObj = {
                item: objectId(proId),
                quantity: 1,
                subtotal: price[0].price
            }
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == proId)
                if (proExist != -1) {
                    resolve({ exist: true })
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
    //Get user cart products    
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
            resolve(cartItems)
        })
    },
    //Cart count for shoeing in header
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (cart) {
                count = cart.products.length
            }
            resolve(count)
        })
    },
    //Change quantity in user cart
    changeProductQuantity: (details) => {
        let cartId = details.cart
        let proId = details.product
        let count = details.count
        let quantity = details.quantity
        count = parseInt(count)
        quantity = parseInt(quantity)
        return new Promise(async (resolve, reject) => {
            if (count == -1 && quantity == 1) {
                resolve({ lastProduct: true })
            } else {
                db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectId(cartId), 'products.item': objectId(proId) }, {
                    $inc: {
                        'products.$.quantity': count,
                    }
                }).then(async (response) => {

                    resolve({ status: true })

                })

            }
        })
    },
    //Delete single product from cart
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
    //Get cart product list to show in cart
    getCartProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            resolve(cart.products)
            console.log("cart products", cart.products);
        })
    },
    //Get sub totals of a single product in cart    
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
            if (subtotal.length > 0) {
                db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId), "products.item": objectId(proId) },
                    {
                        $set: {
                            'products.$.subtotal': subtotal[0].subtotal
                        }
                    }).then((response) => {
                        console.log(response);
                        resolve(subtotal[0].subtotal)
                    })
            }
            else {
                subtotal = 0
                resolve(subtotal)
            }
        })
    },
    //Get cart total 
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
                    resolve(total[0].total)
                } else {
                    console.log('no products');
                    let total = [{ total: 0 }]
                    resolve(total[0].total)
                }
            } else {
                console.log("No cart");
                resolve()
            }
        }).catch((err) => {
            resolve(err)
        })
    },
    //Cart ends...

    //Wishlist section starts here
    addToWishlist: (proId, userId) => {
        let wishObj = {
            item: objectId(proId)
        }
        return new Promise(async (resolve, reject) => {
            let userWish = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: objectId(userId) })
            if (userWish) {
                let proExist = await userWish.products.findIndex(product => product.item == proId)
                if (proExist != -1) {
                    db.get().collection(collection.WISHLIST_COLLECTION).updateOne({ user: objectId(userId) },
                        {
                            $pull: {
                                products: { item: objectId(proId) }
                            }
                        }).then((response) => {
                            console.log("pulled");
                            resolve({ pulled: true })
                        })
                } else {
                    db.get().collection(collection.WISHLIST_COLLECTION).updateOne({ user: objectId(userId) },
                        {
                            $push: {
                                products: wishObj
                            }
                        }).then(() => {
                            console.log("pushed");
                            resolve({ pushed: true })
                        })
                }
            } else {
                let wish = {
                    user: objectId(userId),
                    products: [wishObj]
                }
                db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wish).then((reponse) => {
                    resolve(response)
                    console.log(" Craeted new wishlist");
                })
            }
        })
    },
    //Get wishlist products for show in wishlist
    getWishlistProducts: (user) => {
        return new Promise(async (resolve, reject) => {
            let wishProducts = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                {
                    $match: {
                        user: objectId(user)
                    }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item'
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
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ]).toArray()
            resolve(wishProducts)
        })
    },
    deleteWishlistProduct: (user, proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.WISHLIST_COLLECTION).updateOne({ user: objectId(user) },
                {
                    $pull: {
                        products: { item: objectId(proId) }
                    }
                }).then((response) => {
                    console.log("pulled");
                    resolve({ pulled: true })
                })
        })
    },
    //Buy Now section
    getBuyNowProduct: (proId) => {
        return new Promise(async (resolve, reject) => {
            let pro=await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)})
            let proObj = {
                item: objectId(proId),
                quantity: 1,
                subtotal:pro.price 
            }
            let product = [proObj]
            resolve(product)
        })
    },
    getBuyNowProductDetails: (pId) => {
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(pId) })
            resolve(product)
        })
    },
    getBuyNowTotal: (pId) => {
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(pId) })
            console.log(product.price);
            resolve(product.price)
        })
    },
    //Order section starting
    //place order
    placeOrder: (order, products, total) => {
        return new Promise((resolve, reject) => {
            let coupon = order.Coupon
            if (order.buyNow) {
                order.buyNow = true
            } else {
                order.buyNow = false
            }
            order.User = objectId(order.User)
            //To get today date
            let dateIso = new Date()
            let date = moment(dateIso).format('YYYY/MM/DD')
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
                Coupon: coupon,
                Discount: order.Discount,
                DateISO: dateIso,
                Date: date,
                Time: time,
                buyNow: order.buyNow,
                Status: "Placed"
            }
            let user = order.User
            user=user.toString() 
            db.get().collection(collection.COUPON_COLLECTION).updateOne({ Coupon: coupon },
                {
                    $push: {
                        Users: user
                    }
                }).then(() => {
                    console.log("user pushed to coupon collection array");
                    db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                        console.log("order inserted");
                        resolve(response)
                    })
                })
        })
    },
    //For clear cart after placing order
    clearCart: (User) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectId(User) }).then(() => {
                resolve()
            })
        })
    },
    //Decrese stock after order

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
    //Razor pay section
    //generate razor pay order
    generateRazorpay: (orderId, total) => {
        return new Promise((resolve, reject) => {
            var options = {
                amount: total * 100,
                currency: "INR",
                receipt: orderId.toString()
            };
            instance.orders.create(options, (err, order) => {
                if (err) {
                } else {
                    resolve(order)
                }
            })
        })
    },
    //Verify razorpay payment
    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            console.log("Details=", details);
            const crypto = require('crypto')
            let hmac = crypto.createHmac('sha256', process.env.key_secret)
            hmac.update(details['response[razorpay_order_id]'] + '|' + details['response[razorpay_payment_id]']);
            hmac = hmac.digest('hex')
            if (hmac == details['response[razorpay_signature]']) {
                console.log("hmac matched");
                resolve()
            } else {
                console.log("hmac reject");
                reject()
            }
        })
    },
    //Change payment status after payment verify
    changePaymentStatus: (oId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(oId) },
                {
                    $set: {
                        Status: "Placed"
                    }
                }).then(() => {
                    resolve()
                })
        })
    },
    getOrderDetails: (id) => {
        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: objectId(id) })
            resolve(order)
            console.log(order);
        })
    },
    //Get user order with user id for my order section
    getUserOrders: (Id) => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({ User: objectId(Id) }).sort({ $natural: -1 }).toArray()
            resolve(orders)
        })
    },
    //Cancel order by user
    cancelOrder: (Id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(Id) },
                {
                    $set: {
                        Status: 'Cancelled',
                        Cancelled: true
                    }
                }).then(() => {
                    resolve()
                })
        })
    },

    //Validate coupon in checkout page
    couponValidate: (data, user) => {
        return new Promise(async (resolve, reject) => {
            obj = {}
            let date = new Date()
            date = moment(date).format('DD/MM/YYYY')
            let coupon = await db.get().collection(collection.COUPON_COLLECTION).findOne({ Coupon: data.Coupon, Available: true })
            if (coupon) {
                let users = coupon.Users
                let userChecker = users.includes(user)
                if (userChecker) {
                    obj.couponUsed = true
                    console.log("Already used");
                    resolve(obj)
                } else {
                    if (date <= coupon.Expiry) {
                        let total = parseInt(data.Total)
                        let percentage = parseInt(coupon.Offer)
                        let discountVal = ((total * percentage) / 100).toFixed()
                        obj.total = total - discountVal
                        obj.success = true
                        resolve(obj)
                    } else {
                        obj.couponExpired = true
                        console.log("Expired");
                        resolve(obj)
                    }
                }
            } else {
                obj.invalidCoupon = true
                console.log("invalid");
                resolve(obj)
            }
        })
    },
    //Get brands and products for user header
    getBrands: () => {
        return new Promise(async (resolve, reject) => {
            let brands = await db.get().collection(collection.BRAND_COLLECTION).find().sort({ $natural: -1 }).limit(6).toArray()
            resolve(brands)
        })
    },
    getHomeProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().sort({ $natural: -1 }).limit(4).toArray()

            resolve(products)
        })
    },
    getHomeCategories: () => {
        return new Promise(async (resolve, reject) => {
            let category = await db.get().collection(collection.CATEGORY_COLLECTION).find().limit(6).toArray()
            resolve(category)
        })
    },
    //All products
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    //Get products by product Name
    getProductsByName: (name) => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ name: name })
            resolve(products)
        })
    },
    //By Brands
    getProductsByBrand: (name) => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({ brand: name }).toArray()
            resolve(products)
        })
    },
    //By category
    getProductsByCateogry: (cat) => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({ category: cat }).toArray()
            resolve(products)
        })
    },
    //Get banners from banner collection
    getAllBanners: () => {
        return new Promise(async (resolve, reject) => {
            let banners = await db.get().collection(collection.BANNER_COLLECTION).find().toArray()
            resolve(banners)
        })
    }
}