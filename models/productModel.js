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
        path: {
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