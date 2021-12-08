var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt')
const objectId = require('mongodb').ObjectID
const userHelper = require('./user-helper')
const adminHelpers = require('./admin-helper')
const { response } = require('express')

module.exports = {

    addProduct: (proData) => {
        return new Promise((resolve, reject) => {
            console.log(proData, "1");
            proData.price = parseInt(proData.price)
            proData.cost = parseInt(proData.cost)
            proData.stock = parseInt(proData.stock)
            console.log(proData);
            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(proData).then((response) => {
                resolve(response.insertedId.toString())

            }).catch((err) => {
                reject(err)
            })
        })

    },
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = db.get().collection(collection.PRODUCT_COLLECTION).find().sort({ $natural: -1 }).toArray()
            resolve(products)
        })
    },
    getProductDetails: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(id) }).then((product) => {

                resolve(product)
            })
        })
    },
    updateProduct: (id, newData) => {
        newData.cost = parseInt(newData.cost)
        newData.price = parseInt(newData.price)
        newData.stock = parseInt(newData.stock)
        return new Promise(async (resolve, reject) => {
            let prod = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(id) })
            console.log(prod.stockout);
            if (prod.stockout || newData.stock > 0) {
                console.log("in if");
                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(id) },
                    {
                        $set: {
                            name: newData.name,
                            brand: newData.brand,
                            category: newData.category,
                            cost: newData.cost,
                            price: newData.price,
                            stock: newData.stock,

                        },
                        $unset: {
                            stockout: ""
                        }

                    }).then((response) => {
                        resolve(response)
                    })

            } else if (newData.stock === 0) {
                console.log("in else if");
                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(id) },
                    {
                        $set: {
                            name: newData.name,
                            brand: newData.brand,
                            category: newData.category,
                            cost: newData.cost,
                            price: newData.price,
                            stock: newData.stock,
                            stockout: true

                        }
                    }).then((response) => {
                        resolve(response)
                    })
            } else {
                console.log("in else");
                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(id) },
                    {
                        $set: {
                            name: newData.name,
                            brand: newData.brand,
                            category: newData.category,
                            cost: newData.cost,
                            price: newData.price,
                            stock: newData.stock,


                        }
                    }).then((response) => {
                        resolve(response)
                    })
            }


        })
    },
    deleteProduct: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: objectId(id) }).then((response) => {
                resolve(response)
            })
        })
    },
    getRelatedProducts: () => {
        return new Promise(async (resolve, reject) => {
            let sort = { name: 1 }
            let limit = 4
            let related = await db.get().collection(collection.PRODUCT_COLLECTION).find().sort({ $natural: -1 }).limit(limit).toArray()
            resolve(related)
        })

    },

    //Dashboard

    getNewOrders: () => {
        return new Promise(async (resolve, reject) => {
            let neworders = await db.get().collection(collection.ORDER_COLLECTION).find().sort({ $natural: -1 }).limit(5).toArray()
            resolve(neworders)
        })
    },
    getNewUsers: () => {
        return new Promise(async (resolve, reject) => {
            let newUsers = await db.get().collection(collection.USER_COLLECTION).find().sort({ $natural: -1 }).limit(5).toArray()
            resolve(newUsers)
        })
    },
    getNewProducts: () => {
        return new Promise(async (resolve, reject) => {
            let newProducts = await db.get().collection(collection.PRODUCT_COLLECTION).find().sort({ $natural: -1 }).limit(5).toArray()
            resolve(newProducts)
        })
    },
    getTotalIncome: () => {
        let Total = 0
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        Status: "Delivered"
                    },
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$Total" }
                    },
                }
            ]).toArray()

            if (total[0]) {
                console.log(total[0]);
                let newTotal = total[0].total

                console.log(total);
                console.log(total[0].total);
                resolve(total[0].total)
            } else {
                resolve(Total)
            }

        })
    },
    getTotalUsers: () => {
        return new Promise(async (resolve, reject) => {
            let users = await db.get().collection(collection.USER_COLLECTION).count()
            console.log(users);
            resolve(users)
        })
    },
    getTotalProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).count()
            console.log(products);

            resolve(products)
        })
    },
    getTotalOrders: () => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).count()
            console.log(orders);
            resolve(orders)
        })
    },
    getAllOrderStatus: () => {
        let orderStatus = []
        return new Promise(async (resolve, reject) => {


            let placedProducts = await db.get().collection(collection.ORDER_COLLECTION).aggregate([

                {
                    $match: {
                        Status: "Placed"
                    }
                }

            ]).toArray()
            let placedLen = placedProducts.length
            orderStatus.push(placedLen)

            let shippedProducts = await db.get().collection(collection.ORDER_COLLECTION).aggregate([

                {
                    $match: {
                        Status: "Shipped"
                    }
                }

            ]).toArray()
            let shippedLen = shippedProducts.length
            orderStatus.push(shippedLen)

            let deliveredProducts = await db.get().collection(collection.ORDER_COLLECTION).aggregate([

                {
                    $match: {
                        Status: "Delivered"
                    }
                }

            ]).toArray()
            let deliveredLen = deliveredProducts.length
            orderStatus.push(deliveredLen)

            let pendingProducts = await db.get().collection(collection.ORDER_COLLECTION).aggregate([

                {
                    $match: {
                        Status: "Cancelled"
                    }
                }

            ]).toArray()
            let pendingLen = pendingProducts.length
            orderStatus.push(pendingLen)

            console.log(orderStatus);
            resolve(orderStatus)

        })
    },
    getAllMethods: () => {
        let methods = []
        return new Promise(async (resolve, reject) => {
            let codProducts = await db.get().collection(collection.ORDER_COLLECTION).aggregate([

                {
                    $match: {
                        PaymentMethod: "COD"
                    }
                }

            ]).toArray()
            let codLen = codProducts.length
            methods.push(codLen)

            let razorpayProducts = await db.get().collection(collection.ORDER_COLLECTION).aggregate([

                {
                    $match: {
                        PaymentMethod: "Razorpay"
                    }
                }

            ]).toArray()
            let razorpayLen = razorpayProducts.length
            methods.push(razorpayLen)

            let paypalProducts = await db.get().collection(collection.ORDER_COLLECTION).aggregate([

                {
                    $match: {
                        PaymentMethod: "Paypal"
                    }
                }

            ]).toArray()
            let paypalLen = paypalProducts.length
            methods.push(paypalLen)
            // console.log(methods);
            resolve(methods)

        })
    },
    getTotalProfit: () => {
        return new Promise(async (resolve, reject) => {
            let profit = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $unwind: '$Products'
                },
                {
                    $project: {
                        item: '$Products.item',
                        quantity: '$Products.quantity',
                        Date:1

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
                        Date:1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $project: {
                        item: 1,
                        Date:1,
                        quantity: 1,
                        price: '$product.price',
                        cost: '$product.cost',
                    }
                },

                {
                    $group: {
                        _id: '$item',
                        revenue: { $sum: { $multiply: [{ '$toInt': '$quantity' }, { '$toInt': '$price' }] } },
                        landCost:{$sum:{$multiply:[{ '$toInt': '$quantity' }, { '$toInt': '$cost' }]}},
                    }
                },
                {
                    $project: {
                        _id:1,
                        revenue: 1,
                        landCost: 1,
                        
                    }
                }


            ]).toArray()
            console.log(profit);
            revenue=profit[0].revenue
            landCost=profit[0].landCost
            profit=revenue-landCost
            console.log(profit);
            resolve(profit)
        })
    },
    getDayWiseSale:()=>{
        return new Promise(async(resolve,reject)=>{
            let sales=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $unwind:'$Products'
                },
                {
                    
                }
            ]).toArray()
            console.log(getDayWiseSale);
        })
    }

}