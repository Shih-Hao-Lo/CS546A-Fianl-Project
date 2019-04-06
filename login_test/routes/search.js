const express = require("express");
const jwt = require('jsonwebtoken');
const router = express.Router();

router.post("/", async (req, res) =>
{

    let userName = req.body.userName;
    let userPWD = req.body.userPWD;

    if (!userName)
    {
        res.render("home", { title: 'People Finder', error: "data not complete" });
        return;
    }
    if (!userPWD)
    {
        res.render("home", { title: 'People Finder', error: "data not complete" });
        return;
    }

    if (userName == "1" && userPWD == "1")
    {
        const token = jwt.sign({ sub: 1 }, "secret", { expiresIn: '10000' });
        res.cookie('token', token);
        res.render("home", { title: 'People Finder', error: "login successful" });
        return;
    }
    else
    {
        res.render("home", { title: 'People Finder', error: "people not exist" });
        return;
    }
});

module.exports = router;