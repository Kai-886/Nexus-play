

export default (user,statusCode,res) =>{
    const token = user.getJwtToken();

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRES_TIME  * 24*60*60*1000 ),
        httpOnly:true,
    };

    // Never ship the password hash to the client (login/register/reset all
    // route through here, and some of those loads requested +password).
    const safeUser = typeof user.toObject === "function" ? user.toObject() : { ...user };
    delete safeUser.password;

    res.status(statusCode).cookie("token",token,cookieOptions).json({
        success:true,
        token,
        user: safeUser
    })

}