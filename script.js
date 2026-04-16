const STORAGE_KEY = "bagsafe-web-records-v1";

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

function scoreAssessment(data) {
    let score = 15;
    const reasons = [];
    if (data.layoverMinutes < 45) { score += 40; reasons.push("Extremely short layover."); }
    else if (data.layoverMinutes < 75) { score += 20; reasons.push("Tight connection window."); }
    
    if (data.incomingDelay > 20) { score += 25; reasons.push("Incoming flight delay is significant."); }
    if (data.terminalDistance > 1100) { score += 15; reasons.push("Long distance between gates."); }
    
    if (data.priorityStatus) { score -= 15; reasons.push("Priority status speeds up handling."); }

    score = Math.max(5, Math.min(98, score));
    let risk = score > 65 ? "High" : score > 35 ? "Medium" : "Low";

    const recs = {
        High: ["Escalate for manual supervision.", "Prioritize loading immediately.", "Notify arrival supervisor."],
        Medium: ["Flag for monitoring.", "Verify transfer at next point.", "Keep visible on dashboard."],
        Low: ["Standard workflow.", "Routine monitoring.", "No intervention needed."]
    };

    return { risk, score, reasons, recommendations: recs[risk] };
}

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const entries = Object.fromEntries(data.entries());
    
    // Process types
    entries.layoverMinutes = Number(entries.layoverMinutes);
    entries.incomingDelay = Number(entries.incomingDelay);
    entries.terminalDistance = Number(entries.terminalDistance);
    entries.priorityStatus = form.elements.namedItem("priorityStatus").checked;

    const result = scoreAssessment(entries);
    
    const record = {
        passengerName: entries.passengerName,
        flightNumber: entries.flightNumber.toUpperCase(),
        route: `${entries.origin.toUpperCase()}-${entries.destination.toUpperCase()}`,
        bagTag: entries.bagTag.toUpperCase(),
        risk: result.risk,
        score: result.score,
        savedAt: new Date().toLocaleTimeString()
    };

    records.unshift(record);
    saveRecords();
    
    // Update UI
    riskBadge.className = `risk-badge ${result.risk.toLowerCase()}`;
    riskBadge.textContent = `${result.risk} Risk`;
    riskTitle.textContent = `${result.risk} transfer risk detected`;
    riskScore.textContent = `Confidence score: ${result.score}%`;
    riskReason.textContent = result.reasons.join(" ");
    heroRiskLabel.textContent = result.risk;
    heroRiskHint.textContent = `${result.score}% confidence from latest check`;
    
    recommendationList.innerHTML = result.recommendations.map(r => `<div class="info-item"><p>${r}</p></div>`).join("");
    
    renderTable();
});

function renderTable() {
    const query = searchInput.value.toLowerCase();
    const filtered = records.filter(r => r.passengerName.toLowerCase().includes(query));
    
    recordsTableBody.innerHTML = filtered.map(r => `
        <tr>
            <td><strong>${r.passengerName}</strong></td>
            <td>${r.flightNumber}</td>
            <td>${r.route}</td>
            <td>${r.bagTag}</td>
            <td><span class="risk-badge ${r.risk.toLowerCase()}" style="margin:0; font-size:0.7rem;">${r.risk}</span></td>
            <td>${r.score}%</td>
            <td>${r.savedAt}</td>
        </tr>
    `).join("");

    statsTotal.textContent = records.length;
    statsHigh.textContent = records.filter(r => r.risk === 'High').length;
    const avg = records.length ? Math.round(records.reduce((a, b) => a + b.score, 0) / records.length) : 0;
    statsAverage.textContent = `${avg}%`;
}

fillSampleBtn.addEventListener("click", () => fillForm(sampleAssessment));
clearBtn.addEventListener("click", () => form.reset());
clearRecordsBtn.addEventListener("click", () => { if(confirm("Clear log?")) { records = []; saveRecords(); renderTable(); }});
searchInput.addEventListener("input", renderTable);

renderTable();
