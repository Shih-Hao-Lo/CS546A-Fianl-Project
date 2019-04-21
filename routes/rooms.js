const express = require("express");
const router = express.Router();
const rooms = require("../data/rooms");

// GET http://localhost:3000/rooms
router.get("/", async (req, res) => {
    try {
        const all_rooms = await rooms.getAll();
        res.render("posts/room", {rooms: all_rooms});
    } catch (e) {
        res.status(500);
        res.render("posts/room", {error: e});
    }
});

// GET http://localhost:3000/rooms/:id
router.get("/:id", async (req, res) => {
    const id = req.params.id;

    if (!id) {
        res.status(400).json({error: "No id provided"});
        return;
    }

    try {
        const room = await rooms.getbyid(id);
        res.render("posts/room", {room: room});
    } catch (e) {
        res.status(404);
        res.render("posts/room", {error: e});
    }
});

// POST http://localhost:3000/rooms
router.post("/", async (req, res) => {
    const price = req.body.price;

    let errors = [];
    if (!price) {
        errors.push("Please provide a price");
    }

    if (errors.length > 0) {
        res.status(400);
        res.render("posts/newroom", {
            errors: errors,
            hasErrors: true
        });
        return;
    }

    try {
        const newRoom = await rooms.addroom(price);
        res.render("posts/newroom", {room: newRoom});
    } catch (e) {
        res.status(500);
        res.render("posts/newroom", {errors: e, hasErrors: true});
    }
});

router.delete("/", async (req, res) => {
    const roomId = req.body.roomId;
    try {
        const status = await rooms.delroom(id);
        res.render("posts/room", {room: status});
    } catch (e) {
        return;
    }
});

module.exports = router;