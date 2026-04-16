let assessments = { count: 0, high: 0, totalScore: 0 };

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('assessmentForm');

    // 1. Fill Sample Data Logic
    document.getElementById('fillSampleBtn').addEventListener('click', () => {
        const sampleData = {
            passengerName: "Aisha Rahman",
            bookingReference: "BRG472",
            bagTag: "BG-1001",
            flightNumber: "EK211",
            origin: "DXB",
            destination: "LHR",
            layoverMinutes: 55,
            transferPoints: 2,
            terminalDistance: 1200,
            incomingDelay: 18,
            checkedBags: 2,
            baggageType: "Transfer"
        };

        Object.keys(sampleData).forEach(key => {
            if (form.elements[key]) form.elements[key].value = sampleData[key];
        });
    });

    // 2. Clear Logic
    document.getElementById('clearBtn').addEventListener('click', () => form.reset());

    // 3. Prediction Execution
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form).entries());

        // Simple mock algorithm based on delay vs layover
        const delay = parseInt(data.incomingDelay) || 0;
        const layover = parseInt(data.layoverMinutes) || 1;
        let score = Math.floor((delay / layover) * 100) + Math.floor(Math.random() * 20);
        score = Math.min(score, 99); // Max 99%
        
        const isHigh = score > 65;

        // Update Stats State
        assessments.count++;
        if (isHigh) assessments.high++;
        assessments.totalScore += score;

        // Update Stats UI
        document.getElementById('statsTotal').innerText = assessments.count;
        document.getElementById('statsHigh').innerText = assessments.high;
        document.getElementById('statsAverage').innerText = Math.round(assessments.totalScore / assessments.count) + "%";

        // Update Summary UI
        const badge = document.getElementById('riskBadge');
        badge.innerText = isHigh ? "High Risk" : "Low Risk";
        badge.style.background = isHigh ? "#710C21" : "#E1C9D5";
        badge.style.color = isHigh ? "white" : "#710C21";
        
        document.getElementById('heroRiskLabel').innerText = isHigh ? "Risk Alert" : "Clear";
        document.getElementById('riskTitle').innerText = isHigh ? "Immediate Attention Needed" : "Bag is on Track";
        document.getElementById('riskScore').innerText = score + "%";

        // Add to Log Table
        const log = document.getElementById('recordsTableBody');
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const row = `
            <tr>
                <td><strong>${data.passengerName}</strong></td>
                <td>${data.flightNumber}</td>
                <td>${data.origin} → ${data.destination}</td>
                <td>${data.bagTag}</td>
                <td style="color: ${isHigh ? '#710C21' : 'inherit'}; font-weight: 800">${isHigh ? 'High' : 'Low'}</td>
                <td>${score}%</td>
                <td>${timestamp}</td>
            </tr>
        `;
        log.insertAdjacentHTML('afterbegin', row);
    });
});
