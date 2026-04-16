const STORAGE_KEY = "BagSafe_System_Final";
const form = document.getElementById('assessmentForm');
let records = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    
    let score = 20; 
    if (Number(data.layover) < 45) score += 45;
    if (Number(data.delay) > 15) score += 20;
    if (form.elements.isPriority.checked) score -= 15;

    score = Math.max(5, Math.min(99, score));
    const risk = score > 70 ? "High" : score > 35 ? "Medium" : "Low";

    const newRecord = {
        id: Date.now(),
        name: data.passengerName || "Unnamed",
        flight: (data.flightNumber || "N/A").toUpperCase(),
        tag: data.bagTag || "BG-000",
        route: `${(data.origin || "???").toUpperCase()} → ${(data.destination || "???").toUpperCase()}`,
        risk, score,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    records.unshift(newRecord);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    
    document.getElementById('riskBadge').innerText = risk;
    document.getElementById('riskScore').innerText = score + "%";
    document.getElementById('heroStatus').innerText = risk === "High" ? "Alert" : "Ready";
    
    renderTable();
});

// REPAIRED DELETE FUNCTIONS
function deleteRecord(id) {
    records = records.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    renderTable();
}

document.getElementById('clearAllBtn').onclick = () => {
    if(confirm("Are you sure you want to clear the entire log?")) {
        records = [];
        localStorage.removeItem(STORAGE_KEY);
        renderTable();
    }
};

document.getElementById('fillSampleBtn').onclick = () => {
    const s = { passengerName: "Aisha Rahman", bookingReference: "BRG472", bagTag: "BG-1001", flightNumber: "EK211", origin: "DXB", destination: "LHR", layover: 55, delay: 18 };
    Object.keys(s).forEach(k => { if(form.elements[k]) form.elements[k].value = s[k]; });
};

document.getElementById('clearBtn').onclick = () => form.reset();

function renderTable() {
    const q = document.getElementById('searchInput').value.toLowerCase();
    const filtered = records.filter(r => r.name.toLowerCase().includes(q) || r.flight.toLowerCase().includes(q));
    
    document.getElementById('statsTotal').innerText = records.length;
    document.getElementById('statsHigh').innerText = records.filter(r => r.risk === "High").length;
    const avg = records.length ? Math.round(records.reduce((a, b) => a + b.score, 0) / records.length) : 0;
    document.getElementById('statsAvg').innerText = avg + "%";

    document.getElementById('logBody').innerHTML = filtered.map(r => `
        <tr>
            <td><strong>${r.name}</strong></td>
            <td>${r.flight}</td>
            <td>${r.route}</td>
            <td><code>${r.tag}</code></td>
            <td style="color:${r.risk === 'High' ? '#710C21' : '#2e7d32'}; font-weight:800">${r.risk}</td>
            <td>${r.score}%</td>
            <td>${r.time}</td>
            <td><button class="del-btn" onclick="deleteRecord(${r.id})">Delete</button></td>
        </tr>
    `).join('');
}

document.getElementById('searchInput').oninput = renderTable;
renderTable();
