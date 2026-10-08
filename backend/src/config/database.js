import mongoose from "mongoose"

export async function connectDatabase(){
    const mongoUri = process.env.MONGODB_URI;

    if(!mongoUri){
        throw new Error("MONGODB_URI is not defined");
    }


    try{
        const connection = await mongoose.connect(mongoUri);
        console.log(`MongoDB connected: ${connection.connection.host}`);
    }
    catch(err){
        console.error(`MongoDB connection failed: ${err.message}`);
        process.exit(1);
    }
}