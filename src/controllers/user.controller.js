import { asyncHandler } from "../utils/asyncHandler"

import { ApiError } from "../utils/ApiError"
import User from "../models/user.model"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"




const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res
    const {username, email, password, fullName} = req.body;

      if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }
    const existedUser = await User.findOne({$or: [{email}, {username}]});

    if(existedUser){
        throw new ApiError(400, "User already exists with this email or username")
    }
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath=req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar image is required")
    }
    const avatarUrl=await uploadOnCloudinary(avatarLocalPath);
    const coverImageUrl=await uploadOnCloudinary(coverImageLocalPath);
    if(!avatarUrl){
        throw new ApiError(500, "Failed to upload avatar image")
    }
    const user=await User.create({
        username:username.toLowerCase(),
        fullName,
        email,
        avatar:avatarUrl?.url,
        coverImage: coverImageUrl?.url || "",
        password

    });
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if(!createdUser){
        throw new ApiError(500, "Failed to create user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully"));

})
 