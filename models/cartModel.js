import mongoose from 'mongoose';

const CartModel = mongoose.Schema({

    _id: {
        type: String,
        required: true
    },
    products: [{
        _id: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        qty: {
            type: Number,
            required: true
        },
        price: {
            type: String,
            required: true
        }
    }]
})

export default mongoose.model("Cart", CartModel);