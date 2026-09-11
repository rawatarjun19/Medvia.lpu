const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "12mb" }));

const sessionRoutes = require("./routes/sessionRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const speechRoutes = require("./routes/speechRoutes");
const geminiRoutes = require("./routes/geminiRoutes");

app.use("/api/session", sessionRoutes);
app.use("/api", conversationRoutes);
app.use("/api/speech", speechRoutes);
app.use("/api/gemini", geminiRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Medvia Backend is running!"
    });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
