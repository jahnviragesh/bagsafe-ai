const STORAGE_KEY = "bagsafe_laptop_v1";

const form = document.getElementById('assessmentForm');
let records = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    
    // Convert numbers
    data.layoverMinutes = Number(data.layoverMinutes);
    data.transferPoints = Number(data.transferPoints);
    data.incomingDelay = Number(data.incomingDelay);
    data.terminalDistance = Number(data.terminalDistance);
    data.priorityStatus = form.elements.namedItem("priorityStatus").checked;

    // Advanced Prediction logic based on multiple factors
    let score = 10; // Baseline risk
    const reasons = [];

    // Layover time is critical
    if (data.layoverMinutes < 45) { score += 50; reasons.push("Critical connection time."); }
    else if (data.layoverMinutes < 70) { score += 25; reasons.push("Very tight layover window."); }

    // Delay factor
    if (data.incomingDelay > 30) { score += 20; reasons.push("Significant incoming delay."); }
    else if (data.incomingDelay > 15) { score += 10; reasons.push("Minor incoming delay."); }

    // Distance factor
    if (data.terminalDistance > 1300) { score += 15; reasons.push("Long terminal distance."); }

    // Complexity
    if (data.transferPoints > 2) { score += 8; reasons.push("Multiple connection points."); }

    // Type reduction
    if (data.baggageType === "priority" || data.priorityStatus) { score -= 15; reasons.push("Priority handling decreases risk."); }

    // Normalize score
    score = Math.max(5, Math.min(99, score));
    const risk = score > 65 ? "High" : score > 35 ? "Medium" : "Low";

    const operationalRules = {
        High: ["Flag for direct tarmac transfer.", "Manual supervisor assigned.", "Prioritize over transfer bags."],
        Medium: ["Flag on monitor log.", "Notify receiving gate.", "Standard manual check at transfer point."],
        Low: ["Routine transfer.", "Standard automated sort.", "Routine dashboard view."]
    };

    const newRecord = {
        passengerName: data.passengerName,
        flightNumber: data.flightNumber.toUpperCase(),
        route: `${data.origin.toUpperCase()}-${data.destination.toUpperCase()}`,
        bagTag: data.bagTag.toUpperCase(),
        risk, score, reasons,
        guidance: operationalRules[risk],
        time: new Date().toLocaleTimeString()
    };

    records.unshift(newRecord);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    
    updateSummaryUI(risk, score, reasons);
    updateGuidanceUI(operationalRules[risk]);
    renderTable();
});

function updateSummaryUI(risk, score, reasons) {
    document.getElementById('riskBadge').textContent = risk;
    document.getElementById('riskBadge').className = `status-pill ${risk.toLowerCase()}`; // Add class for styling if needed
    document.getElementById('riskTitle').textContent = `${risk} connection failure probability detected.`;
    document.getElementById('riskScore').textContent = `${score}%`;
    document.getElementById('heroRiskLabel').textContent = risk;
}

function updateGuidanceUI(recommendations) {
    const list = document.getElementById('recommendationList');
    list.innerHTML = recommendations.map(rec => `<div class="list-item">${rec}</div>`).join("");
}

function renderTable() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = records.filter(r => r.passengerName.toLowerCase().includes(query));
    
    document.getElementById('recordsTableBody').innerHTML = filtered.map(r => `
        <tr>
            <td><strong>${r.passengerName}</strong></td>
            <td>${r.flightNumber}</td>
            <td>${r.route}</td>
            <td><strong>${r.risk}</strong></td>
            <td>${r.score}%</td>
            <td>${r.time}</td>
        </tr>
    `).join('');
    document.getElementById('statsTotal').textContent = records.length;
}

document.getElementById('fillSampleBtn').onclick = () => {
    const sample = { passengerName: "Aisha Rahman", bookingReference: "BRG472", bagTag: "BAG-88", flightNumber: "EK211", origin: "DXB", destination: "LHR", layoverMinutes: 55, transferPoints: 2, terminalDistance: 1200, incomingDelay: 18, checkedBags: 2, baggageType: "transfer" };
    Object.keys(sample).forEach(key => form.elements[key].value = sample[key]);
};

document.getElementById('searchInput').addEventListener('input', renderTable);

renderTable();
