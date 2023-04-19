import Constant from '../constans.js';

const errorHandler = (err, req, res, next) => {
     const statusCode = res.statusCode ? res.statusCode : 50;

     switch(statusCode) {
        case Constant.VALIDATION_ERROR :
            res.json({
                title: "Validation failed",
                message: err.message,
                stackTrace: err.stack
            });
            break;
        
        case Constant.NOT_FOUND:
            res.json({
                title: "Not found",
                message: err.message,
                stackTrace: err.stack
            });
            break;
        
        case Constant.UNAUTHORIZED:
            res.json({
                title: "Forbidden",
                message: err.message,
                stackTrace: err.stack
            });
            break;
        
        case Constant.FORBIDDEN:
            res.json({
                title: "Forbidden",
                message: err.message,
                stackTrace: err.stack
            });
            break;
        
        case Constant.SERVER_ERROR:
            res.json({
                title: "Server Error",
                message: err.message,
                stackTrace: err.stack
            });
            break;
        
        default:
            console.log("Everything running fine.")
            break;
    };
};

export default errorHandler;