import dotenv from "dotenv";
import { connectDB } from "./db/db.js";

dotenv.config({
    path :"./.env"
});

connectDB().then(() => {
    console.log("Connected to MongoDB");
}).catch((error) => {
    console.log(error);
});