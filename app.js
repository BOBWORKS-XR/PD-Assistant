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
  var opsCollapseBtn = document.getElementById("ops-collapse-btn");
  var opsClearBtn = document.getElementById("ops-clear-btn");
  var opsDisclaimer = document.querySelector(".ops-disclaimer");
  var opsDisclaimerCloseBtn = document.querySelector(".ops-disclaimer-close");
  var stampStopBtn = document.getElementById("stamp-stop-btn");
  var stampSearchBtn = document.getElementById("stamp-search-btn");
  var stampArrestBtn = document.getElementById("stamp-arrest-btn");
  var stampStopValue = document.getElementById("stamp-stop-value");
  var stampSearchValue = document.getElementById("stamp-search-value");
  var stampArrestValue = document.getElementById("stamp-arrest-value");
  var suspectList = document.getElementById("suspect-list");
  var addSuspectBtn = document.getElementById("add-suspect");
  var officerNameInput = form.querySelector('input[name="officerName"]');
  var officerRankInput = form.querySelector('select[name="officerRank"]');
  var officerNumberInput = form.querySelector('input[name="officerNumber"]');
  var officerPatrolInput = form.querySelector('select[name="officerPatrolMode"]');
  var officerCallsignInput = document.getElementById("officer-callsign");
  var OFFICER_PROFILE_KEY = "epical_pd_officer_profile";
  var TIMELINE_KEY = "epical_pd_timeline";
  var FORM_CACHE_KEY = "epical_pd_scene_form_v1";
  var OPS_COLLAPSE_KEY = "epical_pd_ops_bar_collapsed_assistant";

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

  function formatUkTimelineStamp(dateObj) {
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
    return "[" + map.day + "/" + map.month + "/" + map.year + " " + map.hour + ":" + map.minute + "]";
  }

  function readTimeline() {
    try {
      var raw = localStorage.getItem(TIMELINE_KEY);
      if (!raw) {
        return { timeStop: "", timeSearch: "", timeArrestEvent: "" };
      }
      var parsed = JSON.parse(raw);
      return {
        timeStop: parsed.timeStop || "",
        timeSearch: parsed.timeSearch || "",
        timeArrestEvent: parsed.timeArrestEvent || "",
      };
    } catch (error) {
      console.error("Unable to read timeline", error);
      return { timeStop: "", timeSearch: "", timeArrestEvent: "" };
    }
  }

  function saveTimeline(timeline) {
    try {
      localStorage.setItem(TIMELINE_KEY, JSON.stringify(timeline));
    } catch (error) {
      console.error("Unable to save timeline", error);
    }
  }

  function renderTimelineLabels(timeline) {
    if (stampStopValue) stampStopValue.textContent = timeline.timeStop || "Not stamped";
    if (stampSearchValue) stampSearchValue.textContent = timeline.timeSearch || "Not stamped";
    if (stampArrestValue) stampArrestValue.textContent = timeline.timeArrestEvent || "Not stamped";
  }

  function stampTimelineField(key) {
    var timeline = readTimeline();
    timeline[key] = formatUkTimelineStamp(new Date());
    saveTimeline(timeline);
    renderTimelineLabels(timeline);
  }

  function clearAllCachedData() {
    [
      "epical_pd_scene_form_v1",
      "epical_pd_investigation_form_v1",
      "epical_pd_officer_profile",
      "epical_pd_timeline",
      "epical_pd_last_case",
      "epical_pd_ops_bar_collapsed_assistant",
      "epical_pd_ops_bar_collapsed_investigation",
    ].forEach(function (key) {
      localStorage.removeItem(key);
    });
  }

  function saveSceneFormCache(scene) {
    try {
      localStorage.setItem(FORM_CACHE_KEY, JSON.stringify(scene));
    } catch (error) {
      console.error("Unable to save scene form cache", error);
    }
  }

  function setNamedControlValue(name, value) {
    var controls = Array.prototype.slice.call(form.querySelectorAll('[name="' + name + '"]'));
    if (controls.length === 0) return;
    var first = controls[0];

    if (first.type === "checkbox") {
      if (controls.length > 1) {
        var selected = Array.isArray(value) ? value.map(String) : [];
        controls.forEach(function (control) {
          control.checked = selected.indexOf(String(control.value)) !== -1;
        });
      } else {
        first.checked = Boolean(value);
      }
      return;
    }

    if (first.type === "radio") {
      controls.forEach(function (control) {
        control.checked = String(control.value) === String(value);
      });
      return;
    }

    if (controls.length > 1 && Array.isArray(value)) {
      controls.forEach(function (control, index) {
        control.value = value[index] != null ? String(value[index]) : "";
      });
      return;
    }

    first.value = value != null ? String(value) : "";
  }

  function restoreSceneFormCache() {
    try {
      var raw = localStorage.getItem(FORM_CACHE_KEY);
      if (!raw) return;
      var scene = JSON.parse(raw);
      if (!scene || typeof scene !== "object") return;

      if (suspectList) {
        suspectList.innerHTML = "";
        var names = Array.isArray(scene.suspectNames) && scene.suspectNames.length > 0 ? scene.suspectNames : [""];
        names.forEach(function (name) {
          appendSuspectRow(name);
        });
      }

      Object.keys(scene).forEach(function (key) {
        if (key === "suspectNames") return;
        setNamedControlValue(key, scene[key]);
      });
    } catch (error) {
      console.error("Unable to restore scene form cache", error);
    }
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
      opsSuspects.textContent = "Suspects: " + (data.suspectSummary || "unknown");
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
    if (parent && parent.classList.contains("is-expanded")) {
      el.textContent = fullText;
    } else {
      el.textContent = shortText;
    }
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
      "</span></div><p class=\"muted\">UK log time: " +
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
      renderList("Likely Offences", data.likelyOffences) +
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
      setOpsValue(
        opsTopPoint,
        data.topBarSummary.topPoint,
        data.triggerPointers && data.triggerPointers.length > 0 ? data.triggerPointers[0].title : data.topBarSummary.topPoint
      );
      setOpsValue(
        opsUrgentAction,
        data.topBarSummary.urgentAction,
        data.immediateActions && data.immediateActions.length > 0 ? data.immediateActions[0] : data.topBarSummary.urgentAction
      );
      setOpsValue(
        opsKeySection,
        data.topBarSummary.keySection,
        data.sections && data.sections.length > 0 ? data.sections[0] : data.topBarSummary.keySection
      );
      setOpsValue(
        opsNextStep,
        data.topBarSummary.nextStep,
        data.disposals && data.disposals.length > 0 ? getDisposalLabel(data.disposals[0]) : data.topBarSummary.nextStep
      );
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
    saveSceneFormCache(scene);
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

  function setOpsBarCollapsed(collapsed) {
    if (!opsBar) return;
    opsBar.classList.toggle("is-collapsed", collapsed);
    if (opsCollapseBtn) {
      opsCollapseBtn.textContent = collapsed ? "Expand ^" : "Collapse v";
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
    var collapsed = savedState === "1";
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

  function bindTopStampButtons() {
    if (stampStopBtn) {
      stampStopBtn.addEventListener("click", function () {
        stampTimelineField("timeStop");
      });
    }
    if (stampSearchBtn) {
      stampSearchBtn.addEventListener("click", function () {
        stampTimelineField("timeSearch");
      });
    }
    if (stampArrestBtn) {
      stampArrestBtn.addEventListener("click", function () {
        stampTimelineField("timeArrestEvent");
      });
    }
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
  restoreSceneFormCache();
  renderTimelineLabels(readTimeline());
  bindTopStampButtons();
  bindSuspectControls();
  bindDisclaimerDismiss();
  bindOpsCellExpansion();
  bindOpsBarActions();
  syncOpsBarOffset();
  evaluateAndRender();
})();

