import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    userId: {
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
        price: {
            type: Number,
            required: true
        },
        qty: {
            type: Number,
            required: true
        }
    }],
    subtotal: {
        type: Number,
        required: true
    }
})