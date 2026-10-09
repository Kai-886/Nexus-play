import mongoose from "mongoose"

// Cache the connection across warm serverless invocations (and across
// dev restarts within the same process). Stored on globalThis so each
// lambda instance reuses one connection.
const cached = globalThis.__mongooseCache ||
    (globalThis.__mongooseCache = { conn: null, promise: null });

export async function connectDatabase(){
    const mongoUri = process.env.MONGODB_URI;

    if(!mongoUri){
        throw new Error("MONGODB_URI is not defined");
    }


    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(mongoUri, {
            bufferCommands: false,
            serverSelectionTimeoutMS: 8000,
        }).then((m) => m);
    }

    try {
        cached.conn = await cached.promise;
        console.log(`MongoDB connected: ${cached.conn.connection.host}`);
        return cached.conn;
    }
    catch(err){
        cached.promise = null;
        // Never process.exit() here — it would kill serverless instances.
        // Local dev still stops via the catch block in server.js.
        throw new Error(`MongoDB connection failed: ${err.message}`);
    }
}