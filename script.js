const STORAGE_KEY = "bagsafe-web-records-v1";

// ---------------- DOM ELEMENTS ----------------
const form = document.getElementById("assessmentForm");
const fillSampleBtn = document.getElementById("fillSampleBtn");
const clearBtn = document.getElementById("clearBtn");
const clearRecordsBtn = document.getElementById("clearRecordsBtn");
const searchInput = document.getElementById("searchInput");
const recordsTableBody = document.getElementById("recordsTableBody");

const riskBadge = document.getElementById("riskBadge");
const riskTitle = document.getElementById("riskTitle");
const riskScore = document.getElementById("riskScore");
const riskReason = document.getElementById("riskReason");
const recommendationList = document.getElementById("recommendationList");

const heroRiskLabel = document.getElementById("heroRiskLabel");
const heroRiskHint = document.getElementById("heroRiskHint");
const statsTotal = document.getElementById("statsTotal");
const statsHigh = document.getElementById("statsHigh");
const statsAverage = document.getElementById("statsAverage");

// ---------------- SAMPLE DATA (FIXED) ----------------
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

// ---------------- STATE ----------------
let records = loadRecords();

// ---------------- STORAGE ----------------
function loadRecords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveRecords() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

// ---------------- FORM HELPERS ----------------
function fillForm(data) {
  Object.entries(data).forEach(([key, value]) => {
    const field = form.elements.namedItem(key);
    if (!field) return;

    if (field.type === "checkbox") {
      field.checked = Boolean(value);
    } else {
      field.value = value;
    }
  });
}

function clearForm() {
  form.reset();
  form.elements.namedItem("internationalTransfer").checked = true;
}

function getFormData() {
  const data = new FormData(form);

  return {
    passengerName: String(data.get("passengerName") || "").trim(),
    bookingReference: String(data.get("bookingReference") || "").trim().toUpperCase(),
    bagTag: String(data.get("bagTag") || "").trim().toUpperCase(),
    flightNumber: String(data.get("flightNumber") || "").trim().toUpperCase(),
    origin: String(data.get("origin") || "").trim().toUpperCase(),
    destination: String(data.get("destination") || "").trim().toUpperCase(),
    layoverMinutes: Number(data.get("layoverMinutes")),
    transferPoints: Number(data.get("transferPoints")),
    terminalDistance: Number(data.get("terminalDistance")),
    incomingDelay: Number(data.get("incomingDelay")),
    checkedBags: Number(data.get("checkedBags")),
    baggageType: String(data.get("baggageType") || "transfer"),
    priorityStatus: form.elements.namedItem("priorityStatus").checked,
    internationalTransfer: form.elements.namedItem("internationalTransfer").checked,
  };
}

// ---------------- VALIDATION ----------------
function validate(data) {
  const required = [
    "passengerName",
    "bookingReference",
    "bagTag",
    "flightNumber",
    "origin",
    "destination",
  ];

  if (required.some((key) => !data[key])) {
    throw new Error("Please fill in all text fields.");
  }

  const numbers = [
    "layoverMinutes",
    "transferPoints",
    "terminalDistance",
    "incomingDelay",
    "checkedBags",
  ];

  if (numbers.some((key) => Number.isNaN(data[key]) || data[key] < 0)) {
    throw new Error("Please enter valid positive numbers.");
  }
}

