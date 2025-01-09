import { ansyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";


export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {

        // get token from cookie or authorization header
       const token = req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "")

        // check if token is present 

        if(!token) return res.status(401).json({
            success: false,
            message: "Unauthorized request"
        })

        // verify token

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        

        const user = await User.findById(decodedToken?._id).select("-password refreshToken");


        if(!user) return res.status(401).json({
            success: false,
            message: "invalid token"
        })


        req.user = user;
        next();

        
    } catch (error) {
        res.status(500)
        .json({
            success: false,
            message: "Something went wrong while verifying token"
        })
        
    }
})