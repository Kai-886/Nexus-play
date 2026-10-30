import ErrorHandler from "../utils/ErrorHandler.js";

export default(err,req,res,next) =>{
    let error = {
        statusCode:err?.statusCode || 500,
        message:err?.message || "Internal Server Error"
    };


     // Invalid MongoDB ObjectId
    if (err.name === "CastError") {
       const message = `Resource not found. Invalid ${err.path}: ${err.value}`;
       error = new ErrorHandler(message,404);
    }

    // Handle Validation Error
    if(err.name ==="ValidationError"){ 
        const message = Object.values(err.errors).map((value)=>value.message)
        error = new ErrorHandler(message,400);
    }

    const payload = { message: error.message };

    // Raw error objects and stack traces are development aids only — sending
    // them to clients exposes internals (SMTP replies, absolute file paths).
    if (process.env.NODE_ENV !== "production") {
        payload.error = err;
        payload.stack = err?.stack;
    }

    res.status(error.statusCode).json(payload);
};