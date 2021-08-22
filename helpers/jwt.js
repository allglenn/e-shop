const expressJwt = require("express-jwt");

const authJwt = () => {
    const secret = process.env.JWT_SECRET;
    const api = process.env.API_URL;
    return expressJwt({
        secret,
        algorithms: ["HS256"],
        isRevoked: isRevoked
    }).unless({
        path: [
            {url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS']},
            {url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS']},
            {url: /\/public\/uploads(.*)/ , methods: ['GET', 'OPTIONS'] },
            `${api}/users/login`,
            `${api}/users/register`,
            `${api}/users/register`,
        ]
    })
}
const isRevoked = async (req, payload, done) => {
    if (!payload.isAdmin) {
        done(null, true)
    }
    done()
}
module.exports = authJwt;