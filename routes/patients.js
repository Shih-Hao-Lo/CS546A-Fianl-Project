const express = require("express");
const router = express.Router();
const data = require("../data");

router.get("/new" , async (req , res) =>{
    try{
        res.render("posts/newpatient" , {});
    }
    catch(e){
        res.status(400).json({ error: e });
    }
});

module.exports = router;