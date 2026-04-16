const DB_KEY = "BagSafe_Final_Production";
let logs = JSON.parse(localStorage.getItem(DB_KEY)) || [];

const form = document.getElementById('assessmentForm');

// PREDICT AND SAVE ACTION
form.onsubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    
    // Prediction Scoring Logic
    let score = 20;
    if (Number(data.layover) < 45) score += 35;
    if (Number(data.delay) > 15) score += 25;
    if (form.elements.isPriority.checked) score -= 15;
    
    score = Math.max(5, Math.min(99, score));
    const risk = score > 68 ? "High" : score > 35 ? "Medium" : "Low";

    const entry = {
        id: Date.now(),
        name: data.passengerName || "Aisha Rahman",
        flight: (data.flightNumber || "EK211").toUpperCase(),
        route: `${data.origin || 'DXB'} → ${data.destination || 'LHR'}`,
        tag: data.bagTag || "BG-1001",
        risk, score,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    logs.unshift(entry);
    localStorage.setItem(DB_KEY, JSON.stringify(logs));
    
    updateHeader(risk, score);
    renderTable();
};

function updateHeader(risk, score) {
    document.getElementById('riskBadge').innerText = risk;
    document.getElementById('riskScore').innerText = score + "%";
    document.getElementById('heroStatus').innerText = risk === "High" ? "Alert" : "Secure";
    document.getElementById('riskTitle').innerText = risk === "High" ? "Action Required" : "Risk Minimal";
}

// SAMPLE DATA LOADER
document.getElementById('fillSampleBtn').onclick = () => {
    const s = { passengerName: "Aisha Rahman", flightNumber: "EK211", bookingReference: "BRG472", bagTag: "BG-1001", origin: "DXB", destination: "LHR", layover: 55, delay: 18 };
    Object.keys(s).forEach(k => { if(form.elements[k]) form.elements[k].value = s[k]; });
};

// CLEAR ACTIONS
document.getElementById('clearBtn').onclick = () => form.reset();
document.getElementById('clearAllBtn').onclick = () => {
    if(confirm("Clear all logs?")) { logs = []; localStorage.removeItem(DB_KEY); renderTable(); }
};

function renderTable() {
    const q = document.getElementById('searchInput').value.toLowerCase();
    const filtered = logs.filter(l => l.name.toLowerCase().includes(q) || l.flight.toLowerCase().includes(q));
    
    // UPDATE DASHBOARD STATS
    document.getElementById('statsTotal').innerText = logs.length;
    document.getElementById('statsHigh').innerText = logs.filter(l => l.risk === "High").length;
    const avg = logs.length ? Math.round(logs.reduce((a, b) => a + b.score, 0) / logs.length) : 0;
    document.getElementById('statsAvg').innerText = avg + "%";

    document.getElementById('logBody').innerHTML = filtered.map(l => `
        <tr>
            <td><strong>${l.name}</strong></td>
            <td>${l.flight}</td>
            <td>${l.route}</td>
            <td>${l.tag}</td>
            <td style="color:${l.risk === 'High' ? '#710C21' : '#A24C61'}; font-weight:800">${l.risk}</td>
            <td>${l.score}%</td>
            <td>${l.time}</td>
        </tr>
    `).join('');
}

document.getElementById('searchInput').oninput = renderTable;
renderTable();
