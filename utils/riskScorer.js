function calcBpScore(bp) {
    if (!bp || typeof bp !== 'string' || bp === undefined || bp === null || !bp.match(/^\d+\/\d+$/))
        return {score: 0, issue: 'Invalid BP format'};

    const [systolic, diastolic] = bp.split('/').map(Number);

    // Score systolic
    let systolicScore = 0;
    if (systolic < 120) systolicScore = 0;
    else if (systolic >= 120 && systolic <= 129) systolicScore = 1;
    else if (systolic >= 130 && systolic <= 139) systolicScore = 2;
    else if (systolic >= 140) systolicScore = 3;

    // Score diastolic
    let diastolicScore = 0;
    if (diastolic < 80) diastolicScore = 0;
    else if (diastolic >= 80 && diastolic <= 89) diastolicScore = 2;
    else if (diastolic >= 90) diastolicScore = 3;

    // Use the higher risk stage for scoring
    const score = Math.max(systolicScore, diastolicScore);
    return { score };
}

function calcTempScore(temp){
    if (!temp || typeof temp !== 'number' || temp === null || (temp === undefined)) 
        return {score: 0, issue: 'Invalid temperature format'};

    if (temp <= 99.5) return {score: 0};
    else if (temp >= 99.6 && temp <= 100.9) return {score: 1};
    else if (temp >= 101.0) return {score: 2};
    else return {score:0, reason: 'Invalid temperature'};
}

function calcAgeScore(age){
    if (!age || typeof age !== 'number' || age === null || (age === undefined)) 
        return {score: 0, issue: 'Invalid age format'};
    if( age < 40) return {score: 0};
    else if ( age >=40 && age <= 65) return {score: 1};
    else if (age > 65) return {score: 2};
    else return {score:0, reason: 'Invalid age'};
}
function riskScorer(patients) {
    const highRiskPatients = [];
    const feverPatients = [];
    const dataQualityIssues = [];

    patients.forEach(patient => {
        const bpScore = calcBpScore(patient.blood_pressure);
        patient.bpScore = bpScore;    
        const tempScore = calcTempScore(patient.temperature);
        patient.tempScore = tempScore;
        const ageScore = calcAgeScore(patient.age);
        patient.ageScore = ageScore;

        const totalScore = bpScore.score + tempScore.score + ageScore.score;
        patient.totalScore = totalScore;
        if (totalScore >= 4) {
            highRiskPatients.push(patient.patient_id);
        } 
        if (tempScore.score >= 1) {
            feverPatients.push(patient.patient_id);
        } 
        if (bpScore.issue || tempScore.issue || ageScore.issue) {
            dataQualityIssues.push(patient.patient_id);
        }
    });
    return {
        patients,
        highRiskPatients,
        feverPatients,
        dataQualityIssues
    }
}

module.exports = { riskScorer };