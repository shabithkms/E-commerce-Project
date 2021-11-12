var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt')
const objectId = require('mongodb').ObjectID
const userHelper = require('./user-helper')

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
    addCategory: (data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).insertOne(data).then((response) => {
                // console.log(response);
                resolve(response)
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
                }).then((response)=>{
                    resolve(response)
                })
        })
    },
    deleteCategory:(id)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({_id:objectId(id)}).then((response)=>{
                resolve(response)
            })
        })
    },
    addBrands: (data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BRAND_COLLECTION).insertOne(data).then((response) => {
                resolve(response.insertedId.toString())
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
    getBrandDetails:(id)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.BRAND_COLLECTION).findOne({_id:objectId(id)}).then((brand)=>{
                resolve(brand)
                // console.log(brand);
            })
        })
    },
    updateBrand:(id,newData)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.BRAND_COLLECTION).updateOne({_id:objectId(id)},
            {
                $set:{
                    brand:newData.brand,
                    description:newData.description
                }
            }).then((response)=>{
                resolve(response)
            })
        })
    },
    deleteBrand:(id)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.BRAND_COLLECTION).deleteOne({_id:objectId(id)}).then((response)=>{
                resolve(response)
            })
        })
    },

}