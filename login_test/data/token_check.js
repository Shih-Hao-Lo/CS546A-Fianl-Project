const expressJwt = require('express-jwt');

function verifyToken()
{
    let jwt = expressJwt({ secret: "secret", isRevoked: isRevokedCallback }).unless({
        path: ['/details/', '/', '/search']
    });
    return jwt;
}

async function isRevokedCallback(req, payload, done)
{

    /*
        // revoke token if user no longer exists
        if (!user)
        {
            return done(null, true);
        }
    */
console.log(req.cookies.token);
    if (!req.cookies.token)
    {
        
      //  res.render("home", { title: "error", error: "You need to login" });
        return done(null, true);
    }
    else
    {
        jwt.verify(req.cookies.token, "secret", (err, decode) =>
        {
            if (err)
            {
                res.status(403).json({ message: "Wrong Token" });
                return done(null, true);
            }
            else
            {
                //If decoded then call next() so that respective route is called.
                return done();
            }
        });
    }
};


module.exports = {
    verifyToken
};