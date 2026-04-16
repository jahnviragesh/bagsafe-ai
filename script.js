let stats = { total: 0, high: 0, sumScore: 0 };

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('assessmentForm');
    
    document.getElementById('fillSampleBtn').addEventListener('click', () => {
        const sample = {
            passengerName: "Aisha Rahman",
            bookingReference: "BRG472",
            bagTag: "BG-1001",
            flightNumber: "EK211"
        };
        Object.keys(sample).forEach(key => form.elements[key].value = sample[key]);
    });

    document.getElementById('clearBtn').addEventListener('click', () => form.reset());

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form).entries());
        
        // Mock Logic
        const score = Math.floor(Math.random() * 50) + 45; 
        const isHigh = score > 75;

        stats.total++;
        if(isHigh) stats.high++;
        stats.sumScore += score;

        // Update Stats UI
        document.getElementById('statsTotal').innerText = stats.total;
        document.getElementById('statsHigh').innerText = stats.high;
        document.getElementById('statsAverage').innerText = Math.round(stats.sumScore/stats.total) + "%";

        // Update Summary Card
        document.getElementById('heroRiskLabel').innerText = isHigh ? "Risk Alert" : "Clear";
        document.getElementById('riskTitle').innerText = isHigh ? "High Risk" : "Low Risk";
        document.getElementById('riskScore').innerText = score + "%";
        document.getElementById('riskBadge').innerText = isHigh ? "Critical" : "Secure";

        // Update Table
        const row = `<tr>
            <td><strong>${data.passengerName}</strong></td>
            <td>${data.flightNumber}</td>
            <td>${data.bagTag}</td>
            <td style="color:${isHigh ? '#710C21' : 'inherit'}; font-weight:800">${isHigh ? 'High' : 'Low'}</td>
            <td>${score}%</td>
            <td>${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
        </tr>`;
        document.getElementById('recordsTableBody').insertAdjacentHTML('afterbegin', row);
    });
});
