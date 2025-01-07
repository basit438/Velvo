import { ansyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js";
import{uploadOnCloudinary} from "../utils/cloudinary.js";

const registerUser = ansyncHandler(async (req, res) => {

//    get details from the user 

const {fullname, username, email, password} =req.body

// console.log(email, password);

//validation


if([fullname, username, email, password].some((feild)=>  feild.trim().length === 0)){
    return res.status(400).json({
        success: false,
        message: "Please enter all fields"
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

const coverImageLocalPath = req.files?.coverImage[0].path;

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

export { registerUser };