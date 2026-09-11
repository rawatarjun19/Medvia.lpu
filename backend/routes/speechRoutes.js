const express = require("express");
const router = express.Router();
const { transcribe, synthesize } = require("../services/speechService");

router.post("/transcribe", async (req, res) => {
    try {
        res.json({ success: true, ...(await transcribe(req.body || {})) });
    } catch (error) {
        res.status(502).json({ success: false, message: "Speech recognition provider failed", error: error.message });
    }
});

router.post("/synthesize", async (req, res) => {
    try {
        res.json({ success: true, ...(await synthesize(req.body || {})) });
    } catch (error) {
        res.status(502).json({ success: false, message: "Speech synthesis provider failed", error: error.message });
    }
});

module.exports = router;