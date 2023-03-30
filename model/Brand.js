const { mongoose, Schema } = require('mongoose')

const BrandSchema = new mongoose.Schema(
    {
        name: {
            en: { type: String, required: true },
            ar: { type: String, required: true },
        },
        logo: {
            en: { type: Object, required: true },
            ar: { type: Object, required: true },
        },
        code: {
            type: String,
            required: true,
        },
        link: {
            type: String,
            default: '#',
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    }
)

module.exports = mongoose.model('Brand', BrandSchema)
