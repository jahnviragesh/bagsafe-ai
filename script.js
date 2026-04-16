const STORAGE_KEY = "BagSafe_Operational_DB";
let entries = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

const form = document.getElementById('assessmentForm');

// PREDICT AND SAVE
form.onsubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    
    // Risk Calculation
    let score = 20;
    if (Number(data.layover) < 45) score += 35;
    if (Number(data.delay) > 15) score += 25;
    if (form.elements.isPriority.checked) score -= 15;
    
    score = Math.max(5, Math.min(99, score));
    const risk = score > 68 ? "High" : score > 35 ? "Medium" : "Low";

    const newEntry = {
        id: Date.now(),
        name: data.passengerName || "Aisha Rahman",
        flight: (data.flightNumber || "EK211").toUpperCase(),
        route: `${data.origin} → ${data.destination}`,
        tag: data.bagTag || "BG-1001",
        risk, score,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    entries.unshift(newEntry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    
    updateUI(risk, score);
    renderTable();
};

function updateUI(risk, score) {
    const title = document.getElementById('riskTitle');
    const badge = document.getElementById('riskBadge'); // Note: added id locally
    
    document.getElementById('riskScore').innerText = score + "%";
    document.getElementById('heroStatus').innerText = risk === "High" ? "Alert" : "Secure";
    title.innerText = risk === "High" ? "Action Required" : "Risk Minimal";
}

// SAMPLE DATA
document.getElementById('fillSampleBtn').onclick = () => {
    const sample = { passengerName: "Aisha Rahman", flightNumber: "EK211", bookingReference: "BRG472", bagTag: "BG-1001", origin: "DXB", destination: "LHR", layover: 55, delay: 18 };
    Object.keys(sample).forEach(key => { if(form.elements[key]) form.elements[key].value = sample[key]; });
};

// RESET/CLEAR
document.getElementById('clearBtn').onclick = () => form.reset();
document.getElementById('clearAllBtn').onclick = () => {
    if(confirm("Wipe logs?")) { entries = []; localStorage.removeItem(STORAGE_KEY); renderTable(); }
};

function renderTable() {
    const q = document.getElementById('searchInput').value.toLowerCase();
    const list = entries.filter(e => e.name.toLowerCase().includes(q) || e.flight.toLowerCase().includes(q) || e.risk.toLowerCase().includes(q));
    
    // Update Stats
    document.getElementById('statsTotal').innerText = entries.length;
    document.getElementById('statsHigh').innerText = entries.filter(e => e.risk === "High").length;
    const avg = entries.length ? Math.round(entries.reduce((a, b) => a + b.score, 0) / entries.length) : 0;
    document.getElementById('statsAvg').innerText = avg + "%";

    document.getElementById('logBody').innerHTML = list.map(e => `
        <tr>
            <td><strong>${e.name}</strong></td>
            <td>${e.flight}</td>
            <td>${e.route}</td>
            <td>${e.tag}</td>
            <td style="color:${e.risk === 'High' ? '#710C21' : '#A24C61'}; font-weight:800">${e.risk}</td>
            <td>${e.score}%</td>
            <td>${e.time}</td>
        </tr>
    `).join('');
}

document.getElementById('searchInput').oninput = renderTable;
renderTable();
