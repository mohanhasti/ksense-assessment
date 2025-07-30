const axios = require("axios");
require('dotenv').config();
const API_URL = "https://assessment.ksensetech.com/api";
const API_KEY = process.env.API_KEY;

async function fetchDataWithRetry(page, limit) {
    const retry = 3;
    while (retry > 0) {
        try {
            const response = await axios.get(
                `${API_URL}/patients?page=${page}&limit=${limit}`, {
                headers: {
                    "X-API-Key": API_KEY,
                }
            });
        return response.data;
        } catch (error) {
            const statusCode = error?.response?.status;
            if (statusCode === 500 || statusCode === 503 || statusCode === 429) {
                console.error("Error fetching data:", error);
                await new Promise(delay => setTimeout(delay, 1000)); // set a delay if there is rate limit
            } else {
                throw error;
            }
        }
        await new Promise(delay => setTimeout(delay, 1000)); // set a delay if there is rate limit
    }
    throw new Error("Failed to fetch data after ${page} & ${retries} retry");
}

async function fetchData() {
    let page = 1;
    let hasNext = true;
    const limit = 10;
    const allPatientsData = [];

    while (hasNext) {
        const result = await fetchDataWithRetry(page, limit);
        allPatientsData.push(...result.data);
        hasNext = result.pagination?.hasNext;
        page++;
    }
    return allPatientsData;
}

module.exports = { fetchData };