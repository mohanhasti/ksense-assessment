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
    const data = await fetchData();
    const {patients, highRiskPatients, feverPatients, dataQualityIssues } = riskScorer(data);
    const result = {highRiskPatients, feverPatients, dataQualityIssues };
    // const result2 = res.json({patients});
    return result;
});
app.post("/submit-assessment", async (req, res) => {
    const data = await riskScorer();
    const results = {
        high_risk_patients: [data.highRiskPatients],
        fever_patients: [data.feverPatients],
        data_quality_issues: [data.dataQualityIssues]
      };
    //   console.log("results", results);
    // try {
    //     const response = await axios.get(`${API_URL}/patients`, {
    //     headers: {
    //         "X-API-Key": API_KEY,
    //     },
    //     });
    //     res.json(response.data);
    // } catch (error) {
    //     res.status(500).json({ error: "Failed to fetch patients" });
    // }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
