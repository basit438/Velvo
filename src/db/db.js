import mongoose from "mongoose";

import { DB_NAME } from "../constants.js";

export const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.log(error);
    }
};