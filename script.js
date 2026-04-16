const form = document.getElementById("assessmentForm");
const fillSampleBtn = document.getElementById("fillSampleBtn");
const clearBtn = document.getElementById("clearBtn");
const table = document.getElementById("recordsTableBody");

const riskTitle = document.getElementById("riskTitle");
const riskScore = document.getElementById("riskScore");

// SAMPLE DATA
const sample = {
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
};

// SAMPLE BUTTON
fillSampleBtn.onclick = () => {
  Object.entries(sample).forEach(([key, value]) => {
    form.elements[key].value = value;
  });
};

// CLEAR
clearBtn.onclick = () => form.reset();

// SIMPLE AI LOGIC
function calculateRisk(data) {
  let score = data.incomingDelay + data.transferPoints * 10;

  if (score < 30) return { risk: "Low", score };
  if (score < 70) return { risk: "Medium", score };
  return { risk: "High", score };
}

// SUBMIT
form.onsubmit = (e) => {
  e.preventDefault();

  const data = Object.fromEntries(new FormData(form));
  const result = calculateRisk(data);

  riskTitle.textContent = result.risk;
  riskScore.textContent = "Score: " + result.score;

  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${data.passengerName}</td>
    <td>${data.flightNumber}</td>
    <td>${result.risk}</td>
  `;

  table.appendChild(row);
};