// ---------------- SCORING ENGINE ----------------
function scoreAssessment(data) {
  let score = 14;
  const reasons = [];

  if (data.layoverMinutes < 45) {
    score += 34;
    reasons.push("Very short layover leaves little transfer time.");
  } else if (data.layoverMinutes < 75) {
    score += 20;
    reasons.push("Moderate layover needs closer coordination.");
  }

  if (data.incomingDelay > 35) {
    score += 24;
    reasons.push("Large incoming delay increases missed connection risk.");
  } else if (data.incomingDelay > 15) {
    score += 12;
    reasons.push("Some delay affecting schedule.");
  }

  if (data.terminalDistance > 1500) {
    score += 16;
    reasons.push("Long terminal distance slows baggage movement.");
  } else if (data.terminalDistance > 900) {
    score += 9;
    reasons.push("Moderate terminal distance adds pressure.");
  }

  if (data.transferPoints >= 3) {
    score += 12;
  } else if (data.transferPoints === 2) {
    score += 7;
  }

  if (data.checkedBags >= 3) {
    score += 6;
  }

  if (data.internationalTransfer) {
    score += 8;
  }

  if (data.baggageType === "fragile") {
    score += 6;
  }

  if (data.priorityStatus) {
    score -= 14;
    reasons.push("Priority handling reduces risk.");
  }

  score = Math.max(5, Math.min(97, Math.round(score)));

  let risk = "Low";
  if (score >= 70) risk = "High";
  else if (score >= 42) risk = "Medium";

  const recommendations = {
    Low: ["Standard processing", "No action needed", "Routine monitoring"],
    Medium: ["Flag for monitoring", "Notify transfer team", "Track bag closely"],
    High: ["Immediate escalation", "Manual supervision required", "Priority handling"],
  };

  return { risk, score, reasons, recommendations: recommendations[risk] };
}

// ---------------- RECORD ----------------
function buildRecord(data, result) {
  return {
    id: crypto.randomUUID(),
    ...data,
    risk: result.risk,
    score: result.score,
    savedAt: new Date().toLocaleString(),
  };
}

// ---------------- UI UPDATE ----------------
function updateSummary(result) {
  riskBadge.className = `risk-badge ${result.risk.toLowerCase()}`;
  riskBadge.textContent = `${result.risk} Risk`;
  riskTitle.textContent = `${result.risk} transfer probability`;
  riskScore.textContent = `Confidence score: ${result.score}%`;
  riskReason.textContent = result.reasons.join(" ");

  recommendationList.innerHTML = result.recommendations
    .map((r) => `<li>${r}</li>`)
    .join("");

  heroRiskLabel.textContent = result.risk;
  heroRiskHint.textContent = `${result.score}% confidence`;
}

// ---------------- STATS ----------------
function renderStats() {
  const total = records.length;
  const high = records.filter(r => r.risk === "High").length;
  const avg = total
    ? Math.round(records.reduce((s, r) => s + r.score, 0) / total)
    : 0;

  statsTotal.textContent = total;
  statsHigh.textContent = high;
  statsAverage.textContent = `${avg}%`;
}

// ---------------- TABLE ----------------
function renderTable() {
  const query = searchInput.value.trim().toLowerCase();

  const filtered = records.filter(r =>
    Object.values(r).join(" ").toLowerCase().includes(query)
  );

  if (!filtered.length) {
    recordsTableBody.innerHTML =
      `<tr><td colspan="7">No records found</td></tr>`;
    renderStats();
    return;
  }

  recordsTableBody.innerHTML = filtered.map(r => `
    <tr>
      <td><strong>${r.passengerName}</strong><br><small>${r.bookingReference}</small></td>
      <td>${r.flightNumber}</td>
      <td>${r.origin} → ${r.destination}</td>
      <td>${r.bagTag}</td>
      <td>${r.risk}</td>
      <td>${r.score}%</td>
      <td>${r.savedAt}</td>
    </tr>
  `).join("");

  renderStats();
}

// ---------------- EVENTS ----------------
form.addEventListener("submit", (e) => {
  e.preventDefault();

  try {
    const data = getFormData();
    validate(data);

    const result = scoreAssessment(data);
    const record = buildRecord(data, result);

    records.unshift(record);
    saveRecords();

    updateSummary(result);
    renderTable();
  } catch (err) {
    alert(err.message);
  }
});

// FIXED BUTTON (NO MORE BUG)
if (fillSampleBtn) {
  fillSampleBtn.addEventListener("click", () => {
    fillForm(sampleAssessment);
  });
}

clearBtn.addEventListener("click", clearForm);

clearRecordsBtn.addEventListener("click", () => {
  if (!confirm("Clear all records?")) return;
  records = [];
  saveRecords();
  renderTable();
});

searchInput.addEventListener("input", renderTable);

// ---------------- INIT ----------------
fillForm(sampleAssessment);
renderTable();
