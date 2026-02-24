(function () {
  var form = document.getElementById("scene-form");
  var result = document.getElementById("result");
  var contextStrip = document.getElementById("context-strip");
  var themeToggle = document.getElementById("theme-toggle");
  var opsBar = document.getElementById("ops-bar");
  var opsTopPoint = document.getElementById("ops-top-point");
  var opsUrgentAction = document.getElementById("ops-urgent-action");
  var opsKeySection = document.getElementById("ops-key-section");
  var opsNextStep = document.getElementById("ops-next-step");
  var opsOfficer = document.getElementById("ops-officer");
  var opsOfficerPatrol = document.getElementById("ops-officer-patrol");
  var opsSuspects = document.getElementById("ops-suspects");
  var suspectList = document.getElementById("suspect-list");
  var addSuspectBtn = document.getElementById("add-suspect");
  var officerNameInput = form.querySelector('input[name="officerName"]');
  var officerRankInput = form.querySelector('select[name="officerRank"]');
  var officerNumberInput = form.querySelector('input[name="officerNumber"]');
  var officerPatrolInput = form.querySelector('select[name="officerPatrolMode"]');
  var officerCallsignInput = document.getElementById("officer-callsign");
  var OFFICER_PROFILE_KEY = "epical_pd_officer_profile";

  function getCheckboxValues(formEl, name) {
    return Array.prototype.slice
      .call(formEl.querySelectorAll('input[name="' + name + '"]:checked'))
      .map(function (el) {
        return el.value;
      });
  }

  function getSuspectNames(formEl) {
    return Array.prototype.slice
      .call(formEl.querySelectorAll(".suspect-name-input"))
      .map(function (el) {
        return (el.value || "").trim();
      })
      .filter(function (name) {
        return name.length > 0;
      });
  }

  function readForm(formEl) {
    var formData = new FormData(formEl);
    return {
      location: formData.get("location") || "",
      mode: formData.get("mode"),
      incidentType: formData.get("incidentType"),
      behavior: formData.get("behavior"),
      publicDensity: formData.get("publicDensity"),
      officerName: formData.get("officerName") || "",
      officerRank: formData.get("officerRank") || "spc",
      officerNumber: formData.get("officerNumber") || "",
      officerPatrolMode: formData.get("officerPatrolMode") || "response_vehicle",
      suspectNames: getSuspectNames(formEl),
      grounds: getCheckboxValues(formEl, "grounds"),
      pdOnDuty: Number(formData.get("pdOnDuty")),
      groupSize: Number(formData.get("groupSize")),
      weaponSeen: formData.get("weaponSeen") === "on",
      activeShots: formData.get("activeShots") === "on",
      injuryPresent: formData.get("injuryPresent") === "on",
      knownViolenceMarker: formData.get("knownViolenceMarker") === "on",
      subjectIntoxicated: formData.get("subjectIntoxicated") === "on",
      s60Authorized: formData.get("s60Authorized") === "on",
      childVulnerableRisk: formData.get("childVulnerableRisk") === "on",
      propertyDamageRisk: formData.get("propertyDamageRisk") === "on",
      publicDecencyRisk: formData.get("publicDecencyRisk") === "on",
      highwayObstructionRisk: formData.get("highwayObstructionRisk") === "on",
      speedMph: Number(formData.get("speedMph") || 0),
      roadType: formData.get("roadType") || "urban",
      trafficDensity: formData.get("trafficDensity") || "low",
      vehicleCondition: formData.get("vehicleCondition") || "normal",
      vehicleAntisocial: formData.get("vehicleAntisocial") === "on",
      priorS59Warning: formData.get("priorS59Warning") === "on",
      vehiclePulledOver: formData.get("vehiclePulledOver") === "on",
      pursuitDurationMin: Number(formData.get("pursuitDurationMin") || 0),
      failedStopSignals: Number(formData.get("failedStopSignals") || 0),
      drugType: formData.get("drugType") || "unknown",
      drugQuantityGrams: Number(formData.get("drugQuantityGrams") || 0),
      drugPackaging: formData.get("drugPackaging") || "none",
      seizedCashGbp: Number(formData.get("seizedCashGbp") || 0),
      refusesProvideId: formData.get("refusesProvideId") === "on",
      suspectedFalseIdentity: formData.get("suspectedFalseIdentity") === "on",
      noFixedAddress: formData.get("noFixedAddress") === "on",
      obstructiveConduct: formData.get("obstructiveConduct") === "on",
      refusesVehicleDocs: formData.get("refusesVehicleDocs") === "on",
      faceCoveringPresent: formData.get("faceCoveringPresent") === "on",
      refusesRemoveFaceCovering: formData.get("refusesRemoveFaceCovering") === "on",
      amberZone: formData.get("amberZone") === "on",
      sceneStartedInAmber: formData.get("sceneStartedInAmber") === "on",
      medicalAttemptDuringActive: formData.get("medicalAttemptDuringActive") === "on",
      taserHitTwo: formData.get("taserHitTwo") === "on",
      ehsKidnapAttempt: formData.get("ehsKidnapAttempt") === "on",
      notes: formData.get("notes") || "",
    };
  }

  function renderList(title, items) {
    if (!items || items.length === 0) {
      return "<h3>" + title + "</h3><p class=\"muted\">None</p>";
    }
    return (
      "<h3>" +
      title +
      "</h3><ul>" +
      items
        .map(function (item) {
          return "<li>" + item + "</li>";
        })
        .join("") +
      "</ul>"
    );
  }

  function renderDisposalMethods(items) {
    if (!items || items.length === 0) {
      return "<h3>Disposal Methods</h3><p class=\"muted\">None</p>";
    }

    return (
      "<h3>Disposal Methods</h3><ul>" +
      items
        .map(function (item) {
          return (
            "<li><strong>" +
            item.method +
            "</strong><br/><span class=\"muted\">Reason: " +
            item.reason +
            " | Ref: " +
            item.ukReference +
            "</span></li>"
          );
        })
        .join("") +
      "</ul>"
    );
  }

  function renderRiskDrivers(factors) {
    var top = factors.slice(0, 6).map(function (factor) {
      return factor.label + " (+" + factor.points + ")";
    });
    return renderList("Top Risk Drivers", top);
  }

  function renderQuickReference(ref) {
    if (!ref) return "";
    return (
      '<div class="quick-ref">' +
      "<h3>Quick Reference</h3>" +
      '<div class="quick-grid">' +
      '<p class="quick-item"><strong>Officer:</strong> ' +
      ref.officerLine +
      "</p>" +
      '<p class="quick-item"><strong>Suspects:</strong> ' +
      ref.suspectLine +
      "</p>" +
      '<p class="quick-item"><strong>Incident:</strong> ' +
      ref.incident +
      " | " +
      ref.riskTag +
      "</p>" +
      '<p class="quick-item"><strong>Speed:</strong> ' +
      ref.speedLine +
      "</p>" +
      '<p class="quick-item"><strong>Primary Action:</strong> ' +
      ref.primaryAction +
      "</p>" +
      '<p class="quick-item"><strong>Legal Anchor:</strong> ' +
      ref.legalAnchor +
      "</p>" +
      '<p class="quick-item"><strong>Arrest Call:</strong> ' +
      ref.arrestCall +
      "</p>" +
      '<p class="quick-item"><strong>Top Disposal:</strong> ' +
      ref.disposal +
      "</p>" +
      '<p class="quick-item"><strong>Primary Offence:</strong> ' +
      ref.primaryOffence +
      "</p>" +
      '<p class="quick-item"><strong>PACE Focus:</strong> ' +
      ref.paceFocus +
      "</p>" +
      '<p class="quick-item"><strong>Priority Alert:</strong> ' +
      ref.priorityAlert +
      "</p>" +
      '<p class="quick-item"><strong>ID Expectation:</strong> ' +
      ref.idExpectation +
      "</p>" +
      '<p class="quick-item"><strong>Vehicle Stop Status:</strong> ' +
      ref.vehicleStopStatus +
      "</p>" +
      '<p class="quick-item"><strong>Face Covering:</strong> ' +
      ref.faceCovering +
      "</p>" +
      "</div>" +
      "</div>"
    );
  }

  function renderTriggerPointers(items) {
    if (!items || items.length === 0) return "";

    return (
      '<div class="trigger-board"><h3>Live Trigger Pointers</h3>' +
      items
        .slice(0, 6)
        .map(function (item) {
          return (
            '<div class="trigger-card ' +
            item.level +
            '"><p class="trigger-title">' +
            item.title +
            "</p><p>" +
            item.detail +
            "</p></div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function renderNecessityChecklist(items) {
    if (!items || items.length === 0) {
      return "<h3>IDCOPPLAN Necessity (Live)</h3><p class=\"muted\">No active arrest necessity indicator captured.</p>";
    }
    return (
      "<h3>IDCOPPLAN Necessity (Live)</h3><ul>" +
      items
        .map(function (item) {
          var code = item.code === "P2" ? "P" : item.code;
          return "<li><strong>" + code + ":</strong> " + item.title + "</li>";
        })
        .join("") +
      "</ul>"
    );
  }

  function renderContextChips(contexts, scene) {
    var chips = [];
    if (scene.officerProfile) {
      chips.push("Officer: " + scene.officerProfile.callsign);
      chips.push("Officer patrol: " + scene.officerProfile.patrolLabel);
    }
    if (scene.suspectNames && scene.suspectNames.length > 0) {
      chips.push("Suspects listed: " + scene.suspectNames.length);
    }
    chips.push("Stopped on: " + scene.mode);
    chips.push("Incident: " + scene.incidentType);
    if (contexts.vehicleContext) chips.push("Vehicle context");
    if (contexts.pursuitContext) chips.push("Pursuit context");
    if (contexts.drugContext) chips.push("Drug context");
    if (scene.s60Authorized) chips.push("s60 active");
    if (scene.vehicleAntisocial) chips.push("s59 consideration");
    if (scene.vehiclePulledOver) chips.push("Vehicle stop active");
    if (scene.seizedCashGbp > 10000) chips.push("Cash over GBP 10k");
    if (scene.refusesProvideId) chips.push("ID refusal");
    if (scene.suspectedFalseIdentity) chips.push("False identity risk");
    if (scene.obstructiveConduct) chips.push("Obstruction risk");
    if (scene.noFixedAddress) chips.push("No fixed address");
    if (scene.refusesVehicleDocs) chips.push("Docs refusal");
    if (scene.faceCoveringPresent) chips.push("Face covering present");
    if (scene.refusesRemoveFaceCovering) chips.push("Face-covering removal refused");
    if (scene.childVulnerableRisk) chips.push("Child/vulnerable risk");
    if (scene.publicDecencyRisk) chips.push("Public decency risk");
    if (scene.highwayObstructionRisk) chips.push("Highway obstruction risk");

    contextStrip.innerHTML = chips
      .map(function (chip) {
        return '<span class="context-chip">' + chip + "</span>";
      })
      .join("");
  }

  function toggleDynamicFieldsets(scene) {
    var normalizedScene = window.EpicalEngine.normalizeScene(scene);
    var contexts = window.EpicalEngine.deriveContexts(normalizedScene);
    var visibility = {
      vehicleContext: contexts.vehicleContext,
      pursuitContext: contexts.pursuitContext,
      drugContext: contexts.drugContext,
    };

    Array.prototype.slice.call(document.querySelectorAll("[data-show]")).forEach(function (fieldset) {
      var key = fieldset.getAttribute("data-show");
      var show = Boolean(visibility[key]);
      fieldset.classList.toggle("is-hidden", !show);
      Array.prototype.slice.call(fieldset.querySelectorAll("input, select, textarea")).forEach(function (control) {
        control.disabled = !show;
      });
    });

    renderContextChips(contexts, normalizedScene);
  }

  function saveForInvestigations(data) {
    try {
      localStorage.setItem(
        "epical_pd_last_case",
        JSON.stringify({
          savedAt: new Date().toISOString(),
          caseData: data,
        })
      );
    } catch (error) {
      console.error("Unable to save case context", error);
    }
  }

  function saveOfficerProfile(scene) {
    try {
      localStorage.setItem(
        OFFICER_PROFILE_KEY,
        JSON.stringify({
          officerName: scene.officerName || "",
          officerRank: scene.officerRank || "spc",
          officerNumber: scene.officerNumber || "",
          officerPatrolMode: scene.officerPatrolMode || "response_vehicle",
        })
      );
    } catch (error) {
      console.error("Unable to save officer profile", error);
    }
  }

  function restoreOfficerProfile() {
    try {
      var raw = localStorage.getItem(OFFICER_PROFILE_KEY);
      if (!raw) return;
      var profile = JSON.parse(raw);
      if (officerNameInput && profile.officerName) officerNameInput.value = profile.officerName;
      if (officerRankInput && profile.officerRank) officerRankInput.value = profile.officerRank;
      if (officerNumberInput && profile.officerNumber) officerNumberInput.value = profile.officerNumber;
      if (officerPatrolInput && profile.officerPatrolMode) officerPatrolInput.value = profile.officerPatrolMode;
    } catch (error) {
      console.error("Unable to restore officer profile", error);
    }
  }

  function updateCallsignPreview(scene) {
    if (!officerCallsignInput) return;
    if (!window.EpicalEngine || typeof window.EpicalEngine.buildOfficerProfile !== "function") return;
    var profile = window.EpicalEngine.buildOfficerProfile(scene);
    officerCallsignInput.value = profile.callsign;
  }

  function appendSuspectRow(value) {
    if (!suspectList) return;
    var row = document.createElement("div");
    row.className = "suspect-row";

    var input = document.createElement("input");
    input.className = "suspect-name-input";
    input.type = "text";
    input.name = "suspectNames";
    input.placeholder = "Suspect name or identifier";
    input.value = value || "";

    var removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "secondary-btn suspect-remove";
    removeBtn.textContent = "Remove";
    removeBtn.setAttribute("aria-label", "Remove suspect row");

    row.appendChild(input);
    row.appendChild(removeBtn);
    suspectList.appendChild(row);
  }

  function ensureSuspectRows() {
    if (!suspectList) return;
    if (suspectList.querySelectorAll(".suspect-row").length === 0) {
      appendSuspectRow("");
    }
  }

  function updateOpsMeta(data) {
    if (opsOfficer && data.officerProfile) {
      opsOfficer.textContent = "Officer: " + data.officerProfile.display;
    }
    if (opsOfficerPatrol && data.officerProfile) {
      opsOfficerPatrol.textContent = "Officer Patrol: " + data.officerProfile.patrolLabel;
    }
    if (opsSuspects) {
      opsSuspects.textContent = "Suspects: " + (data.suspectSummary || "None listed");
    }
  }

  function render(data) {
    var riskClass = data.risk.level.toLowerCase();
    var blockedHtml =
      data.gate.blocked.length > 0
        ? '<div class="block"><strong>Blocked:</strong><ul>' +
          data.gate.blocked
            .map(function (item) {
              return "<li>" + item + "</li>";
            })
            .join("") +
          "</ul></div>"
        : "";

    var warningHtml =
      data.gate.warnings.length > 0
        ? '<div class="warn"><strong>Warnings:</strong><ul>' +
          data.gate.warnings
            .map(function (item) {
              return "<li>" + item + "</li>";
            })
            .join("") +
          "</ul></div>"
        : "";

    result.innerHTML =
      "<h2>Action Card</h2>" +
      '<div class="info-bar">' +
      '<div class="info-card"><div class="metric"><span class="risk ' +
      riskClass +
      '">' +
      data.risk.level.toUpperCase() +
      " RISK</span><span>Score: " +
      data.risk.score +
      "</span></div><p class=\"muted\">Local log time: " +
      data.log.local +
      " (" +
      data.log.timezone +
      ")</p></div>" +
      '<div class="info-card"><p><strong>Grounds:</strong> ' +
      data.grounds.level.toUpperCase() +
      " (" +
      data.grounds.score +
      ")</p><p class=\"muted\">" +
      data.grounds.summary +
      "</p></div>" +
      "</div>" +
      "<p><strong>Officer:</strong> " +
      data.officerProfile.display +
      " | <strong>Patrol:</strong> " +
      data.officerProfile.patrolLabel +
      "</p>" +
      "<p><strong>Suspects:</strong> " +
      data.suspectSummary +
      "</p>" +
      "<p><strong>Location:</strong> " +
      (data.scene.location || "Unknown") +
      "</p>" +
      "<p><strong>City Limits:</strong> 50 mph non-motorway, 100 mph motorway | <strong>Current Speed:</strong> " +
      data.scene.speedMph +
      " mph (" +
      data.risk.speedProfile.overLimit +
      " over local limit)</p>" +
      renderQuickReference(data.quickReference) +
      renderTriggerPointers(data.triggerPointers) +
      blockedHtml +
      warningHtml +
      renderRiskDrivers(data.risk.factors) +
      renderNecessityChecklist(data.necessityChecklist) +
      renderList("PACE Triggers (Live)", data.paceTriggers) +
      renderList("Arrest Reasons (Necessity Indicators)", data.arrestReasons) +
      renderList("Likely Offences (UK-Style RP)", data.likelyOffences) +
      renderList("Immediate Actions", data.immediateActions) +
      renderList("Tactical Options", data.tacticalActions) +
      renderList("Suggested UK Sections", data.sections) +
      renderDisposalMethods(data.disposals) +
      renderList("Evidence Checklist", data.evidence) +
      "<h3>Caution Text</h3><p><code>" +
      data.cautionText +
      "</code></p>" +
      renderList("Rationale", data.rationale) +
      '<div class="next-step">' +
      "<h3>Next Step</h3>" +
      "<p>Continue this scene into the city-computer record workflow.</p>" +
      '<a class="handover-link" href="./investigations.html" target="_blank" rel="noopener">Open Investigations Handover Page</a>' +
      "</div>";

    if (data.topBarSummary) {
      opsTopPoint.textContent = data.topBarSummary.topPoint;
      opsUrgentAction.textContent = data.topBarSummary.urgentAction;
      opsKeySection.textContent = data.topBarSummary.keySection;
      opsNextStep.textContent = data.topBarSummary.nextStep;
    }
    updateOpsMeta(data);
    syncOpsBarOffset();
    saveForInvestigations(data);
  }

  function evaluateAndRender() {
    var firstPass = readForm(form);
    toggleDynamicFieldsets(firstPass);
    var scene = readForm(form);
    updateCallsignPreview(scene);
    saveOfficerProfile(scene);
    var output = window.EpicalEngine.evaluateScene(scene);
    render(output);
  }

  function applyTheme(theme) {
    document.body.classList.toggle("theme-dark", theme === "dark");
    if (themeToggle) {
      themeToggle.textContent = theme === "dark" ? "Light Mode" : "Dark Mode";
    }
  }

  function syncOpsBarOffset() {
    if (!opsBar) return;
    var h = opsBar.offsetHeight || 100;
    document.documentElement.style.setProperty("--ops-bar-offset", h + 8 + "px");
  }

  function initTheme() {
    var saved = localStorage.getItem("epical_pd_theme");
    var theme = saved === "light" ? "light" : "dark";
    if (!saved) {
      localStorage.setItem("epical_pd_theme", "dark");
    }
    applyTheme(theme);
  }

  function toggleTheme() {
    var current = document.body.classList.contains("theme-dark") ? "dark" : "light";
    var next = current === "dark" ? "light" : "dark";
    localStorage.setItem("epical_pd_theme", next);
    applyTheme(next);
  }

  function bindSuspectControls() {
    if (!addSuspectBtn || !suspectList) return;

    addSuspectBtn.addEventListener("click", function () {
      appendSuspectRow("");
      evaluateAndRender();
    });

    suspectList.addEventListener("click", function (event) {
      var target = event.target;
      if (!(target instanceof HTMLElement) || !target.classList.contains("suspect-remove")) return;

      var rows = suspectList.querySelectorAll(".suspect-row");
      if (rows.length <= 1) return;
      target.closest(".suspect-row").remove();
      evaluateAndRender();
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    evaluateAndRender();
  });

  form.addEventListener("input", function () {
    evaluateAndRender();
  });

  form.addEventListener("change", function () {
    evaluateAndRender();
  });

  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  window.addEventListener("resize", syncOpsBarOffset);

  initTheme();
  restoreOfficerProfile();
  ensureSuspectRows();
  bindSuspectControls();
  syncOpsBarOffset();
  evaluateAndRender();
})();
