import mongoose, { Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

interface CachedMongoConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Use globalThis.mongoose
let cached: CachedMongoConnection = globalThis.mongoose;

if (!cached) {
  cached = globalThis.mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<Mongoose> {
  if (cached.conn) {
    console.log("Using existing connection");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("Creating new connection promise");
    const options: mongoose.ConnectOptions = {
      bufferCommands: false, // Disables buffering of commands
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, options)
      .then((mongoose) => {
        console.log("New connection established");
        return mongoose;
      })
      .catch((err) => {
        console.error("MongoDB connection error:", err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  console.log("Connection successful");
  return cached.conn;
}

export default dbConnect;
