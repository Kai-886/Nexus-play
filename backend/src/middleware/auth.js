import User from "../models/user.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import catchAsyncErrors from "./catchAsyncErrors.js";
import jwt from 'jsonwebtoken'

export const isAuthenticatedUser = catchAsyncErrors(async(req,res,next) =>{
    const {token} = req.cookies;
    if(!token){
       return next(new ErrorHandler("Please login first to access resource",401));
    }
    
    const decodedData = jwt.verify(token,process.env.JWT_SECRET);


    // console.log(await User.findById(decodedData.id));

    req.user = await User.findById(decodedData.id);

    if (!req.user) {
        return next(new ErrorHandler("User no longer exits",401));
    }

    next(); 
})


export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new ErrorHandler(
                    `Role (${req.user.role}) is not allowed to access this resource`,
                    403
                )
            );
        }

        next();
    };
};