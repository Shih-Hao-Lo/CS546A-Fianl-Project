const express = require("express");
const router = express.Router();
var fs = require('fs');

router.get("/", async (req, res) =>
{
    try
    {
        fs.readFileSync('./people.json', 'utf8');
        res.render("home", { title: 'People Finder' });
    } catch (e)
    {
        res.render("home", { title: 'People Finder', error: "people.json not found" });
        return;
    }
});

module.exports = router;