import { ansyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js";
import{uploadOnCloudinary} from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";


// function to generate access and refresh token

const generateAccessAndRefreshTokens = async(UserId) => {
    
    try {
     const user = await User.findById(UserId);

     const accessToken = user.generateAccessToken();
     console.log("Access Token Payload:", jwt.decode(accessToken));

     const refreshToken = user.generateRefreshToken();
     user.refreshToken = refreshToken;
     await user.save({validateBeforeSave: false});

     return {accessToken, refreshToken};
    
    } catch (error) {
        res.status(500)
        .json({
            success: false,
            message: "Something went wrong while generating tokens"
        })
    }
}


// function to register a user


const registerUser = ansyncHandler(async (req, res) => {

//    get details from the user 

const {fullname, username, email, password, } =req.body

// console.log(email, password);
console.log(fullname, username, email, password);
//validation


if(!fullname || !username || !email || !password){
    return res.status(400).json({
        success: false,
        message: "Please fill all the fields"
    })
}




// check if user already exists

const existingUser = await User.findOne({
    $or: [
        {username},
        {email}
    ]
})

if(existingUser){
    return res.status(400).json({
        success: false,
        message: "User already exists"
    })
}


// create images and avatar

const avatarLocalPath =req.files?.avatar[0].path;

// const coverImageLocalPath = req.files?.coverImage[0].path;

let coverImageLocalPath;

if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverImageLocalPath = req.files.coverImage[0].path;
}

if(!avatarLocalPath ){
    return res.status(400).json({
        success: false,
        message: "Please upload avatar image"
    })
}

const avatar= await uploadOnCloudinary(avatarLocalPath);

const coverImage = await uploadOnCloudinary(coverImageLocalPath);

if(!avatar){
    return res.status(400).json({
        success: false,
        message: "Error uploading images"
    })
}


// create user

const user = await User.create({
    fullname,
    username : username.toLowerCase(),
    email,
    password,
    avatar : avatar.url,
    coverImage : coverImage?.url || "",
})

const createdUser = await User.findById(user._id).select("-password -refreshToken");

if(!createdUser){
    return res.status(400).json({
        success: false,
        message: "Error creating user"
    })
}

res.status(201).json({
    success: true,
    message: "User created successfully",
    data: createdUser,
})
});



// function to login a user
 
const loginUser = ansyncHandler(async(req, res) =>{

    //get details from the request body

    const {email , username , password} = req.body;

    console.log(email, username, password);



    // check if email or username is provided
    if(!(username || email)){
        return res.status(400)
        .json({
            success: false,
            message: "Please enter email or username"
        })
    }


    // check if user exists

    const user = await User.findOne({
        $or: [
            {email},
            {username}
        ]
    })


    //if the user does not exist then return error

    if(!user){
        return res.status(400)
        .json({
            success: false,
            message: "User not found"
        })
    }


    // check if password is correct

    const isPasswordValid = await user.isPasswordCorrect(password);

    //if the password is not correct then return error

    if (!isPasswordValid){
        return res.status(400)
        .json({
            success: false,
            message: "Incorrect user credentials"
        })
    }


    // generate access and refresh tokens

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken");

    //send token cookie and resonse to the client

    const options ={
        httpOnly : true,
        secure : true
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
        success: true,
        message: "User logged in successfully",
        data: loggedInUser , accessToken , refreshToken
    })
});


// function to logout a user

const logoutUser = ansyncHandler(async(req, res) =>{

    await User.findOneAndUpdate(
        req.user._id,
        {
            $set :{
                refreshToken : undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly : true,
        secure : true
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({
        success: true,
        message: "User logged out successfully"
    })
});

// funxtion to refresh access token

const refreshAccessToken = ansyncHandler(async(req, res) =>{

  const incommingRefreshToken =   req.cookies.refreshToken || req.body.refreshToken

  if(!incommingRefreshToken){
    res.status(401)
    .json({
        success : false,
        message : "unauthorized request",
    })
  }
    
 try {
      const decodedToken = jwt.verify(
           incommingRefreshToken,
           process.env.REFRESH_TOKEN_SECRET
       )
   
       const user = await User.findById(decodedToken?._id)
   
       if(!user){
           res.status(401)
           .json({
               success : false,
               message : "invalid refresh token"
           })
           
       }
   
       if(incommingRefreshToken !== user?.refreshToken){
           throw new Error(401 ,"Refresh token is expired or used");
           
       }
   
       //generate new token
   
       const options ={
           httpOnly : true,
           secure : true
       }
   
       const {accessToken , newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
   
       return res
       .status(401)
       .cookie("accessToken" , accessToken , options)
       .cookie("refreshToken" , newRefreshToken, options)
       .json({
           success : true,
           data : accessToken , refreshToken : newRefreshToken ,
           message : "Access token refreshed succesfully" 
       })
   
 } catch (error) {
    throw new Error(401 ,"error refreshing your token");
    
    
 }








});





















// export functions

export { registerUser,
        loginUser ,
        logoutUser, 
        refreshAccessToken
 };