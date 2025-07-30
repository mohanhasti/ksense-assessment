require('dotenv').config();
const express = require("express");
const axios = require("axios");
const { fetchData } = require('./services/fetchData');
const { riskScorer } = require('./utils/riskScorer');
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

app.get("/all-patients", async (req, res) => {
    const data = require('./data.json');
    res.json(data);
});

app.get("/fetch-data", async (req, res) => {
    try {
        const data = await fetchData();
        console.log("patients data", data.length);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

app.get("/risk-scorer", async (req, res) => {
    try {
        // First try to get data from the API
        let data;
        try {
            data = await fetchData();
            console.log("data: risk-scorer from API", typeof data, data?.length);
        } catch (apiError) {
            console.log("API Call failed,", apiError.message);
        }
        
        if (!Array.isArray(data)) {
            console.error("Data is not an array:", typeof data, data);
            return res.status(500).json({ error: "Invalid data format" });
        }
        
        const {patients, highRiskPatients, feverPatients, dataQualityIssues } = riskScorer(data);
        const result = {highRiskPatients, feverPatients, dataQualityIssues };
        res.json(result);
    } catch (error) {
        console.error("Error in risk-scorer endpoint:", error);
        res.status(500).json({ error: "Failed to process risk scoring" });
    }
});

app.post("/submit-assessment", async (req, res) => {
    try {
        const data = await fetchData();
        if (!Array.isArray(data) || data.length === 0) {
            return res.status(500).json({ error: "No patient data available" });
        }
        const scores = riskScorer(data);
        const results = {
            high_risk_patients: scores.highRiskPatients,
            fever_patients: scores.feverPatients,
            data_quality_issues: scores.dataQualityIssues
        };

        const response = await axios.post(`${API_URL}/submit-assessment`, results, {
            headers: {
                "X-API-Key": API_KEY,
                "Content-Type": "application/json",
            },
        });
        res.json(response.data);

    } catch (error) {
        console.error("Error in /submit-assessment:", error);
        res.status(500).json({ error: "Failed to process assessment" });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
