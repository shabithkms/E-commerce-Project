var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt')
const objectId = require('mongodb').ObjectID
const userHelper = require('./user-helper')
const { Db } = require('mongodb')
var moment = require('moment')


module.exports = {
    //Admin login 
    doAdminLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            console.log(adminData);
            let admin=adminData.email 
            let password = adminData.password
            let loginStatus = false
            let response = {} 
            if (process.env.adminEmail===admin) {
                response.adminStatus = true
                if (process.env.adminPwd === password) {
                    console.log("Login success");
                    response.admin = admin
                    response.status = true
                    resolve(response)
                } else {
                    console.log("Login failed");
                    resolve({ status: false, adminStatus: true })
                }
            } else {
                console.log("failed");
                resolve({ adminStatus: false })
            }
        })
    },
    //get All users to show in admin page
    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            let users = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(users)
        })
    },
    //get all active users
    getActiveUsers: () => {
        return new Promise(async (resolve, reject) => {
            let activeUsers = await db.get().collection(collection.USER_COLLECTION).find({ status: true }).toArray()
            resolve(activeUsers)
        })
    },
    //To get all blocked users
    getBlockedUsers: () => {
        return new Promise(async (resolve, reject) => {
            let blockedUsers = await db.get().collection(collection.USER_COLLECTION).find({ status: false }).toArray()
            resolve(blockedUsers)
        })
    },
    //Getting user details with User ID
    getUserdetails: (Id) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(Id) })
            if (user) {
                resolve(user)
            } else {
                console.log("else");
                resolve(false)
            }
        })
    },
    //Block user by user Id
    blockUser: (Id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(Id) },
                {
                    $set: {
                        status: false
                    }
                }).then((response) => {
                    resolve(response)
                })
        })
    },
    //Unblock user by user Id
    unblockUser: (Id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(Id) },
                {
                    $set: {
                        status: true
                    }
                }).then((response) => {
                    resolve(response)
                })
        })
    },
    //Add product categories
    addCategory: (data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).insertOne(data).then((response) => {
                resolve(response)
            }).catch((err) => {
                reject(err)
            })
        })
    },
    //Get all category for show in admin page
    getAllCategory: () => {
        return new Promise(async (resolve, reject) => {
            let categories = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            resolve(categories)
        })
    },
    //Get category details with category Id
    getCategoryDetails: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).findOne({ _id: objectId(id) }).then((category) => {
                resolve(category)
            })
        })
    },
    //Edit category
    updateCategory: (id, newData) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ _id: objectId(id) },
                {
                    $set: {
                        category: newData.category
                    }
                }).then((response) => {
                    resolve(response)
                })
        })
    },
    //Delete category
    deleteCategory: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({ _id: objectId(id) }).then((response) => {
                resolve(response)
            })
        })
    },
    //Add brands with logo and details
    addBrands: (data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BRAND_COLLECTION).insertOne(data).then((response) => {
                resolve(response.insertedId.toString())
            }).catch((err) => {
                reject(err)
            })
        })
    },
    //Get all brands
    getAllBrands: () => {
        return new Promise(async (resolve, reject) => {
            let brands = await db.get().collection(collection.BRAND_COLLECTION).find().toArray()
            resolve(brands)
        })
    },
    //Get brand details with brand id
    getBrandDetails: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BRAND_COLLECTION).findOne({ _id: objectId(id) }).then((brand) => {
                resolve(brand)
            })
        })
    },
    //Edit brand
    updateBrand: (id, newData) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BRAND_COLLECTION).updateOne({ _id: objectId(id) },
                {
                    $set: {
                        brand: newData.brand,
                        description: newData.description
                    }
                }).then((response) => {
                    resolve(response)
                }).catch((err) => {
                    reject(err)
                })
        })
    },
    //delete brand
    deleteBrand: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BRAND_COLLECTION).deleteOne({ _id: objectId(id) }).then((response) => {
                resolve(response)
            })
        })
    },
    //get all orders
    getAllOrders: () => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find().sort({ $natural: -1 }).toArray()
            resolve(orders)
        })
    },
    //Get products of a specific order with order id
    getOrderProducts: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let orderItem = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
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
                        subtotal: { $multiply: [{ $arrayElemAt: ["$products.price", 0] }, "$quantity"] }
                    }
                }
            ]).toArray()
            resolve(orderItem)
        })
    },
    //Change order status by admin page by admin and Status passes from admin page
    changeOrderStatus: (orderId, stat) => {
        return new Promise((resolve, reject) => {
            console.log(stat, "in change");
            if (stat == "Delivered") {
                db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) }, {
                    $set: {
                        Status: stat,
                        Delivered: true
                    }
                }).then(() => {
                    resolve()
                })
            } else if (stat == "Cancelled") {
                db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) }, {
                    $set: {
                        Status: stat,
                        Cancelled: true
                    }
                }).then(() => {
                    resolve()
                })
            } else {
                db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) }, {
                    $set: {
                        Status: stat
                    }
                }).then(() => {
                    resolve()
                })
            }
        })
    },
    //Banner Managemment
    addBanner: (data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION).insertOne(data).then((response) => {
                resolve(response.insertedId.toString())
            }).catch((err) => {
                reject(err)
            })
        })
    },
    getBannerDetails: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION).findOne({ _id: objectId(id) }).then((banner) => {
                resolve(banner)
            })
        })
    },
    updateBanner: (id, newData) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION).updateOne({ _id: objectId(id) },
                {
                    $set: {
                        bannerName: newData.bannerName,
                        description: newData.description,
                        offer: newData.offer,
                        link: newData.link
                    }
                }).then((response) => {
                    resolve(response)
                }).catch((err) => {
                    reject(err)
                })
        })
    },
    deleteBanner: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION).deleteOne({ _id: objectId(id) }).then((response) => {
                resolve(response)
            })
        })
    },
    //Offer section
    // Category offers
    addCategoryOffer: (data) => {
        let cname = data.Category
        data.Offer = parseInt(data.Offer)
        return new Promise(async (resolve, reject) => {
            data.startDateIso= new Date(data.Starting)
            data.endDateIso= new Date(data.Expiry)
            db.get().collection(collection.CATEGORY_OFFERS).insertOne(data).then(async () => {
                let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({ category: data.Category, catOffer: { $exists: false } }).toArray()
                await products.map(async (product) => {
                    let actualPrice = product.price
                    let newPrice = (((product.price) * (data.Offer)) / 100)
                    newPrice = newPrice.toFixed()
                    db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(product._id) },
                        {
                            $set: {
                                actualPrice: actualPrice,
                                price: (actualPrice - newPrice),
                                catOffer: true,
                                catPercentage: data.Offer
                            }
                        })
                })
                resolve()
            }).catch((err) => {
                reject(err)
            })
        })
    },
    getAllCatOffers: () => {
        return new Promise(async (resolve, reject) => {
            let categoryOffer = await db.get().collection(collection.CATEGORY_OFFERS).find().toArray()
            resolve(categoryOffer)
        })
    },
    getCatOfferDetails: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_OFFERS).findOne({ _id: objectId(id) }).then((offer) => {
                resolve(offer)
            })
        })
    },
    updateCatOffer: (id, newData) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_OFFERS).updateOne({ _id: objectId(id) },
                {
                    $set: {
                        Category: newData.Category,
                        Starting: newData.Starting,
                        Expiry: newData.Expiry,
                        Offer: newData.Offer
                    }
                }).then((response) => {
                    resolve(response)
                }).catch((err) => {
                    reject(err)
                })
        })
    },
    deleteCatOffer: (id) => {
        return new Promise(async (resolve, reject) => {
            let categoryOffer = await db.get().collection(collection.CATEGORY_OFFERS).findOne({ _id: objectId(id) })
            let cname = categoryOffer.Category
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ category: cname })
            if (product) {
                db.get().collection(collection.CATEGORY_OFFERS).deleteOne({ _id: objectId(id) }).then(() => {
                    db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ category: cname },
                        {
                            $set: {
                                price: product.actualPrice
                            },
                            $unset: {
                                catOffer: "",
                                catPercentage: "",

                                actualPrice: ""
                            }
                        }).then(() => {
                            resolve()
                        })
                })
            } else {
                resolve()
            }
        }) 
    },
    //Product offers
    addProductOffer: (data) => {
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ name: data.Product })
            data.Offer = parseInt(data.Offer)
            let actualPrice = product.price
            let newPrice = (((product.price) * (data.Offer)) / 100)
            newPrice = newPrice.toFixed()
            data.startDateIso= new Date(data.Starting)
            data.endDateIso= new Date(data.Expiry)
            db.get().collection(collection.PRODUCT_OFFERS).insertOne(data).then((response) => {
                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ name: data.Product },
                    {
                        $set: {
                            proOffer: true,
                            proPercentage: data.Offer,
                            price: (actualPrice - newPrice),
                            actualPrice: actualPrice
                        }
                    }).then(() => {
                        resolve()
                    })
            }).catch((err) => {
                reject(err)
            })
        })
    },
    getAllProOffers: () => {
        return new Promise(async (resolve, reject) => {
            let productOffer = await db.get().collection(collection.PRODUCT_OFFERS).find().toArray()
            resolve(productOffer)
        })
    },
    getProOffersDetails: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_OFFERS).findOne({ _id: objectId(id) }).then((proOffer) => {
                resolve(proOffer)
            })
        })
    },
    updateProOffer: (id, newData) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_OFFERS).updateOne({ _id: objectId(id) },
                {
                    $set: {
                        Product: newData.Product,
                        Starting: newData.Starting,
                        Expiry: newData.Expiry,
                        Offer: newData.Offer
                    }
                }).then((response) => {
                    resolve(response)
                }).catch((err) => {
                    reject(err)
                })
        })
    },
    deleteProOffer: (id) => {
        return new Promise(async (resolve, reject) => {
            let productOffer = await db.get().collection(collection.PRODUCT_OFFERS).findOne({ _id: objectId(id) })
            let pname = productOffer.Product
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ name: pname })
            db.get().collection(collection.PRODUCT_OFFERS).deleteOne({ _id: objectId(id) }).then(() => {
                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ name: pname },
                    {
                        $set: {
                            price: product.actualPrice
                        },
                        $unset: {
                            proOffer: "",
                            proPercentage: "",
                            actualPrice: ""
                        }
                    }).then(() => {
                        resolve()
                    })
            })
        })
    },
    getAllCoupons: () => {
        return new Promise(async (resolve, reject) => {
            let coupons = await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
            resolve(coupons)
        })
    },
    //Coupons secction
    addCoupon: (data) => {
        return new Promise(async (resolve, reject) => {
            let expiry = await moment(data.Expiry).format('DD/MM/YYYY')
            let starting = await moment(data.Starting).format('DD/MM/YYYY')
            let dataobj = await {
                Coupon: data.Coupon,
                Offer: parseInt(data.Offer),
                Status: 1,
                Starting: starting,
                Expiry: expiry,
                Users: []
            }
            db.get().collection(collection.COUPON_COLLECTION).insertOne(dataobj).then(() => {
                resolve()
            }).catch((err) => {
                reject(err)
            })
        })
    },
    getCouponDetails: (cId) => {
        return new Promise(async (resolve, reject) => {
            let coupon = await db.get().collection(collection.COUPON_COLLECTION).findOne({ _id: objectId(cId) })
            resolve(coupon)
        })
    },
    updtaeCoupon: (id, newData) => {
        return new Promise((resolve, reject) => {
            console.log(newData);
            db.get().collection(collection.COUPON_COLLECTION).updateOne({ _id: objectId(id) },
                {
                    $set: {
                        Coupon: newData.Coupon,
                        Starting: newData.Starting,
                        Expiry: newData.Expiry,
                        Offer: newData.Offer
                    }
                }).then(() => {
                    resolve()
                })

        })
    },
    deleteCoupon: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COUPON_COLLECTION).deleteOne({ _id: objectId(id) }).then(() => {
                resolve()
            })
        })
    },
    //Report section
    //Default monthly report
    monthlyReport: () => {
        return new Promise(async (resolve, reject) => {
            let today = new Date()
            let end = moment(today).format('YYYY/MM/DD')
            let start = moment(end).subtract(30, 'days').format('YYYY/MM/DD')
            let orderSuccess = await db.get().collection(collection.ORDER_COLLECTION).find({ Date: { $gte: start, $lte: end }, Status: { $nin: ['Cancelled'] } }).sort({ Date: -1, Time: -1 }).toArray()
            let orderTotal = await db.get().collection(collection.ORDER_COLLECTION).find({ Date: { $gte: start, $lte: end } }).toArray()
            let orderSuccessLength = orderSuccess.length
            let orderTotalLength = orderTotal.length
            let orderFailLength = orderTotalLength - orderSuccessLength
            let total = 0
            let discountAmt = 0
            let discount = 0
            let online = 0
            let cod = 0
            let paypal = 0
            for (let i = 0; i < orderSuccessLength; i++) {
                total = total + orderSuccess[i].Total
                if (orderSuccess[i].PaymentMethod == 'COD') {
                    cod++
                } else if (orderSuccess[i].PaymentMethod == 'Paypal') {
                    paypal++
                } else {
                    online++
                }
                if (orderSuccess[i].Discount) {
                    discountAmt = discountAmt + parseInt(orderSuccess[i].Discount)
                    discount++
                }
            }
            var data = {
                start: start,
                end: end,
                totalOrders: orderTotalLength,
                successOrders: orderSuccessLength,
                failOrders: orderFailLength,
                totalSales: total,
                cod: cod,
                paypal: paypal,
                online: online,
                discount: discountAmt,
                currentOrders: orderSuccess
            }
            resolve(data)
        })
    },
    //Report by submitted dates from admin
    salesReport: (dates) => {
        return new Promise(async (resolve, reject) => {
            console.log("dates", dates);
            let start = moment(dates.StartDate).format('YYYY/MM/DD')
            let end = moment(dates.EndDate).format('YYYY/MM/DD')
            let orderSuccess = await db.get().collection(collection.ORDER_COLLECTION).find({ Date: { $gte: start, $lte: end }, Status: { $nin: ['Cancelled', 'pending'] } }).sort({ Date: -1, Time: -1 }).toArray()
            let orderTotal = await db.get().collection(collection.ORDER_COLLECTION).find({ Date: { $gte: start, $lte: end } }).toArray()
            let orderSuccessLength = orderSuccess.length
            let orderTotalLength = orderTotal.length
            let orderFailLength = orderTotalLength - orderSuccessLength
            let total = 0
            let discountAmt = 0
            let discount = 0
            let online = 0
            let cod = 0
            let paypal = 0
            let noData = false
            for (let i = 0; i < orderSuccessLength; i++) {
                total = total + orderSuccess[i].Total
                if (orderSuccess[i].PaymentMethod == 'COD') {
                    cod++
                } else if (orderSuccess[i].PaymentMethod == 'Paypal') {
                    paypal++
                } else {
                    online++
                }
                if (orderSuccess[i].Discount) {
                    discountAmt = discountAmt + parseInt(orderSuccess[i].Discount)
                    discount++
                }
            }
            if (orderSuccess.length == 0) {
                noData = true
            }
            var data = {
                start: start,
                end: end,
                totalOrders: orderTotalLength,
                successOrders: orderSuccessLength,
                failOrders: orderFailLength,
                totalSales: total,
                cod: cod,
                paypal: paypal,
                online: online,
                discount: discountAmt,
                currentOrders: orderSuccess,
                noData: noData
            }
            resolve(data)
        })
    },

}