let count = 0, high = 0, totalScore = 0;

const form = document.getElementById('assessmentForm');

document.getElementById('fillSampleBtn').onclick = () => {
    const sample = { passengerName: "Aisha Rahman", bookingReference: "BRG472", bagTag: "BG-1001", flightNumber: "EK211", origin: "DXB", destination: "LHR", layoverMinutes: 55, transferPoints: 2, terminalDistance: 1200, incomingDelay: 18, checkedBags: 2 };
    Object.keys(sample).forEach(key => form.elements[key].value = sample[key]);
};

document.getElementById('clearBtn').onclick = () => form.reset();

form.onsubmit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const score = Math.floor(Math.random() * 40) + 55;
    const isHigh = score > 75;

    count++; if(isHigh) high++; totalScore += score;

    document.getElementById('statsTotal').innerText = count;
    document.getElementById('statsHigh').innerText = high;
    document.getElementById('statsAverage').innerText = Math.round(totalScore/count) + "%";
    
    document.getElementById('riskBadge').innerText = isHigh ? "High Alert" : "Secure";
    document.getElementById('riskTitle').innerText = isHigh ? "Escalate Immediately" : "On Track";
    document.getElementById('riskScore').innerText = score + "%";
    document.getElementById('heroRiskLabel').innerText = isHigh ? "Risk Alert" : "Clear";

    const row = `<tr>
        <td>${data.passengerName}</td><td>${data.flightNumber}</td>
        <td>${data.origin}→${data.destination}</td><td>${data.bagTag}</td>
        <td style="color:${isHigh?'red':'green'}">${isHigh?'HIGH':'LOW'}</td>
        <td>${score}%</td><td>${new Date().toLocaleTimeString()}</td>
    </tr>`;
    document.getElementById('recordsTableBody').insertAdjacentHTML('afterbegin', row);
};
