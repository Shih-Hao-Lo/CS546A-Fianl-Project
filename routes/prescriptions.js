const express = require("express");
const router = express.Router();
const rxs = require("../data/prescription");

// GET http://localhost:3000/prescriptions
router.get("/", async (req, res) => {
    try {
        const all_rxs = await rxs.getAll();
        res.render("posts/prescription", {prescriptions: all_rxs})
    } catch (e) {
        res.status(500);
        res.render("posts/prescription", {error: e});
    }
});

// GET http://localhost:3000/prescriptions/:id
router.get("/:id", async (req, res) => {
    const id = req.params.id;

    if (!id) {
        res.status(400).json({error: "No id provided"});
        return;
    }

    try {
        const rx = await rxs.getbyid(id);
        res.render("posts/prescription", {prescription: rx});
    } catch (e) {
        res.status(404);
        res.render("posts/prescription", {error: e});
    }
});

// POST https://localhost:3000/prescriptions
router.post("/", async (req, res) => {
    const pid = req.body.patientId;
    const did = req.body.doctorId;
    const medlist = req.body.medlist;
    const date = req.body.date;

    let errors = [];

    if (!pid) {
        errors.push("Please provide a patient Id");
    }

    if (!did) {
        errors.push("Please provide a doctor Id");
    }

    if (!medlist) {
        errors.push("Please provide a medication list");
    }

    if (!date) {
        errors.push("Please provide a date");
    }

    if (errors.length > 0) {
        res.status(400);
        res.render("posts/newprescription", {
            errors: errors,
            hasErrors: true
        });
        return;
    }

    try {
        const newPrescription = await rxs.addprescription(pid, did, medlist, date);
        res.render("posts/newprescription", {newPrescription: newPrescription});
    } catch (e) {
        res.status(500);
        res.render("posts/newprescription", {errors: e, hasErrors: true});
    }
});

// DEL http://localhost:3000/prescriptions
router.delete("/", async(req, res) => {
    const rxId = req.body.prescriptionId;
    try {
        const status = await rxs.delprescription(rxId);
        res.render("posts/prescription", {prescription: status});
    } catch (e) {
        return;
    }
});

module.exports = router;