let mlData = [];

// FETCH DATA FROM YOUR NEW JSON FILE
async function loadRealData() {
    try {
        const response = await fetch('./datasets/baggage_master.json');
        mlData = await response.json();
        console.log("✅ Real ML Dataset Loaded: " + mlData.length + " rows");
    } catch (err) {
        console.error("❌ Could not find the JSON file. Check your folder path!");
    }
}

// MAKE THE "SAMPLE DATA" BUTTON USE REAL DATA
document.getElementById('fillSampleBtn').onclick = () => {
    if (mlData.length > 0) {
        // Pick a random row from your Excel data
        const row = mlData[Math.floor(Math.random() * mlData.length)];
        
        // Match these names to the column names in your Excel file!
        document.getElementsByName('passengerName')[0].value = "Passenger " + (row.ID || "Alpha");
        document.getElementsByName('flightNumber')[0].value = row.Flight_ID || "EK211";
        document.getElementsByName('origin')[0].value = row.Origin || "DXB";
        document.getElementsByName('destination')[0].value = row.Destination || "LHR";
        document.getElementsByName('layover')[0].value = row.Layover_Time || 45;
    }
};

loadRealData();
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


// 1. DATABASE INITIALIZATION
const DB_KEY = "BagSafe_System_Database";
// This line "fetches" your records from the database on load
let baggageLogs = JSON.parse(localStorage.getItem(DB_KEY)) || [];

const form = document.getElementById('assessmentForm');

// 2. CREATE/INSERT RECORD (The "Predict and Save" Button)
form.onsubmit = (e) => {
    e.preventDefault();
    
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());

    // Logic to calculate a risk score (Ditto to your project goals)
    let score = 25; 
    if (parseInt(data.layover) < 60) score += 40;
    if (parseInt(data.delay) > 15) score += 20;
    
    const risk = score > 60 ? "High" : "Low";

    // Create the object to match your Python SQLite columns
    const newRecord = {
        id: Date.now(),
        passenger_name: data.passengerName || "Aisha Rahman",
        flight_number: (data.flightNumber || "EK211").toUpperCase(),
        tag_number: data.bagTag || "BG-1001",
        origin: data.origin || "DXB",
        destination: data.destination || "LHR",
        risk_category: risk,
        risk_score: score,
        created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // SAVE TO DATABASE
    baggageLogs.unshift(newRecord);
    localStorage.setItem(DB_KEY, JSON.stringify(baggageLogs));

    // Update the UI immediately
    updateDisplay(risk, score);
    renderTable();
    form.reset();
};

// 3. FETCH & RENDER (Displays data in your Monitoring Log)
function renderTable() {
    const logBody = document.getElementById('logBody');
    if (!logBody) return;

    // Update the Stat Boxes in the Hero Section
    document.getElementById('statsTotal').innerText = baggageLogs.length;
    document.getElementById('statsHigh').innerText = baggageLogs.filter(l => l.risk_category === "High").length;
    
    // Fill the Table
    logBody.innerHTML = baggageLogs.map(record => `
        <tr>
            <td><strong>${record.passenger_name}</strong></td>
            <td>${record.flight_number}</td>
            <td>${record.origin} → ${record.destination}</td>
            <td>${record.tag_number}</td>
            <td style="color:${record.risk_category === 'High' ? '#710C21' : '#A24C61'}; font-weight:800">${record.risk_category}</td>
            <td>${record.risk_score}%</td>
            <td>${record.created_at}</td>
        </tr>
    `).join('');
}

// 4. DELETE (The "Clear All" Button)
document.getElementById('clearAllBtn').onclick = () => {
    if(confirm("Wipe all database records?")) {
        baggageLogs = [];
        localStorage.removeItem(DB_KEY);
        renderTable();
    }
};

function updateDisplay(risk, score) {
    document.getElementById('heroStatus').innerText = risk === "High" ? "Alert" : "Secure";
    document.getElementById('riskScore').innerText = score + "%";
}

// Run on page load
document.getElementById('searchInput').oninput = renderTable;
renderTable();
