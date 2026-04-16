const KEY = "BagSafe_Final_v1";
let logs = JSON.parse(localStorage.getItem(KEY)) || [];

const form = document.getElementById('assessmentForm');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    
    // Logic
    let score = 25;
    if (Number(data.layover) < 45) score += 40;
    if (Number(data.delay) > 15) score += 20;
    if (form.elements.isPriority.checked) score -= 15;
    
    score = Math.max(5, Math.min(99, score));
    const risk = score > 70 ? "High" : score > 35 ? "Medium" : "Low";

    const entry = {
        id: Date.now(),
        name: data.passengerName || "N/A",
        flight: (data.flightNumber || "N/A").toUpperCase(),
        risk, score,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    logs.unshift(entry);
    localStorage.setItem(KEY, JSON.stringify(logs));
    
    updateUI(risk, score);
    renderTable();
});

function updateUI(risk, score) {
    document.getElementById('riskBadge').innerText = risk;
    document.getElementById('riskScore').innerText = score + "%";
    document.getElementById('heroStatus').innerText = risk === "High" ? "Alert" : "Secure";
    document.getElementById('riskTitle').innerText = risk === "High" ? "Attention Required" : "Risk Minimal";
}

function deleteEntry(id) {
    logs = logs.filter(l => l.id !== id);
    localStorage.setItem(KEY, JSON.stringify(logs));
    renderTable();
}

document.getElementById('clearAllBtn').onclick = () => {
    if(confirm("Wipe all monitoring data?")) {
        logs = [];
        localStorage.removeItem(KEY);
        renderTable();
    }
};

document.getElementById('fillSampleBtn').onclick = () => {
    const s = { passengerName: "Aisha Rahman", flightNumber: "EK211", bagTag: "BG-1001", origin: "DXB", destination: "LHR", layover: 55, delay: 18 };
    Object.keys(s).forEach(k => { if(form.elements[k]) form.elements[k].value = s[k]; });
};

function renderTable() {
    const q = document.getElementById('searchInput').value.toLowerCase();
    const filtered = logs.filter(l => l.name.toLowerCase().includes(q) || l.flight.toLowerCase().includes(q));
    
    document.getElementById('statsTotal').innerText = logs.length;
    document.getElementById('statsHigh').innerText = logs.filter(l => l.risk === "High").length;
    const avg = logs.length ? Math.round(logs.reduce((a, b) => a + b.score, 0) / logs.length) : 0;
    document.getElementById('statsAvg').innerText = avg + "%";

    document.getElementById('logBody').innerHTML = filtered.map(l => `
        <tr>
            <td><strong>${l.name}</strong></td>
            <td>${l.flight}</td>
            <td style="color:${l.risk === 'High' ? '#710C21' : '#A24C61'}; font-weight:800">${l.risk}</td>
            <td>${l.score}%</td>
            <td>${l.time}</td>
            <td><button class="del-btn" onclick="deleteEntry(${l.id})">Delete</button></td>
        </tr>
    `).join('');
}

document.getElementById('searchInput').oninput = renderTable;
renderTable();
