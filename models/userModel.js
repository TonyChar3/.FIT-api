import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, "Enter a username"]
    },
    email: {
        type: String,
        required: [true, "Enter an email address"]
    },
    password: {
        type: String,
        required: [true, "Enter your password"]
    },
    admin: {
        type: Boolean
    },
    wishlist: [{
        _id: {
            type: String,
            required: true
        },
        prodct_name:{
            type: String,
            required: true
        },
        prodct_price: {
            type: String,
            required: true
        }
    }]
},
{
    timestamps: true
}
)

export default mongoose.model("User", userSchema);