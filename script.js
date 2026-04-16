const STORAGE_KEY = "bagsafe_dashboard_data";
const form = document.getElementById('assessmentForm');
let records = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// 1. Prediction Algorithm
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    
    // Core logic: Lower layover and higher delays increase risk
    let score = 10;
    const layover = Number(data.layover);
    const delay = Number(data.delay);
    const dist = Number(data.distance);
    
    if (layover < 45) score += 55;
    else if (layover < 70) score += 30;
    
    if (delay > 25) score += 20;
    else if (delay > 10) score += 10;
    
    if (dist > 1400) score += 15;
    
    // Priority reduces numerical risk score in this model
    if (data.type === "Priority" || form.elements.isPriority.checked) {
        score = Math.max(5, score - 20);
    }

    score = Math.min(99, score);
    const risk = score > 75 ? "High" : score > 40 ? "Medium" : "Low";

    const newRecord = {
        id: Date.now(),
        passengerName: data.passengerName || "Guest Passenger",
        flightNumber: (data.flightNumber || "N/A").toUpperCase(),
        tag: data.bagTag || "UNT-000",
        route: `${(data.origin || "DXB").toUpperCase()} → ${(data.destination || "LHR").toUpperCase()}`,
        risk, 
        score,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    records.unshift(newRecord);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    
    updateSummaryUI(risk, score);
    renderTable();
});

// 2. UI Updates
function updateSummaryUI(risk, score) {
    const badge = document.getElementById('riskBadge');
    const hero = document.getElementById('heroStatus');
    
    badge.innerText = risk;
    document.getElementById('riskScore').innerText = score + "%";
    document.getElementById('riskTitle').innerText = risk === "High" ? "Critical Risk" : "Assessment Saved";
    
    hero.innerText = risk === "High" ? "Risk Alert" : "Clear";
    
    // Apply colors based on risk
    const colors = { "High": "#710C21", "Medium": "#A24C61", "Low": "#2e7d32" };
    badge.style.backgroundColor = risk === "High" ? "#710C21" : "#E1C9D5";
    badge.style.color = risk === "High" ? "white" : "#710C21";
}

// 3. Table Rendering & Search
function renderTable() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = records.filter(r => 
        r.passengerName.toLowerCase().includes(query) || 
        r.flightNumber.toLowerCase().includes(query) || 
        r.tag.toLowerCase().includes(query)
    );
    
    // Update Stats
    document.getElementById('statsTotal').innerText = records.length;
    document.getElementById('statsHigh').innerText = records.filter(r => r.risk === "High").length;
    const avg = records.length ? Math.round(records.reduce((a, b) => a + b.score, 0) / records.length) : 0;
    document.getElementById('statsAvg').innerText = avg + "%";

    const logBody = document.getElementById('logBody');
    logBody.innerHTML = filtered.map(r => `
        <tr>
            <td><strong>${r.passengerName}</strong></td>
            <td>${r.flightNumber}</td>
            <td><small>${r.route}</small></td>
            <td><code>${r.tag}</code></td>
            <td style="color:${r.risk === 'High' ? '#710C21' : '#2e7d32'}; font-weight:800">
                ${r.risk}
            </td>
            <td>${r.score}%</td>
            <td style="opacity:0.6">${r.time}</td>
        </tr>
    `).join('');
}

// 4. Utility Functions
document.getElementById('fillSampleBtn').onclick = () => {
    const samples = {
        passengerName: "Aisha Rahman",
        bookingReference: "BRG472",
        bagTag: "BG-1001",
        flightNumber: "EK211",
        origin: "DXB",
        destination: "LHR",
        layover: 55,
        points: 2,
        distance: 1200,
        delay: 18,
        bags: 2
    };
    Object.keys(samples).forEach(key => {
        if(form.elements[key]) form.elements[key].value = samples[key];
    });
};

document.getElementById('clearBtn').onclick = () => form.reset();
document.getElementById('clearAllBtn').onclick = () => {
    if(confirm("Clear all logs?")) {
        records = [];
        localStorage.removeItem(STORAGE_KEY);
        renderTable();
    }
};

document.getElementById('searchInput').oninput = renderTable;

// Initialize
renderTable();
