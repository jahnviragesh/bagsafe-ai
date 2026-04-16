const STORAGE_KEY = "bagsafe-web-records-v1";

// The missing sample data object
const sampleAssessment = {
    passengerName: "Aisha Rahman",
    bookingReference: "BRG472",
    bagTag: "BG-1001",
    flightNumber: "EK211",
    origin: "DXB",
    destination: "LHR",
    layoverMinutes: 55,
    transferPoints: 2,
    terminalDistance: 1200,
    incomingDelay: 18,
    checkedBags: 2,
    baggageType: "transfer",
    priorityStatus: false,
    internationalTransfer: true
};

const form = document.getElementById("assessmentForm");
const fillSampleBtn = document.getElementById("fillSampleBtn");
const clearBtn = document.getElementById("clearBtn");
const clearRecordsBtn = document.getElementById("clearRecordsBtn");
const searchInput = document.getElementById("searchInput");
const recordsTableBody = document.getElementById("recordsTableBody");

const riskBadge = document.getElementById("riskBadge");
const riskTitle = document.getElementById("riskTitle");
const riskScore = document.getElementById("riskScore");
const riskReason = document.getElementById("riskReason");
const recommendationList = document.getElementById("recommendationList");

const heroRiskLabel = document.getElementById("heroRiskLabel");
const heroRiskHint = document.getElementById("heroRiskHint");
const statsTotal = document.getElementById("statsTotal");
const statsHigh = document.getElementById("statsHigh");
const statsAverage = document.getElementById("statsAverage");

let records = loadRecords();

function loadRecords() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch { return []; }
}

function saveRecords() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function fillForm(data) {
    Object.entries(data).forEach(([key, value]) => {
        const field = form.elements.namedItem(key);
        if (!field) return;
        if (field.type === "checkbox") {
            field.checked = Boolean(value);
        } else {
            field.value = value;
        }
    });
}

function clearForm() {
    form.reset();
}

function getFormData() {
    const data = new FormData(form);
    return {
        passengerName: data.get("passengerName"),
        bookingReference: data.get("bookingReference").toUpperCase(),
        bagTag: data.get("bagTag").toUpperCase(),
        flightNumber: data.get("flightNumber").toUpperCase(),
        origin: data.get("origin").toUpperCase(),
        destination: data.get("destination").toUpperCase(),
        layoverMinutes: Number(data.get("layoverMinutes")),
        transferPoints: Number(data.get("transferPoints")),
        terminalDistance: Number(data.get("terminalDistance")),
        incomingDelay: Number(data.get("incomingDelay")),
        checkedBags: Number(data.get("checkedBags")),
        baggageType: data.get("baggageType"),
        priorityStatus: form.elements.namedItem("priorityStatus").checked,
        internationalTransfer: form.elements.namedItem("internationalTransfer").checked,
    };
}

function scoreAssessment(data) {
    let score = 15;
    const reasons = [];

    if (data.layoverMinutes < 45) { score += 40; reasons.push("Critical connection time."); }
    else if (data.layoverMinutes < 90) { score += 20; reasons.push("Tight layover."); }

    if (data.incomingDelay > 20) { score += 20; reasons.push("Incoming flight delayed."); }
    if (data.terminalDistance > 1000) { score += 10; reasons.push("Long transfer distance."); }

    score = Math.min(99, score);
    let risk = score > 60 ? "High" : score > 30 ? "Medium" : "Low";

    return { risk, score, reasons, recommendations: ["Escalate if High Risk", "Monitor if Medium"] };
}

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = getFormData();
    const result = scoreAssessment(data);
    
    const record = {
        ...data,
        id: Date.now(),
        risk: result.risk,
        score: result.score,
        route: `${data.origin}-${data.destination}`,
        savedAt: new Date().toLocaleTimeString()
    };

    records.unshift(record);
    saveRecords();
    updateSummary(result);
    renderTable();
});

function updateSummary(result) {
    riskBadge.className = `risk-badge ${result.risk.toLowerCase()}`;
    riskBadge.textContent = `${result.risk} Risk`;
    riskTitle.textContent = `${result.risk} risk detected`;
    riskScore.textContent = `Confidence: ${result.score}%`;
    heroRiskLabel.textContent = result.risk;
}

function renderTable() {
    recordsTableBody.innerHTML = records.map(r => `
        <tr>
            <td>${r.passengerName}</td>
            <td>${r.flightNumber}</td>
            <td>${r.route}</td>
            <td>${r.bagTag}</td>
            <td><span class="risk-badge ${r.risk.toLowerCase()}">${r.risk}</span></td>
            <td>${r.score}%</td>
            <td>${r.savedAt}</td>
        </tr>
    `).join("");
    statsTotal.textContent = records.length;
}

fillSampleBtn.addEventListener("click", () => fillForm(sampleAssessment));
clearBtn.addEventListener("click", clearForm);
renderTable();
