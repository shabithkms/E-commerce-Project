var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt')
const objectId = require('mongodb').ObjectID
const { response } = require('../app')

module.exports = {

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


    // Cart

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
                        product: { $arrayElemAt: ['$product', 0] }
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
                    { _id: objectId(proId) },
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
                    resolve(response)
                })
            }

        })
    }
}