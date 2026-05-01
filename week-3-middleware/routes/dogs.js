const express = require("express");
const router = express.Router();
const dogs = require("../dogData.js");
const { ValidationError, NotFoundError } = require("../errors");

router.get("/dogs", (req, res) => {
	res.json(dogs);
});

router.post("/adopt", (req, res) => {
    const { name, email, dogName } = req.body;
    if (!name || !email || !dogName) {
        throw new ValidationError("Missing required fields");
    }

	const foundDog = dogs.find((d) => d.name === dogName);
	if (!foundDog || foundDog.status !== "available") {
		throw new NotFoundError("Dog not found or not available");
	}

    return res.status(201).json({
        message: `Adoption request received. We will contact you at ${email} for further details.`,
    });
});

router.get("/error", () => {
	throw new Error("Test error");
});

module.exports = router;
