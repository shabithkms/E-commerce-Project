const { mongoose, Schema } = require('mongoose')

const UserSchema = new Schema({
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    mobile: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    verified: {
        email: { type: Boolean, default: false },
        mobile: { type: Boolean, default: false },
    },
    active: {
        type: Boolean,
        default: true,
    }
})

module.exports = mongoose.model('User', UserSchema)
