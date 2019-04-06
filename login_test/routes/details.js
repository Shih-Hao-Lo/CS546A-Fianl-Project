const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var fs = require('fs');

router.get("/:id", expressJwt({
    secret: 'secret', getToken: (req) =>
    {
        console.log(req.cookies.token);
        if (req.cookies.token)
        {
            return req.cookies.token
        }
        else
        {
            return null;
        }
    }
}), async (req, res) =>
    {
        /*
        if (!req.cookies.token)
        {
            console.log("req.cookies.token");
            res.render("home", { title: "error", error: "You need to login" });
            return;
        }
        else
        {
            jwt.verify(req.cookies.token, "secret", (err, decode) =>
            {
                if (err)
                {
                    res.status(403).json({ message: "Wrong Token" });
                    return;
                }
                else
                {
                    //If decoded then call next() so that respective route is called.
                    req.decoded = decode;
                }
            });
        }
    */
        const personID = req.params.id;
        var obj;
        let data = fs.readFileSync('./people.json', 'utf8');
        obj = JSON.parse(data);

        if (personID > obj.length || personID < 1)
        {
            res.status(400);
            res.render("error", { title: "error", error: "People not found" });
            return;
        }

        for (let i = 0; i < obj.length; i++)
        {
            if (obj[i].id == personID)
            {
                res.render("details", { title: "Person Found", obj: obj[i] });
                res.status(200);
                return;
            }
        }
    });

router.get("/", async (req, res) =>
{
    res.status(400);
    res.render("error", { title: "error", error: "People # is needed to search for people in '/detail'" });
    return;
});

router.use(function (err, req, res, next)
{
    if (err.name === 'UnauthorizedError')
    {
        res.render("error", { title: "error", error: "Please relogin to continue" });
        return;
    }
});


module.exports = router;