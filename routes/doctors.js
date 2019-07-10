const express = require("express");
const router = express.Router();
const doctors = require("../data/doctors");

// GET http://localhost:3000/doctors
router.get("/", async (req, res) => {
    try {
        const all_doctors = await doctors.getAll();
        res.render("posts/doctor", {doctors: all_doctors})
    } catch (e) {
        res.status(500);
        res.render("posts/doctor", {error: e});
    }
});

// GET http://localhost:3000/doctors/:id
router.get("/:id", async (req, res) => {
    const id = req.params.id;

    if (!id) {
        res.status(400).json({error: "No id provided"});
        return;
    }

    try {
        const doctor = await doctors.getbyid(id);
        res.render("posts/doctor", {doctor: doctor});
    } catch (e) {
        res.status(404);
        res.render("posts/doctor", {error: e});
    }
});

// POST https://localhost:3000/doctors
router.post("/", async (req, res) => {
    const name = req.body.name;
    const username = req.body.username;
    const password = req.body.password;

    let errors = [];

    if (!name) {
        errors.push("Please provide a name");
    }

    if (!username) {
        errors.push("Please provide a username");
    }

    if (!password) {
        errors.push("Please provide a password");
    }

    if (errors.length > 0) {
        res.status(400);
        res.render("posts/newdoctor", {
            errors: errors,
            hasErrors: true
        });
        return;
    }

    try {
        const newDoctor = await doctors.adddoctor(name, username, password);
        res.render("posts/newdoctor", {newDoctor: newDoctor});
    } catch (e) {
        res.status(500);
        res.render("posts/newdoctor", {errors: e, hasErrors: true});
    }
});

// DEL http://localhost:3000/doctors
router.delete("/", async(req, res) => {
    const doctorId = req.body.doctorId;
    try {
        const status = await doctors.deldoctor(doctorId);
        res.render("posts/doctor", {doctor: status});
    } catch (e) {
        return;
    }
});

module.exports = router;