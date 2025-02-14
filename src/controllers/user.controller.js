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


// function to change user password

const changeCurrentPassword = ansyncHandler(async(req, res) =>{

    const {oldPassword , newPassword} = req.body;

    const user = await User.findById(req.user._id)

      const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

      if(!isPasswordCorrect){
          return res.status(400)
          .json({
              success: false,
              message: "Incorrect old password"
          })
      }

      user.password = newPassword;
      await user.save({validateBeforeSave: false});

      return res.status(200)
      .json({
          success: true,
          message: "Password changed successfully"
      })
});


// get current user

const getCurrentUser = ansyncHandler(async(req, res) =>{
    return res.status(200)
    .json({
        success: true,
        data: req.user,
        message: "User fetched successfully"
    })
});


// update userAccount details

const updateUserAccount = ansyncHandler(async(req, res) =>{

    const { username , email} = req.body
    if( !username || !email){
        return res.status(400)
        .json({
            success: false,
            message: "Missing required fields"
        })
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                username,
                email
            }
        },
        {new: true}
    ).select("-password");

    return res.status(200)
    .json({
        success: true,
        data: user,
        message: "User account updated successfully"
    });


});


//function to update avatar file

const updateUserAvatar = ansyncHandler(async(req, res) =>{
    const avatarLocalPath = req.file?.path;

    if(!avatarLocalPath){
        return res.status(400)
        .json({
            success: false,
            message: "Missing required fields"
        })
    } 

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if(!avatar.url){
        return res.status(400)
        .json({
            success: false,
            message: "Something went wrong while uploading avatar"
        })
    }

      const user = await User.findByIdAndUpdate(
          req.user?._id,
          {
              $set: {
                  avatar : avatar.url
              }
          },
          {new: true}
      ).select("-password")

      return res.status(200)
      .json({
          success: true,
          data: user,
          message: "User avatar updated successfully"
      });

      



});


//function to update coverImage file


const updateCoverImage = ansyncHandler(async(req, res) =>{
    const coverImageLocalPath = req.file?.path;

    if(!coverImageLocalPath){
        return res.status(400)
        .json({
            success: false,
            message: "Missing required fields"
        })
    } 

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!coverImage.url){
        return res.status(400)
        .json({
            success: false,
            message: "Something went wrong while uploading Cover Image"
        })
    }

     const user = await User.findByIdAndUpdate(
          req.user?._id,
          {
              $set: {
                  coverImage : coverImage.url
              }
          },
          {new: true}
      ).select("-password")

      return res.status(200)
      .json({
          success: true,
          data: user,
          message: "User Cover Image updated successfully"
      });



});



// function to get channel details to show on prifile page on frontend 


const  getUserChannelProfile = ansyncHandler(async(req, res) =>{

const {username} = req.params;

if(!username?.trim){
    return res.status(400)
    .json({
        success: false,
        message: "Missing username"
    })
}

//
       const channel = await User.aggregate([
            {
                $match :{
                    username : username.toLowerCase()
                }
            },
            {
                $lookup :{
                    from: "subscriptions",
                    localField: "_id",
                    foreignField : "channel",
                    as :"subscribers"
                }
            },
            {
                $lookup :{
                    from: "subscriptions",
                    localField: "_id",
                    foreignField : "subscriber",
                    as :"subscribedTo"
                }
            },
            {
                $addFields :{
                    subscribersCount : {$size : "$subscribers"},
                    channelsSubscribedToCount : {$size : "$subscribedTo"},
                    isSubscribed : {
                        $cond : {
                            if :{ $in : [req.user?._id , "$subscribers.subscriber"]},
                            then : true,
                            else : false
                        }
                    }

                }
            },
            {
                $project :{
                    fullname : 1,
                    username : 1,
                    email : 1,
                    avatar : 1,
                    subscribersCount : 1,
                    channelsSubscribedToCount : 1,
                    isSubscribed : 1,
                    coverImage : 1
                }
            }


        ]);

        // console.log(channel)

        if(!channel?.length){
            res.status(400)
            .json({
                success : false,
                message: "channel doesn't exist"
            })
        }

        return res.status(200).json({
            success : true,
            data : channel[0],
            message : "user channel details fetched successfully"
        })



});

// get user watchHistory

const getWatchHistory = ansyncHandler(async(req, res) =>{
    const user = await User.aggregate([
        {
            $match :{
                _id :  new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup :{
                from : "videos",
                localField : "watchHistory",
                foreignField : "_id",
                as : "watchHistory",
                pipeline :[
                    {
                        $lookup :{
                            from : "users",
                            localField : "owner",
                            foreignField : "_id",
                            as : "owner",
                            pipeline :[
                                {
                                    $project :{
                                        fullname : 1,
                                        username : 1,
                                        avatar : 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields : {
                            owner : {
                                $first : "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res.status(200).json({
        success : true,
        data : user[0]?.watchHistory,
        message : "User watch history fetched successfully"
    })
})












// export functions

export { registerUser,
        loginUser ,
        logoutUser, 
        refreshAccessToken,
        changeCurrentPassword,
        getCurrentUser,
        updateUserAccount,
        updateUserAvatar,
        updateCoverImage,
        getUserChannelProfile

 };