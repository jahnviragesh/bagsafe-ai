const STORAGE_KEY = "bagsafe_final";
const form = document.getElementById('assessmentForm');
let records = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    
    let score = 15;
    if (Number(data.layover) < 45) score += 50;
    else if (Number(data.layover) < 75) score += 25;
    if (Number(data.delay) > 20) score += 20;
    if (Number(data.distance) > 1300) score += 15;
    if (data.type === "Priority" || form.elements.isPriority.checked) score -= 20;

    score = Math.max(5, Math.min(99, score));
    const risk = score > 70 ? "High" : score > 40 ? "Medium" : "Low";

    const newRecord = {
        passengerName: data.passengerName || "Unnamed",
        flightNumber: (data.flightNumber || "N/A").toUpperCase(),
        route: `${(data.origin || "???").toUpperCase()}→${(data.destination || "???").toUpperCase()}`,
        risk, score,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    records.unshift(newRecord);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    
    document.getElementById('riskBadge').innerText = risk;
    document.getElementById('riskScore').innerText = score + "%";
    document.getElementById('heroStatus').innerText = risk === "High" ? "Risk Alert" : "Ready";
    
    renderTable();
});

function renderTable() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = records.filter(r => r.passengerName.toLowerCase().includes(query));
    
    document.getElementById('statsTotal').innerText = records.length;
    document.getElementById('statsHigh').innerText = records.filter(r => r.risk === "High").length;
    document.getElementById('statsAvg').innerText = records.length ? Math.round(records.reduce((a, b) => a + b.score, 0) / records.length) + "%" : "0%";

    document.getElementById('logBody').innerHTML = filtered.map(r => `
        <tr>
            <td><strong>${r.passengerName}</strong></td><td>${r.flightNumber}</td>
            <td>${r.route}</td><td style="color:${r.risk === 'High' ? '#710C21' : '#2e7d32'}; font-weight:800">${r.risk}</td>
            <td>${r.score}%</td><td>${r.time}</td>
        </tr>`).join('');
}

document.getElementById('fillSampleBtn').onclick = () => {
    const s = { passengerName: "Aisha Rahman", flightNumber: "EK211", origin: "DXB", destination: "LHR", layover: 55, distance: 1200, delay: 18, bags: 2 };
    Object.keys(s).forEach(k => { if(form.elements[k]) form.elements[k].value = s[k]; });
};

document.getElementById('searchInput').oninput = renderTable;
renderTable();
