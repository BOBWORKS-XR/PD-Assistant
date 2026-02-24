(function () {
  var caseSummary = document.getElementById("case-summary");
  var form = document.getElementById("investigation-form");
  var output = document.getElementById("investigation-log");
  var arrestTimeInput = document.getElementById("arrest-time");
  var arrestLocationInput = document.getElementById("arrest-location");
  var copyButton = document.getElementById("copy-log");
  var themeToggle = document.getElementById("theme-toggle");

  var cautionText =
    "You do not have to say anything, but it may harm your defence if you do not mention when questioned something which you later rely on in court. Anything you do say may be given in evidence.";

  function formatCityDateTime(dateObj) {
    var d = dateObj || new Date();
    var day = String(d.getDate()).padStart(2, "0");
    var month = String(d.getMonth() + 1).padStart(2, "0");
    var year = String(d.getFullYear()).slice(-2);
    var hours = String(d.getHours()).padStart(2, "0");
    var mins = String(d.getMinutes()).padStart(2, "0");
    return "[" + day + "/" + month + "/" + year + " " + hours + ":" + mins + "]";
  }

  function getStoredCase() {
    try {
      var raw = localStorage.getItem("epical_pd_last_case");
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      return parsed.caseData || null;
    } catch (error) {
      console.error("Unable to read stored case", error);
      return null;
    }
  }

  function applyTheme(theme) {
    document.body.classList.toggle("theme-dark", theme === "dark");
    if (themeToggle) {
      themeToggle.textContent = theme === "dark" ? "Light Mode" : "Dark Mode";
    }
  }

  function initTheme() {
    var saved = localStorage.getItem("epical_pd_theme");
    applyTheme(saved === "dark" ? "dark" : "light");
  }

  function toggleTheme() {
    var current = document.body.classList.contains("theme-dark") ? "dark" : "light";
    var next = current === "dark" ? "light" : "dark";
    localStorage.setItem("epical_pd_theme", next);
    applyTheme(next);
  }

  function renderSummary(caseData) {
    if (!caseData) {
      caseSummary.innerHTML = "<p class=\"muted\">No case loaded. Return to main page and generate an Action Card.</p>";
      return;
    }

    var offences = Array.isArray(caseData.likelyOffences) ? caseData.likelyOffences : [];
    var policy = caseData.cityPolicy || {};
    var speedLimit =
      caseData.scene.roadType === "motorway" ? policy.speedLimitMotorwayMph || 100 : policy.speedLimitUrbanMph || 50;
    var overLimit = Math.max(0, (caseData.scene.speedMph || 0) - speedLimit);

    caseSummary.innerHTML =
      "<p><strong>Scene:</strong> " +
      (caseData.scene.location || "Unknown") +
      " | <strong>Risk:</strong> " +
      caseData.risk.level.toUpperCase() +
      " (" +
      caseData.risk.score +
      ")</p>" +
      "<p><strong>Local Log:</strong> " +
      caseData.log.local +
      " (" +
      caseData.log.timezone +
      ")</p>" +
      "<p><strong>Likely Offences:</strong> " +
      (offences.length ? offences.join("; ") : "None captured") +
      "</p>" +
      "<p><strong>Speed Snapshot:</strong> " +
      caseData.scene.speedMph +
      " mph vs limit " +
      speedLimit +
      " mph (+" +
      overLimit +
      ")</p>";
  }

  function buildDefaultIncidentSummary(caseData) {
    var pieces = [];
    pieces.push("Subject was processed following the linked action-card scene.");
    if (caseData.scene.incidentType) {
      pieces.push("Incident type recorded as " + caseData.scene.incidentType.replace(/_/g, " ") + ".");
    }
    if (caseData.arrestReasons && caseData.arrestReasons.length) {
      pieces.push("Arrest necessity indicators included: " + caseData.arrestReasons.join("; ") + ".");
    }
    if (caseData.scene.notes) {
      pieces.push("Officer notes: " + caseData.scene.notes);
    }
    return pieces.join(" ");
  }

  function numberOrZero(value) {
    var parsed = Number(value);
    if (isNaN(parsed)) return 0;
    return parsed;
  }

  function readForm(caseData) {
    var fd = new FormData(form);
    return {
      arrestTime: fd.get("arrestTime") || formatCityDateTime(),
      arrestLocation: fd.get("arrestLocation") || caseData.scene.location || "Unknown",
      arrestingOfficer: fd.get("arrestingOfficer") || "Unknown",
      assistingOfficers: fd.get("assistingOfficers") || "None recorded",
      warrantNumbers: fd.get("warrantNumbers") || "None recorded",
      incidentSummary: fd.get("incidentSummary") || buildDefaultIncidentSummary(caseData),
      cellNumber: fd.get("cellNumber") || "N/A",
      custodyMinutes: numberOrZero(fd.get("custodyMinutes")),
      custodyBehavior: fd.get("custodyBehavior") || "No additional behavior notes entered.",
      bwvReviewer: fd.get("bwvReviewer") || "Not recorded",
      cautionGiven: fd.get("cautionGiven") === "yes",
      evidenceReview: fd.get("evidenceReview") || "No additional BWV review notes entered.",
      arrestReasonOverride: fd.get("arrestReasonOverride") || "",
      chargesText: fd.get("chargesText") || "",
      initialFine: numberOrZero(fd.get("initialFine")),
      initialJailMonths: numberOrZero(fd.get("initialJailMonths")),
      finalFine: numberOrZero(fd.get("finalFine")),
      finalJailMonths: numberOrZero(fd.get("finalJailMonths")),
      authorisedBy: fd.get("authorisedBy") || "Not recorded",
      additionalNotes: fd.get("additionalNotes") || "",
    };
  }

  function formatCurrency(amount) {
    return "£" + numberOrZero(amount).toLocaleString("en-GB");
  }

  function buildLog(caseData, formValues) {
    var lines = [];
    var sections = Array.isArray(caseData.sections) ? caseData.sections : [];
    var offences = Array.isArray(caseData.likelyOffences) ? caseData.likelyOffences : [];
    var disposals = Array.isArray(caseData.disposals) ? caseData.disposals : [];
    var evidence = Array.isArray(caseData.evidence) ? caseData.evidence : [];
    var arrestReasons =
      formValues.arrestReasonOverride.trim().length > 0
        ? [formValues.arrestReasonOverride.trim()]
        : Array.isArray(caseData.arrestReasons)
          ? caseData.arrestReasons
          : [];
    var policy = caseData.cityPolicy || {};
    var speedLimit = caseData.scene.roadType === "motorway" ? policy.speedLimitMotorwayMph || 100 : policy.speedLimitUrbanMph || 50;
    var overLimit = Math.max(0, (caseData.scene.speedMph || 0) - speedLimit);

    lines.push("ARREST DETAILS");
    lines.push("Date/Time: " + formValues.arrestTime);
    lines.push("Location: " + formValues.arrestLocation);
    lines.push("Arresting Officer: " + formValues.arrestingOfficer);
    lines.push("Assisting Officers: " + formValues.assistingOfficers);
    lines.push("");

    lines.push("INCIDENT SUMMARY");
    lines.push(formValues.incidentSummary);
    lines.push("");
    lines.push("Warrant number: " + formValues.warrantNumbers + ".");
    lines.push("");

    lines.push("ARREST REASONS");
    if (arrestReasons.length === 0) {
      lines.push("- None recorded from action card.");
    } else {
      arrestReasons.forEach(function (reason) {
        lines.push("- " + reason);
      });
    }
    lines.push("");

    lines.push("LEGAL REFERENCES");
    lines.push(sections.length ? sections.join("; ") : "No specific section recorded.");
    lines.push("");

    lines.push("OFFENCES / CHARGES");
    if (formValues.chargesText.trim()) {
      lines.push(formValues.chargesText.trim());
    } else {
      lines.push(offences.length ? offences.join("; ") : "No offence text entered.");
    }
    lines.push("");

    lines.push("DISPOSAL METHOD(S)");
    if (disposals.length === 0) {
      lines.push("1. None recorded.");
    } else {
      disposals.forEach(function (item, index) {
        var method = typeof item === "string" ? item : item.method;
        var reason = typeof item === "string" ? "Legacy reason not captured." : item.reason;
        var reference = typeof item === "string" ? "Legacy record" : item.ukReference;
        lines.push((index + 1).toString() + ". " + method + " | Reason: " + reason + " | Ref: " + reference);
      });
    }
    lines.push("");

    lines.push("CUSTODY DETAILS");
    lines.push("Cell number: " + formValues.cellNumber);
    lines.push("Time in custody: " + formValues.custodyMinutes + " minutes.");
    lines.push("Custody behavior: " + formValues.custodyBehavior);
    lines.push("");

    lines.push("EVIDENCE REVIEW");
    lines.push("BWV reviewed by: " + formValues.bwvReviewer + ".");
    lines.push("Review notes: " + formValues.evidenceReview);
    lines.push("Action-card evidence checklist:");
    if (evidence.length === 0) {
      lines.push("1. None recorded.");
    } else {
      evidence.forEach(function (entry, index) {
        lines.push((index + 1).toString() + ". " + entry);
      });
    }
    lines.push("");

    lines.push("CAUTION");
    lines.push("Caution delivered: " + (formValues.cautionGiven ? "Yes" : "No"));
    lines.push("Caution text: " + cautionText);
    lines.push("");

    lines.push("OUTCOME");
    lines.push(
      "Initial outcome, Fine " +
        formatCurrency(formValues.initialFine) +
        " Jail " +
        formValues.initialJailMonths +
        " months, reduced to Fine " +
        formatCurrency(formValues.finalFine) +
        " Jail " +
        formValues.finalJailMonths +
        " months. Authorised by " +
        formValues.authorisedBy +
        "."
    );
    lines.push("");

    lines.push("CITY POLICY NOTES");
    lines.push("- Speed limit in city is " + (policy.speedLimitUrbanMph || 50) + " mph and motorway is " + (policy.speedLimitMotorwayMph || 100) + " mph.");
    lines.push("- Recorded scene speed: " + caseData.scene.speedMph + " mph (+" + overLimit + " over local limit).");
    lines.push("- Cannabis <= " + (policy.cannabisConfiscationMaxGrams || 15) + "g typically routes to confiscation if no aggravating factors.");
    lines.push("- Cash <= GBP " + (policy.cashOkayMaxGbp || 10000) + " is generally acceptable within reason.");
    lines.push("- Traffic lights are usually treated as give-way when lane is clear.");
    lines.push("");

    lines.push("ADDITIONAL NOTES");
    lines.push(formValues.additionalNotes || "None entered.");

    return lines.join("\n");
  }

  function initDefaults(caseData) {
    arrestTimeInput.value = formatCityDateTime();
    arrestLocationInput.value = caseData.scene.location || "";

    var incidentSummary = form.querySelector('textarea[name="incidentSummary"]');
    var chargesText = form.querySelector('textarea[name="chargesText"]');
    var initialFine = form.querySelector('input[name="initialFine"]');
    var finalFine = form.querySelector('input[name="finalFine"]');
    var finalJail = form.querySelector('input[name="finalJailMonths"]');
    var charges = Array.isArray(caseData.likelyOffences) ? caseData.likelyOffences : [];

    incidentSummary.value = buildDefaultIncidentSummary(caseData);
    chargesText.value = charges.join("; ");

    if (caseData.scene.drugType === "cannabis" && caseData.scene.drugQuantityGrams > 0 && caseData.scene.drugQuantityGrams <= 15) {
      finalJail.value = "0";
    }
    if (caseData.scene.seizedCashGbp > 0 && caseData.scene.seizedCashGbp <= 10000) {
      initialFine.value = String(Math.min(10000, Math.round(caseData.scene.seizedCashGbp * 0.5)));
      finalFine.value = initialFine.value;
    }
  }

  function disableForm() {
    form.querySelectorAll("input,select,textarea,button").forEach(function (el) {
      el.disabled = true;
    });
  }

  function handleGenerate(event, caseData) {
    event.preventDefault();
    var values = readForm(caseData);
    output.value = buildLog(caseData, values);
  }

  function init() {
    initTheme();
    if (themeToggle) {
      themeToggle.addEventListener("click", toggleTheme);
    }

    var caseData = getStoredCase();
    renderSummary(caseData);

    if (!caseData) {
      disableForm();
      return;
    }

    initDefaults(caseData);
    output.value = buildLog(caseData, readForm(caseData));

    form.addEventListener("submit", function (event) {
      handleGenerate(event, caseData);
    });

    copyButton.addEventListener("click", function () {
      if (!output.value) return;
      navigator.clipboard.writeText(output.value).then(
        function () {
          copyButton.textContent = "Copied";
          setTimeout(function () {
            copyButton.textContent = "Copy Record";
          }, 1000);
        },
        function () {
          copyButton.textContent = "Copy failed";
          setTimeout(function () {
            copyButton.textContent = "Copy Record";
          }, 1000);
        }
      );
    });
  }

  init();
})();
