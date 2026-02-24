(function () {
  var caseSummary = document.getElementById("case-summary");
  var form = document.getElementById("investigation-form");
  var output = document.getElementById("investigation-log");
  var opsBar = document.getElementById("ops-bar");
  var opsTopPoint = document.getElementById("ops-top-point");
  var opsUrgentAction = document.getElementById("ops-urgent-action");
  var opsKeySection = document.getElementById("ops-key-section");
  var opsNextStep = document.getElementById("ops-next-step");
  var opsOfficer = document.getElementById("ops-officer");
  var opsOfficerPatrol = document.getElementById("ops-officer-patrol");
  var opsSuspects = document.getElementById("ops-suspects");
  var stampStopBtn = document.getElementById("stamp-stop-btn");
  var stampSearchBtn = document.getElementById("stamp-search-btn");
  var stampArrestBtn = document.getElementById("stamp-arrest-btn");
  var opsCollapseBtn = document.getElementById("ops-collapse-btn");
  var opsExportBtn = document.getElementById("ops-export-btn");
  var opsClearBtn = document.getElementById("ops-clear-btn");
  var opsDisclaimer = document.querySelector(".ops-disclaimer");
  var opsDisclaimerCloseBtn = document.querySelector(".ops-disclaimer-close");
  var arrestTimeInput = document.getElementById("arrest-time");
  var arrestLocationInput = document.getElementById("arrest-location");
  var timeStopInput = document.getElementById("time-stop");
  var timeSearchInput = document.getElementById("time-search");
  var timeArrestEventInput = document.getElementById("time-arrest-event");
  var copyButton = document.getElementById("copy-log");
  var themeToggle = document.getElementById("theme-toggle");
  var TIMELINE_KEY = "epical_pd_timeline";
  var FORM_CACHE_KEY = "epical_pd_investigation_form_v1";
  var OPS_COLLAPSE_KEY = "epical_pd_ops_bar_collapsed_investigation";
  var GENERATED_CRIME_REPORT_KEY = "epical_pd_generated_crime_report";

  var cautionText =
    "You do not have to say anything, but it may harm your defence if you do not mention when questioned something which you later rely on in court. Anything you do say may be given in evidence.";

  function getUkDateParts(dateObj) {
    var formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    var parts = formatter.formatToParts(dateObj || new Date());
    var map = {};
    parts.forEach(function (part) {
      if (part.type !== "literal") {
        map[part.type] = part.value;
      }
    });
    return map;
  }

  function formatCityDateTime(dateObj) {
    var uk = getUkDateParts(dateObj || new Date());
    return "[" + uk.day + "/" + uk.month + "/" + uk.year + " " + uk.hour + ":" + uk.minute + "]";
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

  function getStoredTimeline() {
    try {
      var raw = localStorage.getItem(TIMELINE_KEY);
      if (!raw) return { timeStop: "", timeSearch: "", timeArrestEvent: "" };
      var parsed = JSON.parse(raw);
      return {
        timeStop: parsed.timeStop || "",
        timeSearch: parsed.timeSearch || "",
        timeArrestEvent: parsed.timeArrestEvent || "",
      };
    } catch (error) {
      console.error("Unable to read stored timeline", error);
      return { timeStop: "", timeSearch: "", timeArrestEvent: "" };
    }
  }

  function saveStoredTimeline(timeline) {
    try {
      localStorage.setItem(TIMELINE_KEY, JSON.stringify(timeline));
    } catch (error) {
      console.error("Unable to save timeline", error);
    }
  }

  function setStampButtonText(button, label, value) {
    if (!button) return;
    button.textContent = label + "\n" + (value || "Not stamped");
  }

  function renderTimelineLabels(timeline) {
    setStampButtonText(stampStopBtn, "STOP", timeline.timeStop);
    setStampButtonText(stampSearchBtn, "SEARCH", timeline.timeSearch);
    setStampButtonText(stampArrestBtn, "ARREST", timeline.timeArrestEvent);
  }

  function stampTimelineField(key) {
    var timeline = getStoredTimeline();
    var stamp = formatCityDateTime();
    timeline[key] = stamp;
    saveStoredTimeline(timeline);
    renderTimelineLabels(timeline);

    if (timeStopInput && key === "timeStop") timeStopInput.value = stamp;
    if (timeSearchInput && key === "timeSearch") timeSearchInput.value = stamp;
    if (timeArrestEventInput && key === "timeArrestEvent") timeArrestEventInput.value = stamp;
    if (key === "timeArrestEvent" && arrestTimeInput) {
      arrestTimeInput.value = stamp;
    }
  }

  function saveGeneratedCrimeReport(text) {
    try {
      localStorage.setItem(GENERATED_CRIME_REPORT_KEY, text || "");
    } catch (error) {
      console.error("Unable to save generated crime report", error);
    }
  }

  function buildExportFileName() {
    var stamp = formatCityDateTime(new Date()).replace(/[^\d]/g, "");
    return "epical-pd-export-" + (stamp || String(Date.now())) + ".md";
  }

  function triggerDownload(filename, content) {
    var blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function buildInvestigationExportText() {
    var summaryText = caseSummary ? (caseSummary.innerText || "").trim() : "";
    var crimeReportText = output ? (output.value || "").trim() : "";

    if (!crimeReportText) {
      crimeReportText = "No generated crime report yet.";
    }

    return [
      "# EPICAL PD Export",
      "",
      "Generated (UK): " + formatCityDateTime(new Date()),
      "",
      "## Investigation Summary",
      summaryText || "No investigation summary available.",
      "",
      "## Generated Crime Report",
      crimeReportText,
      "",
    ].join("\n");
  }

  function bindTopStampButtons(caseData) {
    function maybeRefresh() {
      if (caseData) {
        refreshOutput(caseData);
      }
    }

    if (stampStopBtn) {
      stampStopBtn.addEventListener("click", function () {
        stampTimelineField("timeStop");
        maybeRefresh();
      });
    }
    if (stampSearchBtn) {
      stampSearchBtn.addEventListener("click", function () {
        stampTimelineField("timeSearch");
        maybeRefresh();
      });
    }
    if (stampArrestBtn) {
      stampArrestBtn.addEventListener("click", function () {
        stampTimelineField("timeArrestEvent");
        maybeRefresh();
      });
    }
  }

  function clearAllCachedData() {
    [
      "epical_pd_scene_form_v1",
      "epical_pd_investigation_form_v1",
      "epical_pd_officer_profile",
      "epical_pd_timeline",
      "epical_pd_last_case",
      "epical_pd_generated_crime_report",
      "epical_pd_ops_bar_collapsed_assistant",
      "epical_pd_ops_bar_collapsed_investigation",
    ].forEach(function (key) {
      localStorage.removeItem(key);
    });
  }

  function saveInvestigationFormCache(values) {
    try {
      localStorage.setItem(FORM_CACHE_KEY, JSON.stringify(values));
    } catch (error) {
      console.error("Unable to save investigation form cache", error);
    }
  }

  function setNamedControlValue(name, value) {
    var controls = Array.prototype.slice.call(form.querySelectorAll('[name="' + name + '"]'));
    if (controls.length === 0) return;
    var first = controls[0];

    if (first.type === "checkbox") {
      first.checked = Boolean(value);
      return;
    }
    if (first.type === "radio") {
      controls.forEach(function (control) {
        control.checked = String(control.value) === String(value);
      });
      return;
    }

    first.value = value != null ? String(value) : "";
  }

  function restoreInvestigationFormCache() {
    try {
      var raw = localStorage.getItem(FORM_CACHE_KEY);
      if (!raw) return;
      var cached = JSON.parse(raw);
      if (!cached || typeof cached !== "object") return;
      Object.keys(cached).forEach(function (key) {
        setNamedControlValue(key, cached[key]);
      });
    } catch (error) {
      console.error("Unable to restore investigation form cache", error);
    }
  }

  function getDisposalLabel(disposal) {
    if (!disposal) return "";
    if (typeof disposal === "string") return disposal;
    return disposal.method || "";
  }

  function setOpsValue(el, shortValue, fullValue) {
    if (!el) return;
    var shortText = String(shortValue || "").trim();
    var fullText = String(fullValue || shortText).trim();
    el.dataset.short = shortText;
    el.dataset.full = fullText;
    var parent = el.closest(".ops-cell");
    el.textContent = parent && parent.classList.contains("is-expanded") ? fullText : shortText;
  }

  function bindOpsCellExpansion() {
    if (!opsBar) return;
    var cells = Array.prototype.slice.call(opsBar.querySelectorAll(".ops-cell"));
    cells.forEach(function (cell) {
      cell.setAttribute("role", "button");
      cell.tabIndex = 0;
      cell.setAttribute("aria-expanded", "false");

      function toggle() {
        var expand = !cell.classList.contains("is-expanded");
        cells.forEach(function (other) {
          other.classList.remove("is-expanded");
          other.setAttribute("aria-expanded", "false");
          var valueEl = other.querySelector(".ops-value");
          if (valueEl) {
            valueEl.textContent = valueEl.dataset.short || valueEl.textContent;
          }
        });
        if (!expand) return;
        cell.classList.add("is-expanded");
        cell.setAttribute("aria-expanded", "true");
        var expandedValue = cell.querySelector(".ops-value");
        if (expandedValue) {
          expandedValue.textContent = expandedValue.dataset.full || expandedValue.textContent;
        }
        syncOpsBarOffset();
      }

      cell.addEventListener("click", toggle);
      cell.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggle();
        }
      });
    });
  }

  function applyTheme(theme) {
    document.body.classList.toggle("theme-dark", theme === "dark");
    if (themeToggle) {
      themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
      themeToggle.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    }
  }

  function initTheme() {
    var saved = localStorage.getItem("epical_pd_theme");
    var osPrefersDark =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    var theme = saved === "dark" || saved === "light" ? saved : osPrefersDark ? "dark" : "light";
    applyTheme(theme);
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
      "<p><strong>Officer:</strong> " +
      formatOfficerIdentity(caseData) +
      " | <strong>Suspects:</strong> " +
      formatSuspectSummary(caseData) +
      "</p>" +
      "<p><strong>Scene:</strong> " +
      (caseData.scene.location || "Unknown") +
      " | <strong>Risk:</strong> " +
      caseData.risk.level.toUpperCase() +
      " (" +
      caseData.risk.score +
      ")</p>" +
      "<p><strong>UK Log:</strong> " +
      caseData.log.local +
      " (" +
      caseData.log.timezone +
      ")</p>" +
      "<p><strong>Server Timezone:</strong> Europe/London (UK)</p>" +
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

  function updateOpsMeta(caseData) {
    if (!caseData) return;
    if (opsOfficer && caseData.officerProfile) {
      opsOfficer.textContent = "Officer: " + caseData.officerProfile.display;
    }
    if (opsOfficerPatrol && caseData.officerProfile) {
      opsOfficerPatrol.textContent = "Officer Patrol: " + caseData.officerProfile.patrolLabel;
    }
    if (opsSuspects) {
      opsSuspects.textContent = "Suspects: " + formatSuspectSummary(caseData);
    }

    if (caseData.topBarSummary) {
      setOpsValue(
        opsTopPoint,
        caseData.topBarSummary.topPoint,
        caseData.triggerPointers && caseData.triggerPointers.length > 0 ? caseData.triggerPointers[0].title : caseData.topBarSummary.topPoint
      );
      setOpsValue(
        opsUrgentAction,
        caseData.topBarSummary.urgentAction,
        caseData.immediateActions && caseData.immediateActions.length > 0
          ? caseData.immediateActions[0]
          : caseData.topBarSummary.urgentAction
      );
      setOpsValue(
        opsKeySection,
        caseData.topBarSummary.keySection,
        caseData.sections && caseData.sections.length > 0 ? caseData.sections[0] : caseData.topBarSummary.keySection
      );
      setOpsValue(
        opsNextStep,
        caseData.topBarSummary.nextStep,
        caseData.disposals && caseData.disposals.length > 0 ? getDisposalLabel(caseData.disposals[0]) : caseData.topBarSummary.nextStep
      );
    }
  }

  function formatOfficerIdentity(caseData) {
    if (caseData && caseData.officerProfile) {
      return caseData.officerProfile.display + " (" + caseData.officerProfile.patrolLabel + ")";
    }
    return "Unknown";
  }

  function formatSuspectSummary(caseData) {
    if (caseData && Array.isArray(caseData.scene.suspectNames) && caseData.scene.suspectNames.length > 0) {
      return caseData.scene.suspectNames.join(", ");
    }
    if (caseData && caseData.suspectSummary) return caseData.suspectSummary;
    return "unknown";
  }

  function buildDefaultIncidentSummary(caseData) {
    var pieces = [];
    pieces.push("Subject was processed following the linked action-card scene.");
    if (caseData.scene.incidentType) {
      pieces.push("Incident type recorded as " + caseData.scene.incidentType.replace(/_/g, " ") + ".");
    }
    if (Array.isArray(caseData.scene.suspectNames) && caseData.scene.suspectNames.length > 0) {
      pieces.push("Suspect list: " + caseData.scene.suspectNames.join(", ") + ".");
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
    var timeline = getStoredTimeline();
    return {
      arrestTime: fd.get("arrestTime") || fd.get("timeArrestEvent") || timeline.timeArrestEvent || formatCityDateTime(),
      timeStop: fd.get("timeStop") || timeline.timeStop || "",
      timeSearch: fd.get("timeSearch") || timeline.timeSearch || "",
      timeArrestEvent: fd.get("timeArrestEvent") || fd.get("arrestTime") || timeline.timeArrestEvent || "",
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
      evidenceReview: fd.get("evidenceReview") || "No additional Bodycam (BVW) review notes entered.",
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
    return "GBP " + numberOrZero(amount).toLocaleString("en-GB");
  }

  function buildLog(caseData, formValues) {
    var lines = [];
    var sections = Array.isArray(caseData.sections) ? caseData.sections : [];
    var offences = Array.isArray(caseData.likelyOffences) ? caseData.likelyOffences : [];
    var paceTriggers = Array.isArray(caseData.paceTriggers) ? caseData.paceTriggers : [];
    var necessityChecklist = Array.isArray(caseData.necessityChecklist) ? caseData.necessityChecklist : [];
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
    lines.push("Suspects: " + formatSuspectSummary(caseData));
    lines.push("");

    lines.push("TIMELINE STAMPS (UK)");
    lines.push("Time of stop: " + (formValues.timeStop || "Not stamped"));
    lines.push("Time of search: " + (formValues.timeSearch || "Not stamped"));
    lines.push("Time of arrest: " + (formValues.timeArrestEvent || "Not stamped"));
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

    lines.push("IDENTITY / COMPLIANCE FACTORS");
    if (caseData.scene.refusesProvideId) lines.push("- Not willing to provide ID / name / address.");
    if (caseData.scene.suspectedFalseIdentity) lines.push("- Suspected false details provided.");
    if (caseData.scene.noFixedAddress) lines.push("- No fixed/verifiable address.");
    if (caseData.scene.obstructiveConduct) lines.push("- Obstructive or persistent non-compliance.");
    if (caseData.scene.refusesVehicleDocs) lines.push("- Vehicle docs/details refused on request.");
    if (caseData.scene.vehiclePulledOver) lines.push("- Lawful vehicle stop context marked as active.");
    if (caseData.scene.faceCoveringPresent) lines.push("- Face covering present.");
    if (caseData.scene.refusesRemoveFaceCovering) lines.push("- Refusal to remove face covering recorded.");
    if (
      !caseData.scene.refusesProvideId &&
      !caseData.scene.suspectedFalseIdentity &&
      !caseData.scene.noFixedAddress &&
      !caseData.scene.obstructiveConduct &&
      !caseData.scene.refusesVehicleDocs &&
      !caseData.scene.faceCoveringPresent &&
      !caseData.scene.refusesRemoveFaceCovering
    ) {
      lines.push("- No elevated identity/compliance factors recorded.");
    }
    if (caseData.identityContext) {
      lines.push("- ID expectation: " + caseData.identityContext.idBasis);
      lines.push("- Face-covering power context: " + caseData.identityContext.faceCoveringBasis);
      lines.push(
        "- Vehicle stop context: " +
          (caseData.identityContext.activeVehicleStop ? "Lawful vehicle-stop context active." : "Lawful vehicle-stop context not confirmed.")
      );
    }
    lines.push("");

    lines.push("IDCOPPLAN NECESSITY SUMMARY");
    if (necessityChecklist.length === 0) {
      lines.push("- No active IDCOPPLAN necessity indicator recorded.");
    } else {
      necessityChecklist.forEach(function (item) {
        var code = item.code === "P2" ? "P" : item.code;
        lines.push("- " + code + " | " + item.title + " (" + item.paceRef + ")");
      });
    }
    lines.push("");

    lines.push("LEGAL REFERENCES");
    lines.push(sections.length ? sections.join("; ") : "No specific section recorded.");
    if (paceTriggers.length) {
      lines.push("PACE Trigger Summary: " + paceTriggers.join(" | "));
    }
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
    lines.push("Bodycam (BVW) reviewed by: " + formValues.bwvReviewer + ".");
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
    var timeline = getStoredTimeline();
    arrestTimeInput.value = timeline.timeArrestEvent || formatCityDateTime();
    arrestLocationInput.value = caseData.scene.location || "";
    if (timeStopInput) timeStopInput.value = timeline.timeStop || "";
    if (timeSearchInput) timeSearchInput.value = timeline.timeSearch || "";
    if (timeArrestEventInput) timeArrestEventInput.value = timeline.timeArrestEvent || arrestTimeInput.value;

    var incidentSummary = form.querySelector('textarea[name="incidentSummary"]');
    var chargesText = form.querySelector('textarea[name="chargesText"]');
    var arrestingOfficer = form.querySelector('input[name="arrestingOfficer"]');
    var initialFine = form.querySelector('input[name="initialFine"]');
    var finalFine = form.querySelector('input[name="finalFine"]');
    var finalJail = form.querySelector('input[name="finalJailMonths"]');
    var charges = Array.isArray(caseData.likelyOffences) ? caseData.likelyOffences : [];

    incidentSummary.value = buildDefaultIncidentSummary(caseData);
    chargesText.value = charges.join("; ");
    arrestingOfficer.value = caseData.officerProfile ? caseData.officerProfile.display : "";

    if (caseData.scene.drugType === "cannabis" && caseData.scene.drugQuantityGrams > 0 && caseData.scene.drugQuantityGrams <= 15) {
      finalJail.value = "0";
    }
    if (caseData.scene.seizedCashGbp > 0 && caseData.scene.seizedCashGbp <= 10000) {
      initialFine.value = String(Math.min(10000, Math.round(caseData.scene.seizedCashGbp * 0.5)));
      finalFine.value = initialFine.value;
    }
  }

  function refreshOutput(caseData) {
    var values = readForm(caseData);
    var report = buildLog(caseData, values);
    output.value = report;
    saveGeneratedCrimeReport(report);
    saveInvestigationFormCache(values);
  }

  function syncOpsBarOffset() {
    if (!opsBar) return;
    var h = opsBar.offsetHeight || 90;
    document.documentElement.style.setProperty("--ops-bar-offset", h + 8 + "px");
  }

  function setOpsBarCollapsed(collapsed) {
    if (!opsBar) return;
    opsBar.classList.toggle("is-collapsed", collapsed);
    if (opsCollapseBtn) {
      opsCollapseBtn.textContent = collapsed ? "\\/" : "/\\";
      opsCollapseBtn.setAttribute("aria-expanded", String(!collapsed));
      opsCollapseBtn.setAttribute("aria-label", collapsed ? "Expand top bar" : "Collapse top bar");
    }
    localStorage.setItem(OPS_COLLAPSE_KEY, collapsed ? "1" : "0");
    syncOpsBarOffset();
  }

  function bindDisclaimerDismiss() {
    if (!opsDisclaimer || !opsDisclaimerCloseBtn) return;
    opsDisclaimerCloseBtn.addEventListener("click", function () {
      opsDisclaimer.classList.add("is-dismissed");
      syncOpsBarOffset();
    });
  }

  function bindOpsBarActions() {
    var savedState = localStorage.getItem(OPS_COLLAPSE_KEY);
    var collapsed = savedState === null ? true : savedState === "1";
    setOpsBarCollapsed(collapsed);

    if (opsCollapseBtn) {
      opsCollapseBtn.addEventListener("click", function () {
        var next = !opsBar.classList.contains("is-collapsed");
        setOpsBarCollapsed(next);
      });
    }

    if (opsClearBtn) {
      opsClearBtn.addEventListener("click", function () {
        var confirmed = window.confirm("Clear all saved form data and timeline stamps?");
        if (!confirmed) return;
        clearAllCachedData();
        window.location.reload();
      });
    }

    if (opsExportBtn) {
      opsExportBtn.addEventListener("click", function () {
        var content = buildInvestigationExportText();
        triggerDownload(buildExportFileName(), content);
      });
    }
  }

  function disableForm() {
    form.querySelectorAll("input,select,textarea,button").forEach(function (el) {
      el.disabled = true;
    });
  }

  function handleGenerate(event, caseData) {
    event.preventDefault();
    refreshOutput(caseData);
  }

  function init() {
    initTheme();
    window.addEventListener("resize", syncOpsBarOffset);
    bindDisclaimerDismiss();
    bindOpsCellExpansion();
    bindOpsBarActions();
    renderTimelineLabels(getStoredTimeline());

    if (themeToggle) {
      themeToggle.addEventListener("click", toggleTheme);
    }

    var caseData = getStoredCase();
    bindTopStampButtons(caseData);
    renderSummary(caseData);
    updateOpsMeta(caseData);

    if (!caseData) {
      disableForm();
      syncOpsBarOffset();
      return;
    }

    initDefaults(caseData);
    restoreInvestigationFormCache();
    refreshOutput(caseData);

    form.addEventListener("submit", function (event) {
      handleGenerate(event, caseData);
    });

    form.addEventListener("input", function () {
      refreshOutput(caseData);
    });

    form.addEventListener("change", function () {
      refreshOutput(caseData);
    });

    copyButton.addEventListener("click", function () {
      if (!output.value) return;
      navigator.clipboard.writeText(output.value).then(
        function () {
          copyButton.textContent = "Copied";
          setTimeout(function () {
            copyButton.textContent = "Copy Generated Crime Report";
          }, 1000);
        },
        function () {
          copyButton.textContent = "Copy failed";
          setTimeout(function () {
            copyButton.textContent = "Copy Generated Crime Report";
          }, 1000);
        }
      );
    });

    syncOpsBarOffset();
  }

  init();
})();

