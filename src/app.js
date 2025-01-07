import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  express.json({
    limit: "1mb",
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    Credentials: true,
  })
);

app.use(express.static("public"));
app.use(cookieParser());


// import routes 

import userRouter from "./routes/user.route.js";

// routes declaration 

app.use("/api/v1/users", userRouter);

export { app };
