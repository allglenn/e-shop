const expressJwt = require("express-jwt");

function authJwt() {
    const secret = process.env.JWT_SECRET;
    try {

        return [
            expressJwt(
            {
                secret,
                algorithms: ["HS256"]
            }
        ),function(err, req, res, next){
            res.status(err.status).json(err);
        }]
    } catch (e) {
        console.log(e);
    }

}

module.exports = authJwt;