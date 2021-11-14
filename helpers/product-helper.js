var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt')
const objectId = require('mongodb').ObjectID
const userHelper = require('./user-helper')
const adminHelpers = require('./admin-helper')

module.exports = {

    addProduct: (proData) => {
        return new Promise((resolve, reject) => {
            console.log(proData);
            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(proData).then((response) => {
                resolve(response.insertedId.toString())
                
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
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(id) },
                {
                    $set: {
                        name: newData.name,
                        brand: newData.brand,
                        category: newData.category,
                        cost: newData.cost,
                        pricce: newData.price,
                        stock: newData.stock
                    }
                }).then((response) => {
                    resolve(response)
                })
        })
    },
    deleteProduct: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: objectId(id) }).then((response) => {
                resolve(response)
            })
        })
    }

}