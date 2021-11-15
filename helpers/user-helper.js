var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt')
const objectId = require('mongodb').ObjectID

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
            if(user){
                resolve(user)
                console.log(user,"grt");
            }else{
                console.log("else");
                resolve(false)
            }
        })
        

    },
    setPassword: (No, data,user) => {
        return new Promise(async (resolve, reject) => {

            
            console.log("user",user);
            data.password1 = await bcrypt.hash(data.password1, 10)
            let passwordNew = data.password1
            db.get().collection(collection.USER_COLLECTION).updateOne({ mobileNo: No },
                {
                    $set: {
                        firstname:user.firstname,
                        lastname:user.lastname,
                        email:user.email,
                        mobileNo:user.mobileNo,
                        password:passwordNew,
                        status:user.status

                    }
                }).then((response)=>{
                    resolve(response)
                })
        })
    }
}