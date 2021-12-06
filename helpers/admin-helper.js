var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt')
const objectId = require('mongodb').ObjectID
const userHelper = require('./user-helper')
const { Db } = require('mongodb')
var moment=require('moment')

module.exports = {
    doAdminLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            console.log(adminData);
            let password = adminData.password
            let loginStatus = false
            let response = {}


            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ email: adminData.email })


            if (admin) {
                response.adminStatus = true
                if (admin.password === password) {
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
    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            let users = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(users)
        })
    },
    getActiveUsers: () => {
        return new Promise(async (resolve, reject) => {
            let activeUsers = await db.get().collection(collection.USER_COLLECTION).find({ status: true }).toArray()
            resolve(activeUsers)
        })

    },
    getBlockedUsers: () => {
        return new Promise(async (resolve, reject) => {
            let blockedUsers = await db.get().collection(collection.USER_COLLECTION).find({ status: false }).toArray()
            resolve(blockedUsers)
        })

    },
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
    blockUser: (Id, userData) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(Id) },
                {
                    $set: {
                        status: false
                    }
                }).then((response) => {
                    resolve(response)
                    console.log(response, "res");
                })
        })
    },
    unblockUser: (Id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(Id) },
                {
                    $set: {
                        status: true
                    }
                }).then((response) => {
                    resolve(response)
                    console.log(response, "res");
                })
        })
    },
    addCategory: (data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).insertOne(data).then((response) => {
                // console.log(response);
                resolve(response)
            }).catch((err) => {
                console.log(err, "admh");
                reject(err)
            })

        })
    },
    addSubCategory: (data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.SUBCATEGORY_COLLECTION).insertOne(data).then((response) => {
                // console.log(response);
                resolve(response)
            }).catch((err) => {

                reject(err)
            })

        })
    },
    getAllCategory: () => {
        return new Promise(async (resolve, reject) => {
            let categories = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            resolve(categories)
            // console.log(categories);


        })
    },
    getCategoryDetails: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).findOne({ _id: objectId(id) }).then((category) => {
                resolve(category)
            })
        })
    },
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
    deleteCategory: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({ _id: objectId(id) }).then((response) => {
                resolve(response)
            })
        })
    },
    addBrands: (data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BRAND_COLLECTION).insertOne(data).then((response) => {
                resolve(response.insertedId.toString())
            }).catch((err) => {
                reject(err)
                console.log(err);
            })
        })
    },
    getAllBrands: () => {
        return new Promise(async (resolve, reject) => {
            let brands = await db.get().collection(collection.BRAND_COLLECTION).find().toArray()

            resolve(brands)
            // console.log(brands, "b");
        })
    },
    getBrandDetails: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BRAND_COLLECTION).findOne({ _id: objectId(id) }).then((brand) => {
                resolve(brand)
                // console.log(brand);
            })
        })
    },
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
                    console.log(err);
                    reject(err)
                })
        })
    },
    deleteBrand: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BRAND_COLLECTION).deleteOne({ _id: objectId(id) }).then((response) => {
                resolve(response)
            })
        })
    },
    getAllOrders: () => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find().sort({ $natural: -1 }).toArray()
            resolve(orders)
        })
    },
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
            console.log(orderItem, "0");
            resolve(orderItem)
        })
    },
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
                console.log(err);
            })
        })
    },
    getBannerDetails: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION).findOne({ _id: objectId(id) }).then((banner) => {
                resolve(banner)
                // console.log(brand);
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
                    console.log(err);
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
    addCategoryOffer: (data) => {
        let cname = data.Category
        data.Offer = parseInt(data.Offer)
        return new Promise(async (resolve, reject) => {
            // let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ category: cname })
            // console.log(product.price);
            // console.log(data.Offer);
            // let actualPrice = product.price
            // let newPrice = (((product.price) * (data.Offer)) / 100)
            // newPrice = newPrice.toFixed()
            // console.log("newPrice", newPrice);
            // db.get().collection(collection.CATEGORY_OFFERS).insertOne(data).then((response) => {
            //     db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ category: cname },
            //         {
            //             $set: {
            //                 catOffer: true,
            //                 catPercentage: data.Offer,
            //                 price: (actualPrice - newPrice),
            //                 actualPrice: actualPrice
            //             }
            //         }).then(() => {
            //             resolve()
            //         })
            // })

            db.get().collection(collection.CATEGORY_OFFERS).insertOne(data).then(async () => {
                let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({ category: data.Category, catOffer: { $exists: false } }).toArray()
                console.log(products);
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
            let cOffer = await db.get().collection(collection.CATEGORY_OFFERS).find().toArray()
            resolve(cOffer)
        })
    },
    getCatOfferDetails: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_OFFERS).findOne({ _id: objectId(id) }).then((banner) => {
                resolve(banner)
                // console.log(brand);
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
                    console.log(err);
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
    addProductOffer: (data) => {
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ name: data.Product })
            console.log(product.price);
            console.log(data.Offer);
            data.Offer = parseInt(data.Offer)
            let actualPrice = product.price
            let newPrice = (((product.price) * (data.Offer)) / 100)
            newPrice = newPrice.toFixed()
            console.log("newPrice", newPrice);
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
            let pOffer = await db.get().collection(collection.PRODUCT_OFFERS).find().toArray()
            resolve(pOffer)
        })
    },
    getProOffersDetails: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_OFFERS).findOne({ _id: objectId(id) }).then((proOffer) => {
                resolve(proOffer)
                console.log(proOffer);
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
                    console.log(err);
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
    addCoupon: (data) => {
        return new Promise(async(resolve, reject) => {
            let expiry =await moment(data.Expiry).format('DD/MM/YYYY')
            let starting=await moment(data.Starting).format('DD/MM/YYYY')
            let dataobj=await {
                Coupon:data.Coupon,
                Offer:parseInt(data.Offer),
                Status:1,
                Starting:starting,
                Expiry:expiry

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
    }

}