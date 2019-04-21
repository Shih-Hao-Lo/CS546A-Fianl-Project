const express = require("express");
const router = express.Router();
const meds = require("../data/doctors");

// GET http://localhost:3000/medicines
router.get("/", async (req, res) => {
    try {
        const all_meds = await meds.getAll();
        res.render("posts/medicines", {medicines: all_meds});
    } catch (e) {
        res.status(500);
        res.render("posts/medicine", {error: e});
    }
});

// GET http://localhost:3000/medicines/:id
router.get("/:id", async (req, res) => {
    const id = req.params.id;

    if (!id) {
        res.status(400).json({error: "No id provided"});
        return;
    }

    try {
        const medicine = await meds.getbyid(id);
        res.render("posts/medicine", {medicine: medicine});
    } catch (e) {
        res.status(404);
        res.render("posts/medicine", {error: e});
    }
});

// POST https://localhost:3000/medicines
router.post("/", async (req, res) => {
    const name = req.body.name;
    const price = req.body.price;

    let errors = [];

    if (!name) {
        errors.push("Please provide a name");
    }

    if (!price) {
        errors.push("Please provide a price");
    }

    if (errors.length > 0) {
        res.status(400);
        res.render("posts/newmedicine", {
            errors: errors,
            hasErrors: true
        });
        return;
    }

    try {
        const newMed = await meds.addmedicine(name, price);
        res.render("posts/newmedicine", {newMedicine: newMed});
    } catch (e) {
        res.status(500);
        res.render("posts/newMedicine", {errors: e, hasErrors: true});
    }
});

// DEL http://localhost:3000/medicines
router.delete("/", async(req, res) => {
    const medId = req.body.medicineId;
    try {
        const status = await meds.delmedicine(medId);
        res.render("posts/medicine", {medicine: status});
    } catch (e) {
        return;
    }
});

module.exports = router;