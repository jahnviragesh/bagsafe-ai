let mlData = [];
const DB_KEY = "BagSafe_Final_Production";
let logs = JSON.parse(localStorage.getItem(DB_KEY)) || [];

// 1. FETCH DATA FROM YOUR EXCEL/JSON
async function loadRealData() {
    try {
        const response = await fetch('./datasets/baggage_master.json');
        mlData = await response.json();
        console.log("✅ Real ML Dataset Loaded: " + mlData.length + " rows");
    } catch (err) {
        console.error("❌ Could not find the JSON file!");
    }
}

// 2. FILL FORM WITH REAL DATA FROM EXCEL
document.getElementById('fillSampleBtn').onclick = () => {
    if (mlData.length > 0) {
        const row = mlData[Math.floor(Math.random() * mlData.length)];
        
        // Match these to your HTML 'name' attributes
        document.getElementsByName('passengerName')[0].value = "Pass. " + (row.ID || Math.floor(Math.random()*1000));
        document.getElementsByName('flightNumber')[0].value = row.Flight_ID || "EK" + Math.floor(Math.random()*900);
        document.getElementsByName('origin')[0].value = row.Origin || "DXB";
        document.getElementsByName('destination')[0].value = row.Destination || "LHR";
        document.getElementsByName('layover')[0].value = row.Layover_Time || Math.floor(Math.random()*120);
        document.getElementsByName('delay')[0].value = row.Arrival_Delay || 0;
    } else {
        alert("Dataset still loading...");
    }
};

// 3. PREDICT AND SAVE (The Logic)
const form = document.getElementById('assessmentForm');
form.onsubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    
    // DYNAMIC SCORING LOGIC
    // Base score starts at 10. We add risk factors.
    let score = 10;
    
    // Factor 1: Layover (Shorter is riskier)
    const layoverVal = Number(data.layover);
    if (layoverVal < 45) score += 50;
    else if (layoverVal < 90) score += 25;
    
    // Factor 2: Flight Delay
    if (Number(data.delay) > 20) score += 20;

    // Factor 3: Randomness (Makes the AI feel "live")
    score += Math.floor(Math.random() * 15);
    
    // Final check
    score = Math.max(5, Math.min(99, score));
    const risk = score > 70 ? "High" : score > 35 ? "Medium" : "Low";

    const entry = {
        id: Date.now(),
        name: data.passengerName || "Aisha Rahman",
        flight: (data.flightNumber || "EK211").toUpperCase(),
        route: `${data.origin || 'DXB'} → ${data.destination || 'LHR'}`,
        tag: data.bagTag || "BG-" + Math.floor(1000 + Math.random() * 9000),
        risk, 
        score,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    logs.unshift(entry);
    localStorage.setItem(DB_KEY, JSON.stringify(logs));
    
    updateHeader(risk, score);
    renderTable();
    form.reset();
};

function updateHeader(risk, score) {
    document.getElementById('riskBadge').innerText = risk;
    document.getElementById('riskScore').innerText = score + "%";
    document.getElementById('heroStatus').innerText = risk === "High" ? "Alert" : "Secure";
}

// 4. SEARCH & RENDER TABLE
function renderTable() {
    const logBody = document.getElementById('logBody');
    const q = document.getElementById('searchInput').value.toLowerCase();
    const filtered = logs.filter(l => l.name.toLowerCase().includes(q) || l.flight.toLowerCase().includes(q));
    
    // Update Stats
    document.getElementById('statsTotal').innerText = logs.length;
    document.getElementById('statsHigh').innerText = logs.filter(l => l.risk === "High").length;

    logBody.innerHTML = filtered.map(l => `
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

// 5. BUTTONS & INIT
document.getElementById('clearAllBtn').onclick = () => {
    if(confirm("Clear all logs?")) { logs = []; localStorage.removeItem(DB_KEY); renderTable(); }
};

document.getElementById('searchInput').oninput = renderTable;

// START EVERYTHING
loadRealData();
renderTable();