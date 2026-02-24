(function () {
  var caseSummary = document.getElementById("case-summary");
  var form = document.getElementById("investigation-form");
  var output = document.getElementById("investigation-log");
  var arrestTimeInput = document.getElementById("arrest-time");
  var copyButton = document.getElementById("copy-log");

  var cautionText =
    "You do not have to say anything, but it may harm your defence if you do not mention when questioned something which you later rely on in court. Anything you do say may be given in evidence.";

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

  function getCheckedValues(name) {
    return Array.prototype.slice
      .call(document.querySelectorAll('input[name="' + name + '"]:checked'))
      .map(function (el) {
        return el.value;
      });
  }

  function renderSummary(caseData) {
    if (!caseData) {
      caseSummary.innerHTML = "<p class=\"muted\">No case loaded. Return to main page and generate an Action Card.</p>";
      return;
    }

    var offences = Array.isArray(caseData.likelyOffences) ? caseData.likelyOffences : [];
    var arrestReasons = Array.isArray(caseData.arrestReasons) ? caseData.arrestReasons : [];

    caseSummary.innerHTML =
      "<p><strong>Scene:</strong> " +
      (caseData.scene.location || "Unknown") +
      " | <strong>Risk:</strong> " +
      caseData.risk.level.toUpperCase() +
      " (" +
      caseData.risk.score +
      ")</p>" +
      "<p><strong>Local Log Time:</strong> " +
      caseData.log.local +
      " (" +
      caseData.log.timezone +
      ")</p>" +
      "<p><strong>Likely Offences:</strong> " +
      (offences.length ? offences.join("; ") : "None captured") +
      "</p>" +
      "<p><strong>Arrest Reasons:</strong> " +
      (arrestReasons.length ? arrestReasons.join("; ") : "No immediate necessity indicators") +
      "</p>";
  }

  function readForm(caseData) {
    var formData = new FormData(form);
    return {
      oic: formData.get("oic") || "Unassigned",
      suspectId: formData.get("suspectId") || "Unknown",
      custodyStatus: formData.get("custodyStatus"),
      arrestTime: formData.get("arrestTime") || caseData.log.local,
      cautionGiven: formData.get("cautionGiven") === "on",
      solicitorRequested: formData.get("solicitorRequested") === "on",
      appropriateAdult: formData.get("appropriateAdult") === "on",
      interviewPlan: formData.get("interviewPlan"),
      linesOfEnquiry: getCheckedValues("loe"),
      supervisorDirection: formData.get("supervisorDirection") || "",
      handoverNarrative: formData.get("handoverNarrative") || "",
    };
  }

  function prettyLineOfEnquiry(value) {
    var map = {
      bwv_download: "BWV download and evidential review",
      witness_statements: "Witness statement pack",
      cctv: "CCTV / ANPR retrieval",
      scene_forensics: "Scene forensics and continuity",
      vehicle_exam: "Vehicle examination and photo record",
      drug_weigh: "Drug weighing, bagging, and continuity labels",
      digital_intel: "Digital intelligence checks",
    };
    return map[value] || value;
  }

  function formatInterviewPlan(value) {
    var map = {
      prepared_interview: "Prepared interview under caution",
      initial_account_only: "Initial account interview only",
      no_comment_expected: "No-comment interview anticipated",
    };
    return map[value] || value;
  }

  function formatCustodyStatus(value) {
    var map = {
      detained_scene: "Detained at scene",
      in_custody: "In custody",
      voluntary_attendance: "Voluntary attendance",
      released_pending: "Released pending investigation",
    };
    return map[value] || value;
  }

  function buildLog(caseData, formValues) {
    var offences = Array.isArray(caseData.likelyOffences) ? caseData.likelyOffences : [];
    var sections = Array.isArray(caseData.sections) ? caseData.sections : [];
    var arrestReasons = Array.isArray(caseData.arrestReasons) ? caseData.arrestReasons : [];
    var evidence = Array.isArray(caseData.evidence) ? caseData.evidence : [];
    var disposals = Array.isArray(caseData.disposals) ? caseData.disposals : [];
    var lines = [];

    lines.push("EPICAL PD INVESTIGATION HANDOVER");
    lines.push("Generated: " + new Date().toLocaleString("en-GB", { hour12: false }));
    lines.push("");
    lines.push("1) Case Header");
    lines.push("OIC/Callsign: " + formValues.oic);
    lines.push("Suspect: " + formValues.suspectId);
    lines.push("Scene Location: " + (caseData.scene.location || "Unknown"));
    lines.push("Risk Band: " + caseData.risk.level.toUpperCase() + " (Score " + caseData.risk.score + ")");
    lines.push("Original Scene Log Time: " + caseData.log.local + " (" + caseData.log.timezone + ")");
    lines.push("Arrest/Detention Time: " + formValues.arrestTime);
    lines.push("Custody Status: " + formatCustodyStatus(formValues.custodyStatus));
    lines.push("");
    lines.push("2) Legal / Procedural");
    lines.push("Likely Offences: " + (offences.length ? offences.join("; ") : "None recorded"));
    lines.push("Sections Considered: " + (sections.length ? sections.join("; ") : "None recorded"));
    lines.push(
      "Arrest Necessity Indicators: " +
        (arrestReasons.length ? arrestReasons.join("; ") : "No immediate necessity indicators captured")
    );
    lines.push("Caution Given: " + (formValues.cautionGiven ? "Yes" : "No"));
    lines.push("Solicitor Requested: " + (formValues.solicitorRequested ? "Yes" : "No"));
    lines.push("Appropriate Adult Needed: " + (formValues.appropriateAdult ? "Yes" : "No"));
    lines.push("Interview Plan: " + formatInterviewPlan(formValues.interviewPlan));
    lines.push("PACE Caution Text: " + cautionText);
    lines.push("");
    lines.push("3) Evidence Strategy");
    lines.push("Immediate Evidence Checklist:");
    evidence.forEach(function (item, index) {
      lines.push((index + 1).toString() + ". " + item);
    });
    lines.push("");
    lines.push("Lines of Enquiry:");
    if (formValues.linesOfEnquiry.length === 0) {
      lines.push("1. None selected");
    } else {
      formValues.linesOfEnquiry.forEach(function (item, index) {
        lines.push((index + 1).toString() + ". " + prettyLineOfEnquiry(item));
      });
    }
    lines.push("");
    lines.push("4) Disposal Path (Action Card)");
    disposals.forEach(function (item, index) {
      var method = typeof item === "string" ? item : item.method;
      var reason = typeof item === "string" ? "Legacy record: reason not captured." : item.reason;
      var reference = typeof item === "string" ? "Legacy record" : item.ukReference;
      lines.push(
        (index + 1).toString() +
          ". " +
          method +
          " | Reason: " +
          reason +
          " | Ref: " +
          reference
      );
    });
    lines.push("");
    lines.push("5) Investigator Notes");
    lines.push("Supervisor Direction: " + (formValues.supervisorDirection || "None entered"));
    lines.push("Handover Narrative: " + (formValues.handoverNarrative || "None entered"));

    return lines.join("\n");
  }

  function handleGenerate(event, caseData) {
    event.preventDefault();
    var formValues = readForm(caseData);
    output.value = buildLog(caseData, formValues);
  }

  function init() {
    var caseData = getStoredCase();
    renderSummary(caseData);

    if (!caseData) {
      form.querySelectorAll("input,select,textarea,button").forEach(function (el) {
        el.disabled = true;
      });
      return;
    }

    arrestTimeInput.value = caseData.log.local;

    form.addEventListener("submit", function (event) {
      handleGenerate(event, caseData);
    });

    copyButton.addEventListener("click", function () {
      if (!output.value) return;
      navigator.clipboard.writeText(output.value).then(
        function () {
          copyButton.textContent = "Copied";
          setTimeout(function () {
            copyButton.textContent = "Copy Log";
          }, 1200);
        },
        function () {
          copyButton.textContent = "Copy failed";
          setTimeout(function () {
            copyButton.textContent = "Copy Log";
          }, 1200);
        }
      );
    });

    output.value = buildLog(caseData, readForm(caseData));
  }

  init();
})();
