var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt')
const objectId = require('mongodb').ObjectID
const userHelper = require('./user-helper')
const adminHelpers = require('./admin-helper')

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
            let products = db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
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
            if (prod.stockout||newData.stock>0) {
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
            let related = await db.get().collection(collection.PRODUCT_COLLECTION).find().sort().limit(limit).toArray()

            resolve(related)
        })

    },




    //Dashboard

    getNewOrders:()=>{
        return new Promise(async(resolve,reject)=>{
           let neworders=await db.get().collection(collection.ORDER_COLLECTION).find().sort({$natural:-1}).limit(5).toArray()
           resolve(neworders)
        })
    },
    getNewProducts:()=>{
        return new Promise(async(resolve,reject)=>{
           let newProducts=await db.get().collection(collection.PRODUCT_COLLECTION).find().sort({$natural:-1}).limit(5).toArray()
           resolve(newProducts)
        }) 
    },
    getTotalIncome:()=>{
        return new Promise(async (resolve,reject)=>{
            let total= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                   $match: {
                        Status:"Delivered" 
                    },    
                },
                {
                    $group: {
                        _id:null,
                        total: { $sum:  "$Total" }
                    }, 
                } 
            ]).toArray() 
            console.log(total);
            console.log(total[0].total);
            resolve(total[0].total)
        })
    },
    getTotalUsers:()=>{
        return new Promise(async(resolve,reject)=>{
          let users=await  db.get().collection(collection.USER_COLLECTION).count()
          console.log(users);
          resolve(users)
        })
    },
    getTotalProducts:()=>{
        return new Promise(async(resolve,reject)=>{
          let products=await  db.get().collection(collection.PRODUCT_COLLECTION).count() 
          console.log(products);
          
          resolve(products)
        })
    },
    getAllOrderStatus:()=>{
        return new Promise(async(resolve,reject)=>{
            let placedProducts=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                
                {
                    $unwind:"$Products"
                },
                {
                    $match:{
                        "Products.Status":"Placed"
                    }
                },

            ]).toArray()
            let len=placedProducts.length
            console.log(len);
            console.log("placed",placedProducts);
            resolve(len)
        })
    }

}