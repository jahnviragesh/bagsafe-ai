const STORAGE_KEY = "bagsafe_laptop_v1";
const form = document.getElementById('assessmentForm');
let records = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    
    // Data Parsing
    data.layover = Number(data.layover);
    data.delay = Number(data.delay);
    data.distance = Number(data.distance);
    data.points = Number(data.points);
    const isPriority = form.elements.namedItem("isPriority").checked;

    // Advanced Prediction Logic
    let score = 15; // Baseline
    
    if (data.layover < 45) score += 50;
    else if (data.layover < 75) score += 25;

    if (data.delay > 30) score += 20;
    else if (data.delay > 15) score += 10;

    if (data.distance > 1300) score += 15;
    if (data.points > 2) score += 10;

    // Reduction for priority
    if (data.type === "Priority" || isPriority) score -= 20;

    score = Math.max(5, Math.min(99, score));
    const risk = score > 70 ? "High" : score > 40 ? "Medium" : "Low";

    const newRecord = {
        passengerName: data.passengerName || "Unknown",
        flightNumber: (data.flightNumber || "N/A").toUpperCase(),
        route: `${(data.origin || "???").toUpperCase()}→${(data.destination || "???").toUpperCase()}`,
        bagTag: (data.bagTag || "N/A").toUpperCase(),
        risk, 
        score,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    records.unshift(newRecord);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    
    updateUI(risk, score);
    renderTable();
});

function updateUI(risk, score) {
    // Update Summary Card
    const badge = document.getElementById('riskBadge');
    const title = document.getElementById('riskTitle');
    const hero = document.getElementById('heroStatus');

    badge.textContent = risk + " Risk";
    title.textContent = risk === "High" ? "Escalation Required" : "Standard Handling";
    document.getElementById('riskScore').textContent = score + "%";

    // Update Hero Status
    hero.textContent = risk === "High" ? "Risk Alert" : "Clear";
    hero.style.color = risk === "High" ? "#710C21" : "#411528";
}

function renderTable() {
    const logBody = document.getElementById('logBody');
    
    // Update Header Stats
    const highRiskCount = records.filter(r => r.risk === "High").length;
    const avgScore = records.length > 0 
        ? Math.round(records.reduce((acc, r) => acc + r.score, 0) / records.length) 
        : 0;

    document.getElementById('statsTotal').textContent = records.length;
    document.getElementById('statsHigh').textContent = highRiskCount;
    document.getElementById('statsAvg').textContent = avgScore + "%";

    // Render Rows
    logBody.innerHTML = records.map(r => `
        <tr>
            <td><strong>${r.passengerName}</strong></td>
            <td>${r.flightNumber}</td>
            <td>${r.route}</td>
            <td style="color:${r.risk === 'High' ? '#710C21' : '#2e7d32'}; font-weight:800">${r.risk}</td>
            <td>${r.score}%</td>
            <td>${r.time}</td>
        </tr>
    `).join('');
}

// Fill Sample Data
document.getElementById('fillSampleBtn').onclick = () => {
    const sample = { 
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
    Object.keys(sample).forEach(key => {
        if(form.elements[key]) form.elements[key].value = sample[key];
    });
};

// Initial Load
renderTable();
