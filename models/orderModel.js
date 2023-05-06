import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    stripeUID:{
        type: String,
        required: true
    },
    paymentIntentId: {
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
    },
    total: {
        type: Number,
        required: true
    },
    shipping: {
        type: Object,
        required: true
    },
    delivery_status: {
        type: String,
        default:"pending"
    },
    payment_status:{
        type: String,
        required: true
    }
},
{
    timestamps: true
});

export default mongoose.model("Order", orderSchema);