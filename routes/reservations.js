const express = require("express");
const router = express.Router();
const reservations = require("../data/reservations");

// GET http://localhost:3000/reservations
router.get("/", async (req, res) => {
    try {
        const all_reservations = await reservations.getAll();
        res.render("posts/reservation", {reservations: all_reservations})
    } catch (e) {
        res.status(500);
        res.render("posts/reservation", {error: e});
    }
});

// GET http://localhost:3000/reservations/:id
router.get("/:id", async (req, res) => {
    const id = req.params.id;

    if (!id) {
        res.status(400).json({error: "No id provided"});
        return;
    }

    try {
        const reservation = await reservations.getbyid(id);
        res.render("posts/reservation", {reservation: reservation});
    } catch (e) {
        res.status(404);
        res.render("posts/reservation", {error: e});
    }
});

// POST https://localhost:3000/reservations
router.post("/", async (req, res) => {
    const pid = req.body.patientId;
    const did = req.body.doctorId;
    const date = req.body.date;

    let errors = [];

    if (!pid) {
        errors.push("Please provide a patient Id");
    }

    if (!did) {
        errors.push("Please provide a doctor Id");
    }

    if (!date) {
        errors.push("Please provide a date");
    }

    if (errors.length > 0) {
        res.status(400);
        res.render("posts/reservation", {
            errors: errors,
            hasErrors: true
        });
        return;
    }

    try {
        const reservation = await reservations.makereservation(pid, did, date);
        res.render("posts/reservation", {reservation: reservation});
    } catch (e) {
        res.status(500);
        res.render("posts/reservation", {errors: e, hasErrors: true});
    }
});

// DEL http://localhost:3000/reservations
router.delete("/", async(req, res) => {
    const reservationId = req.body.reservationId;
    try {
        const status = await reservations.delreservation(reservationId);
        res.render("posts/reservation", {reservation: status});
    } catch (e) {
        return;
    }
});

module.exports = router;