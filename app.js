(function () {
  var form = document.getElementById("scene-form");
  var result = document.getElementById("result");
  var contextStrip = document.getElementById("context-strip");
  var themeToggle = document.getElementById("theme-toggle");

  function getCheckboxValues(formEl, name) {
    return Array.prototype.slice
      .call(formEl.querySelectorAll('input[name="' + name + '"]:checked'))
      .map(function (el) {
        return el.value;
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
      grounds: getCheckboxValues(formEl, "grounds"),
      pdOnDuty: Number(formData.get("pdOnDuty")),
      groupSize: Number(formData.get("groupSize")),
      weaponSeen: formData.get("weaponSeen") === "on",
      activeShots: formData.get("activeShots") === "on",
      injuryPresent: formData.get("injuryPresent") === "on",
      knownViolenceMarker: formData.get("knownViolenceMarker") === "on",
      subjectIntoxicated: formData.get("subjectIntoxicated") === "on",
      s60Authorized: formData.get("s60Authorized") === "on",
      speedMph: Number(formData.get("speedMph") || 0),
      roadType: formData.get("roadType") || "urban",
      trafficDensity: formData.get("trafficDensity") || "low",
      vehicleCondition: formData.get("vehicleCondition") || "normal",
      vehicleAntisocial: formData.get("vehicleAntisocial") === "on",
      priorS59Warning: formData.get("priorS59Warning") === "on",
      pursuitDurationMin: Number(formData.get("pursuitDurationMin") || 0),
      failedStopSignals: Number(formData.get("failedStopSignals") || 0),
      drugType: formData.get("drugType") || "unknown",
      drugQuantityGrams: Number(formData.get("drugQuantityGrams") || 0),
      drugPackaging: formData.get("drugPackaging") || "none",
      seizedCashGbp: Number(formData.get("seizedCashGbp") || 0),
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

  function renderContextChips(contexts, scene) {
    var chips = [];
    chips.push("Mode: " + scene.mode);
    chips.push("Incident: " + scene.incidentType);
    if (contexts.vehicleContext) chips.push("Vehicle context");
    if (contexts.pursuitContext) chips.push("Pursuit context");
    if (contexts.drugContext) chips.push("Drug context");
    if (scene.s60Authorized) chips.push("s60 active");
    if (scene.vehicleAntisocial) chips.push("s59 consideration");
    if (scene.seizedCashGbp > 10000) chips.push("Cash over GBP 10k");

    contextStrip.innerHTML = chips
      .map(function (chip) {
        return '<span class="context-chip">' + chip + "</span>";
      })
      .join("");
  }

  function toggleDynamicFieldsets(scene) {
    var contexts = window.EpicalEngine.deriveContexts(scene);
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

    renderContextChips(contexts, scene);
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
      "<p><strong>Location:</strong> " +
      (data.scene.location || "Unknown") +
      "</p>" +
      "<p><strong>City Limits:</strong> 50 mph non-motorway, 100 mph motorway | <strong>Current Speed:</strong> " +
      data.scene.speedMph +
      " mph (" +
      data.risk.speedProfile.overLimit +
      " over local limit)</p>" +
      blockedHtml +
      warningHtml +
      renderRiskDrivers(data.risk.factors) +
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
      '<p><a href="./investigations.html" target="_blank" rel="noopener">Open Investigations Handover Page</a></p>';

    saveForInvestigations(data);
  }

  function evaluateAndRender() {
    var firstPass = readForm(form);
    toggleDynamicFieldsets(firstPass);
    var scene = readForm(form);
    var output = window.EpicalEngine.evaluateScene(scene);
    render(output);
  }

  function applyTheme(theme) {
    document.body.classList.toggle("theme-dark", theme === "dark");
    if (themeToggle) {
      themeToggle.textContent = theme === "dark" ? "Light Mode" : "Dark Mode";
    }
  }

  function initTheme() {
    var saved = localStorage.getItem("epical_pd_theme");
    var theme = saved === "dark" ? "dark" : "light";
    applyTheme(theme);
  }

  function toggleTheme() {
    var current = document.body.classList.contains("theme-dark") ? "dark" : "light";
    var next = current === "dark" ? "light" : "dark";
    localStorage.setItem("epical_pd_theme", next);
    applyTheme(next);
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

  initTheme();
  evaluateAndRender();
})();
