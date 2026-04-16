const STORAGE_KEY = "bagsafe_plum_v1";

const form = document.getElementById('assessmentForm');
let records = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    
    // Prediction logic
    let score = 12;
    if (Number(data.layoverMinutes) < 60) score += 45;
    if (Number(data.incomingDelay) > 20) score += 25;
    score = Math.min(99, score);
    
    const risk = score > 65 ? "High" : score > 35 ? "Medium" : "Low";

    const newRecord = {
        ...data,
        risk, score,
        route: `${data.origin}-${data.destination}`,
        time: new Date().toLocaleTimeString()
    };

    records.unshift(newRecord);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    
    updateSummaryUI(risk, score);
    renderTable();
});

function updateSummaryUI(risk, score) {
    document.getElementById('riskBadge').textContent = risk;
    document.getElementById('riskTitle').textContent = risk + " Risk Assessment";
    document.getElementById('riskScore').textContent = score + "%";
    document.getElementById('heroRiskLabel').textContent = risk;
    
    const list = document.getElementById('recommendationList');
    list.innerHTML = risk === "High" ? 
        `<div class="list-item">Flag for immediate manual transfer.</div>` : 
        `<div class="list-item">Proceed with standard monitoring.</div>`;
}

function renderTable() {
    document.getElementById('recordsTableBody').innerHTML = records.map(r => `
        <tr>
            <td>${r.passengerName}</td>
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
    const sample = { passengerName: "Jahnvi", bookingReference: "DXB77", bagTag: "BAG-01", flightNumber: "EK202", origin: "DXB", destination: "LHR", layoverMinutes: 45, incomingDelay: 25 };
    Object.keys(sample).forEach(key => form.elements[key].value = sample[key]);
};

renderTable();
