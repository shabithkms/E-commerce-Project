const { mongoose, Schema } = require('mongoose')

const AdminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        dropDups: true,
    },
    password: {
        type: String,
        required: true,
    },
    active: {
        type: Boolean,
        default: true,
    }
})

module.exports = mongoose.model('Admin', AdminSchema)
