const STORAGE_KEY = "bagsafe-records";

// SAMPLE DATA (FIXED BUG)
const sampleAssessment = {
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
  baggageType: "transfer",
  priorityStatus: false,
  internationalTransfer: true,
};

const form = document.getElementById("assessmentForm");
const fillSampleBtn = document.getElementById("fillSampleBtn");
const clearBtn = document.getElementById("clearBtn");
const clearRecordsBtn = document.getElementById("clearRecordsBtn");
const searchInput = document.getElementById("searchInput");
const tableBody = document.getElementById("recordsTableBody");

const riskTitle = document.getElementById("riskTitle");
const riskScore = document.getElementById("riskScore");
const riskReason = document.getElementById("riskReason");
const recommendationList = document.getElementById("recommendationList");

const statsTotal = document.getElementById("statsTotal");
const statsHigh = document.getElementById("statsHigh");
const statsAverage = document.getElementById("statsAverage");

let records = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// ---------------- SAMPLE BUTTON ----------------
fillSampleBtn.onclick = () => fillForm(sampleAssessment);

// ---------------- CLEAR ----------------
clearBtn.onclick = () => form.reset();

// ---------------- CLEAR RECORDS ----------------
clearRecordsBtn.onclick = () => {
  if (!confirm("Clear all records?")) return;
  records = [];
  save();
  render();
};

// ---------------- FILL FORM ----------------
function fillForm(data) {
  Object.entries(data).forEach(([key, val]) => {
    if (form[key]) {
      if (form[key].type === "checkbox") form[key].checked = val;
      else form[key].value = val;
    }
  });
}

// ---------------- SAVE ----------------
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

// ---------------- AI LOGIC ----------------
function calculate(data) {
  let score = 10;

  score += data.incomingDelay * 1.5;
  score += data.transferPoints * 10;
  score += data.terminalDistance / 200;

  if (data.layoverMinutes < 45) score += 30;
  if (data.priorityStatus) score -= 15;

  score = Math.round(score);

  let risk = "Low";
  if (score >= 70) risk = "High";
  else if (score >= 40) risk = "Medium";

  return { risk, score };
}

// ---------------- SUBMIT ----------------
form.onsubmit = (e) => {
  e.preventDefault();

  const data = Object.fromEntries(new FormData(form));
  data.priorityStatus = form.priorityStatus.checked;
  data.internationalTransfer = form.internationalTransfer.checked;

  const result = calculate(data);

  riskTitle.textContent = result.risk;
  riskScore.textContent = "Score: " + result.score;

  const record = {
    ...data,
    risk: result.risk,
    score: result.score,
    time: new Date().toLocaleString(),
  };

  records.unshift(record);
  save();
  render();
};

// ---------------- RENDER ----------------
function render() {
  const q = searchInput.value.toLowerCase();

  const filtered = records.filter(r =>
    Object.values(r).join(" ").toLowerCase().includes(q)
  );

  tableBody.innerHTML = filtered.map(r => `
    <tr>
      <td>${r.passengerName}</td>
      <td>${r.flightNumber}</td>
      <td>${r.origin} → ${r.destination}</td>
      <td>${r.bagTag}</td>
      <td>${r.risk}</td>
      <td>${r.score}</td>
      <td>${r.time}</td>
    </tr>
  `).join("");

  statsTotal.textContent = records.length;
  statsHigh.textContent = records.filter(r => r.risk === "High").length;

  const avg = records.length
    ? Math.round(records.reduce((a, b) => a + b.score, 0) / records.length)
    : 0;

  statsAverage.textContent = avg + "%";
}

searchInput.oninput = render;

// INIT
render();
