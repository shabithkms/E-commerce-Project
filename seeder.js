require('dotenv').config()
const { default: mongoose } = require('mongoose')
const bcrypt = require('bcryptjs')
const Admin = require('./model/Admin')
const User = require('./model/User')

const runSeeder = async () => {
    // DB Connection
    await mongoose
        .connect(process.env.DB_CONNECTION, {
            dbName: `${process.env.DB_NAME}`,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => {
            console.log('DB Connected')
        })
    var db = mongoose.connection
    db.on('error', console.error.bind(console, 'MongoDB connection error:'))


    // Admin
    try {
        await Admin.collection.drop()
        const saltRounds = 10
        const salt = bcrypt.genSaltSync(saltRounds)

        await Admin.create({
            name: 'Muhammed Shabith K',
            email: 'admin@gmail.com',
            password: bcrypt.hashSync('password', salt),
        }).then(() => {
            console.log('✅ Admin Seeder')
        })
    } catch (error) {
        console.log(`❗️ Admin Seeder Error | ${error}`)
    }

    // User
    try {
        await User.collection.drop()
        const saltRounds = 10
        const salt = bcrypt.genSaltSync(saltRounds)

        await User.create({
            first_name: 'Muhammed',
            last_name: 'Shabith K',
            email: 'shabith@gmail.com',
            mobile: '7025259794',
            verified: {
                mobile: true
            },
            password: bcrypt.hashSync('password', salt),
        }).then(() => {
            console.log('✅ User Seeder')
        })
    } catch (error) {
        console.log(`❗️ User Seeder Error | ${error}`)
    }
    process.exit()
}

if (
    process.env.NODE_ENV !== 'Production' &&
    process.env.NODE_ENV !== 'Staging'
) {
    runSeeder()
} else {
    console.log(`❗️ Seeder will not run on Staging or Prodution enviornment`)
}
