const express = require("express");
const router = express.Router();
const patients = require("../data/patient");

// GET http://localhost:3000/patients
router.get("/", async (req, res) => {
    try {
        const patients = patients.getAll();
        res.render("posts/patient", {patients: patients});
    } catch (e) {
        res.status(500);
        res.render("posts/patient", {error: e});
    }
});

// GET http://localhost:3000/patients/:id
router.get("/:id", async (req, res) => {
    const id = req.params.id;

    if (!id) {
        res.status(400).json({error: "No id provided"});
        return;
    }

    try {
        const patient = await patients.getbyid(id);
        res.render("posts/patient", {patient: patient});
    } catch (e) {
        res.status(404);
        res.render("posts/patient", {error: e});
    }
});

// POST http://localhost:3000/patients
router.post("/", async (req, res) => {
    const name = req.body.name;
    const gender = req.body.gender;
    const dob = req.body.dob;
    const username = req.body.username;
    const password = req.body.password;

    let errors = [];

    if (!name) {
        errors.push("Please provide a name");
    }

    if (!gender) {
        errors.push("Please provide a gender");
    }

    if (!dob) {
        errors.push("Please provide a date of birth");
    }

    if (!username) {
        errors.push("Please provide a username");
    }

    if (!password) {
        errors.push("Please provide a password");
    }

    if (errors.length > 0) {
        res.status(400);
        res.render("posts/newpatient", {
            errors: errors,
            hasErrors: true
        });
        return;
    }

    try {
        const newPatient = await patients.addpatient(name, gender, dob, username, password);
        res.render("posts/newpatient", {
            newPatient: newPatient
        });
    } catch (e) {
        res.status(500);
        res.render("posts/newpatient", {
            errors: e,
            hasErrors: true
        });
    }
});

router.delete("/", async(req, res) => {
    const data = req.body.patientId;
    try {
        const status = await patients.delpatient(patientId);
        res.status(200);
        res.json(status);
        return;
    } catch (e) {
        return;
    }
});

module.exports = router;