// import { ansyncHandler } from "../utils/asyncHandler";
// import jwt from "jsonwebtoken";
// import User from "../models/user.model";
// export const verifyJWT = ansyncHandler(async (req, res, next) => {

//     // check if user is logged in

// try {
//         const token = req.cookies?.accessToken ||
//          req.header("Authorization")?.replace("Bearer ", "");
    
    
//         if(!token){
//             return res.status(401).json({
//                 success: false,
//                 message: "User not logged in"
//             })
//         }
    
//        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, )
    
//        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    
//        if(!user){
//         return res.status(401).json({
//             success: false,
//             message: "User not logged in"
//         })
//        }
    
//        req.user = user;
    
//        next();
// } catch (error) {
//     res.status(401).json({
//         success: false,
//         message: "User not logged in"
//     })
// }
// });