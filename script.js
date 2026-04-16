const STORAGE_KEY = "bagsafe-web-records-v1";


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

let records = loadRecords();

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

function fillForm(data) {
  Object.entries(data).forEach(([key, value]) => {
    const field = form.elements.namedItem(key);
    if (!field) return;
    if (field.type === "checkbox") {
      field.checked = Boolean(value);
      return;
    }
    field.value = value;
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
  if (data.layoverMinutes < 1 || data.transferPoints < 1 || data.checkedBags < 1) {
    throw new Error("Layover, transfer points, and checked bags must be greater than zero.");
  }
}

function scoreAssessment(data) {
  let score = 14;
  const reasons = [];

  if (data.layoverMinutes < 45) {
    score += 34;
    reasons.push("Very short layover leaves little transfer time.");
  } else if (data.layoverMinutes < 75) {
    score += 20;
    reasons.push("Moderate layover needs closer coordination.");
  } else {
    reasons.push("Layover duration gives the transfer team more time.");
  }

  if (data.incomingDelay > 35) {
    score += 24;
    reasons.push("Large incoming delay increases missed-connection risk.");
  } else if (data.incomingDelay > 15) {
    score += 12;
    reasons.push("Some incoming delay is already affecting the bag timeline.");
  }

  if (data.terminalDistance > 1500) {
    score += 16;
    reasons.push("Long terminal distance slows baggage movement.");
  } else if (data.terminalDistance > 900) {
    score += 9;
    reasons.push("Terminal distance adds operational pressure.");
  }

  if (data.transferPoints >= 3) {
    score += 12;
    reasons.push("Multiple transfer points add complexity.");
  } else if (data.transferPoints === 2) {
    score += 7;
    reasons.push("A connecting route adds some handling complexity.");
  }

  if (data.checkedBags >= 3) {
    score += 6;
    reasons.push("More checked bags can increase processing time.");
  }

  if (data.internationalTransfer) {
    score += 8;
    reasons.push("International transfer procedures may slow handling.");
  }

  if (data.baggageType === "fragile") {
    score += 6;
    reasons.push("Fragile handling usually requires extra care.");
  }

  if (data.baggageType === "transfer") {
    score += 4;
  }

  if (data.baggageType === "priority" || data.priorityStatus) {
    score -= 14;
    reasons.push("Priority handling lowers the transfer failure risk.");
  }

  score = Math.max(5, Math.min(97, Math.round(score)));

  let risk = "Low";
  if (score >= 70) {
    risk = "High";
  } else if (score >= 42) {
    risk = "Medium";
  }

  const recommendations = {
    Low: [
      "Proceed with standard baggage transfer workflow.",
      "Keep this bag in routine monitoring only.",
      "No urgent intervention is required right now.",
    ],
    Medium: [
      "Flag the bag for transfer desk monitoring.",
      "Notify the next handling point to expect a tighter connection.",
      "Keep this bag visible until the transfer is confirmed.",
    ],
    High: [
      "Escalate immediately for manual supervision.",
      "Prioritize loading coordination with the transfer team.",
      "Notify supervisors before the bag misses the connection window.",
    ],
  };

  return {
    risk,
    score,
    reasons,
    recommendations: recommendations[risk],
  };
}

function buildRecord(data, result) {
  return {
    id: crypto.randomUUID(),
    passengerName: data.passengerName,
    bookingReference: data.bookingReference,
    bagTag: data.bagTag,
    flightNumber: data.flightNumber,
    route: `${data.origin}-${data.destination}`,
    baggageType: data.baggageType,
    risk: result.risk,
    score: result.score,
    savedAt: new Date().toLocaleString(),
  };
}

function updateSummary(result) {
  riskBadge.className = `risk-badge ${result.risk.toLowerCase()}`;
  riskBadge.textContent = `${result.risk} Risk`;
  riskTitle.textContent = `${result.risk} transfer probability detected`;
  riskScore.textContent = `Confidence score: ${result.score}%`;
  riskReason.textContent = result.reasons.join(" ");
  recommendationList.innerHTML = result.recommendations.map((item) => `<li>${item}</li>`).join("");

  heroRiskLabel.textContent = result.risk;
  heroRiskHint.textContent = `${result.score}% confidence from the latest assessment`;
}

function renderStats() {
  const total = records.length;
  const high = records.filter((record) => record.risk === "High").length;
  const average = total
    ? Math.round(records.reduce((sum, record) => sum + record.score, 0) / total)
    : 0;

  statsTotal.textContent = total;
  statsHigh.textContent = high;
  statsAverage.textContent = `${average}%`;
}

function renderTable() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = records.filter((record) => {
    const haystack = [
      record.passengerName,
      record.flightNumber,
      record.route,
      record.bagTag,
      record.risk,
      record.bookingReference,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });

  if (!filtered.length) {
    recordsTableBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="7">No saved assessments yet. Run a prediction to populate this table.</td>
      </tr>
    `;
    renderStats();
    return;
  }

  recordsTableBody.innerHTML = filtered
    .map(
      (record) => `
        <tr>
          <td>
            <strong>${escapeHtml(record.passengerName)}</strong><br />
            <small>${escapeHtml(record.bookingReference)}</small>
          </td>
          <td>${escapeHtml(record.flightNumber)}</td>
          <td>${escapeHtml(record.route)}</td>
          <td>${escapeHtml(record.bagTag)}<br /><small>${escapeHtml(record.baggageType)}</small></td>
          <td><span class="pill-cell pill-${record.risk.toLowerCase()}">${record.risk}</span></td>
          <td>${record.score}%</td>
          <td>${escapeHtml(record.savedAt)}</td>
        </tr>
      `
    )
    .join("");

  renderStats();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  try {
    const data = getFormData();
    validate(data);
    const result = scoreAssessment(data);
    const record = buildRecord(data, result);

    records = [record, ...records];
    saveRecords();
    updateSummary(result);
    renderTable();
  } catch (error) {
    window.alert(error.message);
  }
});

fillSampleBtn.addEventListener("click", () => {
  fillForm(sampleAssessment);
});

clearBtn.addEventListener("click", () => {
  clearForm();
});

clearRecordsBtn.addEventListener("click", () => {
  const confirmed = window.confirm("Clear all saved assessments from this browser?");
  if (!confirmed) return;
  records = [];
  saveRecords();
  renderTable();
});

searchInput.addEventListener("input", renderTable);

fillForm(sampleAssessment);
renderTable();
