import mongoose from 'mongoose';
/**
 * Function to connect mongoDB using mongoose
 */
const connectDB = async () => {
    try {
        // connect to mongodb using the string and mongoose
        const connect = await mongoose.connect(process.env.DB_STRING);
        console.log("DB connection", connect.connection.host, connect.connection.name);
    } catch(err){
        console.log(err);
        process.exit(1);
    }
}

export default connectDB;