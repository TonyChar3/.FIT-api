import passport from "passport"

const isAdmin = (req,res,next) => {
    console.log(req.user)
    if(req.user.admin){
        next();
    }else{
        res.status(401);
        throw new Error("You are unauthorized to view this");
    }
}

export { isAdmin }