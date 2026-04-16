const STORAGE_KEY = "bagsafe-v1";
const sampleData = {
    passengerName: "Aisha Rahman", bookingReference: "BRG472", bagTag: "BG-1001",
    flightNumber: "EK211", origin: "DXB", destination: "LHR",
    layoverMinutes: 55, transferPoints: 2, terminalDistance: 1200,
    incomingDelay: 18, checkedBags: 2, baggageType: "transfer"
};

const form = document.getElementById('assessmentForm');
let records = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    
    // Simple prediction logic
    let score = 10;
    if (data.layoverMinutes < 60) score += 40;
    if (data.incomingDelay > 15) score += 20;
    score = Math.min(98, score);
    const risk = score > 60 ? "High" : score > 30 ? "Medium" : "Low";

    const newRecord = {
        ...data,
        id: Date.now(),
        risk, score,
        route: `${data.origin}-${data.destination}`,
        time: new Date().toLocaleTimeString()
    };

    records.unshift(newRecord);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    updateUI(risk, score);
    renderTable();
});

function updateUI(risk, score) {
    document.getElementById('riskBadge').textContent = risk + " Risk";
    document.getElementById('riskTitle').textContent = risk + " risk detected";
    document.getElementById('riskScore').textContent = score + "%";
    document.getElementById('heroRiskLabel').textContent = risk;
}

function renderTable() {
    document.getElementById('recordsTableBody').innerHTML = records.map(r => `
        <tr>
            <td>${r.passengerName}</td>
            <td>${r.flightNumber}</td>
            <td>${r.route}</td>
            <td>${r.bagTag}</td>
            <td>${r.risk}</td>
            <td>${r.score}%</td>
            <td>${r.time}</td>
        </tr>
    `).join('');
    document.getElementById('statsTotal').textContent = records.length;
}

document.getElementById('fillSampleBtn').onclick = () => {
    Object.keys(sampleData).forEach(key => form.elements[key].value = sampleData[key]);
};

renderTable();
