import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI || "mongodb+srv://ay065:ayushragh9065@ecommerce.g4fvfwx.mongodb.net/?retryWrites=true&w=majority";

let client;
let db;

const connectDB = async () => {
    try {
        client = new MongoClient(uri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        await client.connect();

        db = client.db("ecommerce");

        console.log("MongoDB Connected");

        return db;
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        process.exit(1);
    }
};

export default connectDB