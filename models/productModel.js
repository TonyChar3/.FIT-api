import mongoose from 'mongoose';

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    prix: {
        type: Number,
        required: true
    },
    stripe_ID: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    images: [{
        _id: {
            type: String,
            required: true
        },
        img_url: {
            type: String,
            required: true
        }
    }]
},
{
    timestamps: true
}
);

export default mongoose.model("Product", productSchema);