let count = 0, high = 0, total = 0;

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('assessmentForm');

    document.getElementById('fillSampleBtn').addEventListener('click', () => {
        const sample = {
            passengerName: "Aisha Rahman", bookingReference: "BRG472", bagTag: "BG-1001",
            flightNumber: "EK211", origin: "DXB", destination: "LHR", layoverMinutes: 55,
            transferPoints: 2, terminalDistance: 1200, incomingDelay: 18, checkedBags: 2
        };
        Object.keys(sample).forEach(k => form.elements[k].value = sample[k]);
    });

    document.getElementById('clearBtn').addEventListener('click', () => form.reset());

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form).entries());
        const score = Math.floor(Math.random() * 40) + 55;
        const isHigh = score > 75;

        count++; if(isHigh) high++; total += score;

        // UI Updates
        document.getElementById('statsTotal').innerText = count;
        document.getElementById('statsHigh').innerText = high;
        document.getElementById('statsAverage').innerText = Math.round(total/count) + "%";
        document.getElementById('riskBadge').innerText = isHigh ? "High Risk" : "Low Risk";
        document.getElementById('riskTitle').innerText = isHigh ? "Escalation Needed" : "On Schedule";
        document.getElementById('riskScore').innerText = score + "%";
        document.getElementById('heroRiskLabel').innerText = isHigh ? "Risk Alert" : "Clear";

        const row = `<tr>
            <td><strong>${data.passengerName}</strong></td><td>${data.flightNumber}</td>
            <td>${data.origin} → ${data.destination}</td><td>${data.bagTag}</td>
            <td style="color:${isHigh ? '#710C21' : 'inherit'}; font-weight:800">${isHigh?'High':'Low'}</td>
            <td>${score}%</td><td>${new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</td>
        </tr>`;
        document.getElementById('recordsTableBody').insertAdjacentHTML('afterbegin', row);
    });
});
