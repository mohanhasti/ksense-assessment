require('dotenv').config();
const express = require("express");
const axios = require("axios");
const app = express();
const port = 3000;

const API_URL = "https://assessment.ksensetech.com/api";
const API_KEY = process.env.API_KEY;
console.log(API_KEY);

app.get("/", (req, res) => {
    res.send("DemoMed Healthcare API");
});

app.get("/patients", async (req, res) => {
    try {
        const response = await axios.get(`${API_URL}/patients`, {
        headers: {
            "X-API-Key": API_KEY,
        },
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch patients" });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
