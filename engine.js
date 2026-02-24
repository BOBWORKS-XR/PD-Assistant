(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.EpicalEngine = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  var INCIDENT_WEIGHT = {
    suspicious_person: 1,
    traffic_stop: 2,
    public_disorder: 3,
    assault_report: 4,
    weapon_sighting: 6,
    pursuit: 7,
    hostage: 8,
  };

  var BEHAVIOR_WEIGHT = {
    compliant: 0,
    evasive: 2,
    aggressive: 4,
    fleeing: 5,
  };

  var PUBLIC_DENSITY_WEIGHT = {
    low: 0,
    medium: 1,
    high: 3,
  };

  var TRAFFIC_DENSITY_WEIGHT = {
    low: 0,
    medium: 1,
    high: 3,
  };

  var GROUND_WEIGHT = {
    smell_drugs: 2,
    drug_paraphernalia: 3,
    weapon_bulge: 2,
    stolen_vehicle_marker: 3,
    witness_statement: 2,
    intel_link: 1,
    admission_made: 3,
  };

  var PACE_CAUTION_TEXT =
    "You do not have to say anything, but it may harm your defence if you do not mention when questioned something which you later rely on in court. Anything you do say may be given in evidence.";

  function uniquePush(list, value) {
    if (list.indexOf(value) === -1) {
      list.push(value);
    }
  }

  function toNumber(value, fallback) {
    var parsed = Number(value);
    if (isNaN(parsed)) return fallback;
    return parsed;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function formatLocalTimestamp() {
    var now = new Date();
    return {
      iso: now.toISOString(),
      local: now.toLocaleString("en-GB", { hour12: false }),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Local",
    };
  }

  function normalizeScene(input) {
    var scene = Object.assign(
      {
        location: "",
        mode: "foot",
        incidentType: "suspicious_person",
        behavior: "compliant",
        publicDensity: "low",
        grounds: [],
        pdOnDuty: 0,
        groupSize: 1,
        weaponSeen: false,
        activeShots: false,
        injuryPresent: false,
        knownViolenceMarker: false,
        subjectIntoxicated: false,
        s60Authorized: false,
        speedMph: 0,
        roadType: "urban",
        trafficDensity: "low",
        vehicleCondition: "normal",
        vehicleAntisocial: false,
        priorS59Warning: false,
        pursuitDurationMin: 0,
        failedStopSignals: 0,
        drugType: "unknown",
        drugQuantityGrams: 0,
        drugPackaging: "none",
        amberZone: false,
        sceneStartedInAmber: false,
        medicalAttemptDuringActive: false,
        taserHitTwo: false,
        ehsKidnapAttempt: false,
        notes: "",
      },
      input || {}
    );

    scene.pdOnDuty = Math.max(0, Math.floor(toNumber(scene.pdOnDuty, 0)));
    scene.groupSize = clamp(Math.floor(toNumber(scene.groupSize, 1)), 1, 20);
    scene.speedMph = clamp(toNumber(scene.speedMph, 0), 0, 220);
    scene.pursuitDurationMin = clamp(toNumber(scene.pursuitDurationMin, 0), 0, 120);
    scene.failedStopSignals = clamp(Math.floor(toNumber(scene.failedStopSignals, 0)), 0, 20);
    scene.drugQuantityGrams = clamp(toNumber(scene.drugQuantityGrams, 0), 0, 100000);

    if (!Array.isArray(scene.grounds)) {
      scene.grounds = [];
    }

    return scene;
  }

  function deriveContexts(scene) {
    var hasDrugGround = scene.grounds.indexOf("smell_drugs") !== -1 || scene.grounds.indexOf("drug_paraphernalia") !== -1;
    var vehicleContext = scene.mode === "vehicle" || scene.incidentType === "traffic_stop" || scene.incidentType === "pursuit";
    var pursuitContext = scene.incidentType === "pursuit";
    var drugContext =
      hasDrugGround ||
      scene.drugQuantityGrams > 0 ||
      scene.drugPackaging !== "none" ||
      scene.incidentType === "suspicious_person" ||
      scene.incidentType === "traffic_stop";
    return {
      hasDrugGround: hasDrugGround,
      vehicleContext: vehicleContext,
      pursuitContext: pursuitContext,
      drugContext: drugContext,
    };
  }

  function assessGrounds(scene, contexts) {
    var score = 0;
    var strongCount = 0;
    var detail = [];
    var i;

    for (i = 0; i < scene.grounds.length; i += 1) {
      var key = scene.grounds[i];
      var pts = GROUND_WEIGHT[key] || 0;
      if (pts > 0) {
        score += pts;
        detail.push(key + " (+" + pts + ")");
      }
    }

    var strongGrounds = ["smell_drugs", "drug_paraphernalia", "weapon_bulge", "stolen_vehicle_marker", "witness_statement", "admission_made"];
    for (i = 0; i < scene.grounds.length; i += 1) {
      if (strongGrounds.indexOf(scene.grounds[i]) !== -1) strongCount += 1;
    }

    if (scene.s60Authorized) {
      score += 1;
      detail.push("s60 authorised (+1)");
    }
    if (scene.weaponSeen) {
      score += 2;
      detail.push("weapon seen (+2)");
    }

    var level = "none";
    if (score >= 7) level = "strong";
    else if (score >= 3) level = "moderate";
    else if (score >= 1) level = "weak";

    var summary = "Grounds are currently " + level + ".";
    if (level === "none") {
      summary = "No meaningful grounds captured yet.";
    } else if (level === "weak") {
      summary = "Grounds are weak; gather specific articulable facts before intrusive action.";
    } else if (level === "moderate") {
      summary = "Grounds are usable but should be tightened with clear narrative evidence.";
    } else if (level === "strong") {
      summary = "Grounds are strong and support decisive lawful action.";
    }

    return {
      score: score,
      strongCount: strongCount,
      level: level,
      detail: detail,
      summary: summary,
      drugGrounded: contexts.hasDrugGround || scene.drugQuantityGrams > 0 || scene.drugPackaging !== "none",
    };
  }

  function calculateRisk(scene, contexts) {
    var score = 0;
    var factors = [];

    function add(points, label) {
      if (points <= 0) return;
      score += points;
      factors.push({ points: points, label: label });
    }

    add(INCIDENT_WEIGHT[scene.incidentType] || 0, "Incident type");
    add(BEHAVIOR_WEIGHT[scene.behavior] || 0, "Subject behavior");
    add(PUBLIC_DENSITY_WEIGHT[scene.publicDensity] || 0, "Public density");

    if (scene.groupSize > 1) {
      add(Math.min(scene.groupSize - 1, 5), "Multiple subjects");
    }

    if (scene.weaponSeen) add(7, "Weapon observed");
    if (scene.activeShots) add(9, "Active shots");
    if (scene.knownViolenceMarker) add(3, "Known violence marker");
    if (scene.subjectIntoxicated) add(2, "Intoxication risk");
    if (scene.injuryPresent) add(2, "Injury in scene");

    if (contexts.vehicleContext) {
      add(TRAFFIC_DENSITY_WEIGHT[scene.trafficDensity] || 0, "Traffic density");

      if (scene.speedMph >= 140) add(8, "Extreme speed");
      else if (scene.speedMph >= 110) add(6, "Very high speed");
      else if (scene.speedMph >= 90) add(4, "High speed");
      else if (scene.speedMph >= 70) add(2, "Elevated speed");

      if (scene.roadType === "urban" && scene.speedMph >= 80) add(4, "Urban speed danger");
      if (scene.roadType === "rural" && scene.speedMph >= 90) add(2, "Rural speed danger");
      if (scene.roadType === "motorway" && scene.speedMph >= 100) add(1, "Motorway speed pressure");

      if (scene.vehicleCondition === "smoking") add(1, "Vehicle damage");
      if (scene.vehicleCondition === "blown_tires") add(3, "Blown tires");
      if (scene.vehicleCondition === "critical") add(4, "Critical vehicle damage");

      if (scene.vehicleAntisocial) add(3, "Anti-social vehicle use");
      if (scene.priorS59Warning) add(2, "Prior s59 warning");
    }

    if (contexts.pursuitContext) {
      if (scene.pursuitDurationMin >= 25) add(5, "Prolonged pursuit");
      else if (scene.pursuitDurationMin >= 15) add(3, "Extended pursuit");
      else if (scene.pursuitDurationMin >= 8) add(2, "Sustained pursuit");

      if (scene.failedStopSignals >= 1) {
        add(Math.min(4, Math.ceil(scene.failedStopSignals / 2)), "Repeated stop signal refusal");
      }

      if (scene.pursuitDurationMin >= 20 && scene.speedMph >= 90) {
        add(3, "Extended high-speed pursuit risk");
      }
    }

    if (contexts.drugContext) {
      if (scene.drugType === "cannabis") add(1, "Drug type indicator");
      if (scene.drugType === "class_b") add(2, "Drug type indicator");
      if (scene.drugType === "class_a") add(3, "Drug type indicator");

      if (scene.drugQuantityGrams > 30) add(4, "Large quantity");
      else if (scene.drugQuantityGrams > 10) add(3, "Significant quantity");
      else if (scene.drugQuantityGrams > 2) add(2, "Moderate quantity");
      else if (scene.drugQuantityGrams > 0) add(1, "Small quantity");

      if (scene.drugPackaging === "split_bags") add(2, "Split packaging");
      if (scene.drugPackaging === "dealer_pack") add(3, "Dealer-style packaging");
      if (scene.drugPackaging === "bulk") add(4, "Bulk packaging");
    }

    factors.sort(function (a, b) {
      return b.points - a.points;
    });

    var level = "low";
    if (score >= 19) level = "critical";
    else if (score >= 12) level = "high";
    else if (score >= 6) level = "medium";

    return { score: score, level: level, factors: factors };
  }

  function gateServerRules(scene, contexts) {
    var blocked = [];
    var warnings = [];

    if (scene.incidentType === "hostage" && scene.pdOnDuty < 4) {
      blocked.push("Hostage scene blocked: EPICAL requires at least 4 PD on duty.");
    }
    if (scene.ehsKidnapAttempt) {
      blocked.push("EHS kidnapping attempt blocked: not permitted by server rules.");
    }
    if (scene.amberZone && scene.sceneStartedInAmber) {
      blocked.push("Scene start blocked: scenes cannot be initiated in amber zones.");
    }

    if (scene.taserHitTwo) {
      warnings.push("Two taser hits reached: subject should be treated as down/surrendered.");
    }
    if (scene.medicalAttemptDuringActive) {
      warnings.push("Medical/respawn during active scene is not allowed.");
    }
    if (contexts.pursuitContext && (scene.vehicleCondition === "blown_tires" || scene.vehicleCondition === "critical")) {
      warnings.push("Pursuit realism warning: heavily damaged vehicle should not continue unrealistically.");
    }
    if (contexts.pursuitContext && scene.pursuitDurationMin >= 25) {
      warnings.push("Pursuit duration is very long; avoid looped chase RP and force progression.");
    }
    if (contexts.vehicleContext && scene.roadType === "urban" && scene.speedMph >= 100) {
      warnings.push("Urban speed is extreme; review proportionality and public risk immediately.");
    }

    return { blocked: blocked, warnings: warnings };
  }

  function buildArrestReasons(scene, risk, grounds, contexts) {
    var reasons = [];

    if (scene.behavior === "fleeing") reasons.push("Subject actively fleeing");
    if (scene.behavior === "aggressive") reasons.push("Aggressive threat behavior");
    if (scene.activeShots) reasons.push("Active firearms discharge risk");
    if (scene.weaponSeen) reasons.push("Weapon visible on subject");
    if (scene.grounds.indexOf("stolen_vehicle_marker") !== -1) reasons.push("Vehicle flagged as potentially stolen");
    if (contexts.pursuitContext && scene.failedStopSignals >= 2) reasons.push("Repeated refusal to stop for police");
    if (contexts.pursuitContext && scene.speedMph >= 90) reasons.push("Dangerous pursuit driving threshold met");
    if (grounds.drugGrounded && (scene.drugQuantityGrams > 10 || scene.drugPackaging === "dealer_pack" || scene.drugPackaging === "bulk")) {
      reasons.push("Drug supply indicators present");
    }
    if (risk.level === "critical") reasons.push("Critical threat level requiring secure containment");

    return reasons;
  }

  function selectLegalSections(scene, grounds, contexts, arrestReasons) {
    var sections = [];

    if (contexts.vehicleContext) {
      uniquePush(sections, "RTA s163 - Power to stop vehicle");
      uniquePush(sections, "RTA s165 - Require licence/insurance details");
    }

    if (grounds.level !== "none" || scene.weaponSeen || scene.incidentType === "weapon_sighting") {
      uniquePush(sections, "PACE s1 - Stop and search (grounds required)");
    }

    if (grounds.drugGrounded) {
      uniquePush(sections, "Misuse of Drugs Act s23 - Drug search powers");
    }

    if (scene.s60Authorized) {
      uniquePush(sections, "CJPOA s60 - Authorised no-suspicion search area");
    }

    if (contexts.vehicleContext && scene.subjectIntoxicated) {
      uniquePush(sections, "RTA s5A - Drug driving reference path");
    }

    if (
      contexts.vehicleContext &&
      (scene.vehicleAntisocial || scene.priorS59Warning || (scene.roadType !== "motorway" && scene.speedMph >= 90))
    ) {
      uniquePush(sections, "Police Reform Act s59 - Vehicle warning/seizure route");
    }

    if (contexts.vehicleContext && scene.speedMph >= 90) {
      uniquePush(sections, "RTA s2 - Dangerous driving reference");
    }

    if (arrestReasons.length > 0) {
      uniquePush(sections, "PACE s24 - Arrest necessity");
      uniquePush(sections, "PACE s32 - Post-arrest search");
    }

    return sections;
  }

  function buildLikelyOffences(scene, grounds, contexts) {
    var offences = [];

    if (scene.weaponSeen || scene.incidentType === "weapon_sighting") {
      offences.push("Possession of offensive weapon / bladed article (context dependent)");
    }

    if (contexts.vehicleContext && scene.speedMph >= 90) {
      offences.push("Dangerous driving / careless driving (speed + road conditions dependent)");
    }

    if (contexts.pursuitContext && scene.failedStopSignals >= 1) {
      offences.push("Failing to stop for police");
    }

    if (grounds.drugGrounded) {
      if (scene.drugQuantityGrams > 10 || scene.drugPackaging === "dealer_pack" || scene.drugPackaging === "bulk") {
        offences.push("Possession with intent to supply (drug indicators present)");
      } else {
        offences.push("Simple possession of controlled substance");
      }
    }

    if (scene.activeShots) {
      offences.push("Firearms-related offences (scene-specific)");
    }

    return offences;
  }

  function buildImmediateActions(scene, risk, grounds, contexts) {
    var actions = [];
    actions.push("Anchor scene facts: exact location, timestamp, subject count, BWV narrative.");
    actions.push("Issue clear commands and de-escalate before force where safe.");

    if (grounds.level === "none" || grounds.level === "weak") {
      actions.push("Build articulable grounds before intrusive powers unless immediate risk overrides.");
    }
    if (risk.level === "high" || risk.level === "critical") {
      actions.push("Request backup now and move to containment posture.");
    }
    if (scene.weaponSeen || scene.activeShots) {
      actions.push("Prioritize public shielding, cover, and threat isolation.");
    }
    if (contexts.vehicleContext) {
      actions.push("Control stop geometry and occupant positioning before engagement.");
    }
    if (contexts.pursuitContext) {
      actions.push("Push regular pursuit updates: speed, direction, road type, and risk changes.");
      if (scene.pursuitDurationMin >= 15) {
        actions.push("Force progression: coordinated containment, stinger plan, or tactical stop option.");
      }
    }
    if (contexts.drugContext && grounds.drugGrounded) {
      actions.push("Secure drugs evidence chain: quantity estimate, packaging, location found.");
    }

    return actions;
  }

  function buildTacticalActions(scene, risk, contexts) {
    var tactical = [];

    if (contexts.vehicleContext && scene.speedMph >= 90) {
      tactical.push("Use advanced units/interceptors and avoid solo high-speed interventions.");
    }
    if (contexts.vehicleContext && scene.trafficDensity === "high") {
      tactical.push("Adjust route strategy for public safety in dense traffic.");
    }
    if (contexts.pursuitContext && scene.pursuitDurationMin >= 20) {
      tactical.push("Escalate command oversight to avoid endless chase loop.");
    }
    if (risk.level === "critical") {
      tactical.push("Treat as critical incident with clear role assignment and hard perimeter.");
    }
    if (scene.incidentType === "hostage") {
      tactical.push("Open negotiation line, preserve life, and avoid rushed assault decisions.");
    }

    if (tactical.length === 0) {
      tactical.push("Maintain standard officer safety spacing and controlled communication.");
    }

    return tactical;
  }

  function buildDisposals(scene, risk, grounds, contexts, arrestReasons, blockedCount) {
    if (blockedCount > 0) {
      return [
        {
          method: "Scene Reset (Rule Block)",
          reason: "Current scene path violates EPICAL server constraints.",
          ukReference: "Server Rule Gate",
        },
        {
          method: "Supervisor Review",
          reason: "Document why escalation was blocked and select compliant alternative.",
          ukReference: "BWV + incident log",
        },
      ];
    }

    if (arrestReasons.length >= 2 || risk.level === "critical") {
      return [
        {
          method: "Arrest + Custody Handover",
          reason: "Multiple necessity indicators / critical risk threshold met.",
          ukReference: "PACE s24 + PACE s32",
        },
        {
          method: "Charge / Remand Decision Pack",
          reason: "High-risk evidential package required before disposal.",
          ukReference: "Custody + CPS-style RP workflow",
        },
      ];
    }

    if (contexts.drugContext && grounds.drugGrounded) {
      if (
        scene.drugQuantityGrams <= 2 &&
        (scene.drugPackaging === "none" || scene.drugPackaging === "personal") &&
        scene.behavior === "compliant" &&
        !scene.weaponSeen &&
        !scene.activeShots
      ) {
        return [
          {
            method: "Street Disposal (Seizure + Warning)",
            reason: "Low quantity, cooperative behavior, no aggravating threat factors.",
            ukReference: "MDA s23 + local policy",
          },
          {
            method: "NFA after Seizure Review",
            reason: "If no further necessity and identity/grounds are fully documented.",
            ukReference: "Supervisor discretion",
          },
        ];
      }
      if (scene.drugQuantityGrams > 10 || scene.drugPackaging === "dealer_pack" || scene.drugPackaging === "bulk") {
        return [
          {
            method: "Arrest for Supply Investigation",
            reason: "Quantity/packaging indicates potential intent to supply.",
            ukReference: "PACE s24 + MDA s23",
          },
          {
            method: "Custody + Interview Under Caution",
            reason: "Evidence quality requires formal interview and continuity handling.",
            ukReference: "PACE caution + custody process",
          },
        ];
      }
      return [
        {
          method: "Detain for Enquiries",
          reason: "Drug indicators present but threshold not yet clearly supply-level.",
          ukReference: "PACE s1 / MDA s23",
        },
        {
          method: "Voluntary Attendance or Arrest Decision",
          reason: "Outcome depends on cooperation, identity assurance, and further findings.",
          ukReference: "PACE necessity test",
        },
      ];
    }

    if (contexts.vehicleContext) {
      if (scene.priorS59Warning) {
        return [
          {
            method: "Vehicle Seizure",
            reason: "Active prior s59 warning with continuing anti-social vehicle use.",
            ukReference: "Police Reform Act s59",
          },
          {
            method: "Traffic Prosecution File",
            reason: "Driving threat profile warrants full reporting and court route.",
            ukReference: "RTA disposal",
          },
        ];
      }
      if (scene.vehicleAntisocial) {
        return [
          {
            method: "s59 Warning",
            reason: "Anti-social vehicle use evidenced; warning threshold met.",
            ukReference: "Police Reform Act s59",
          },
          {
            method: "Escalate to Seizure if Repeated",
            reason: "Re-offending after warning triggers vehicle seizure route.",
            ukReference: "Police Reform Act s59",
          },
        ];
      }
      if (scene.speedMph >= 90 && scene.roadType !== "motorway") {
        return [
          {
            method: "Traffic Offence Report / Summons",
            reason: "Non-motorway excessive speed with high public risk indicators.",
            ukReference: "RTA s2 reference",
          },
          {
            method: "Arrest if Necessity Escalates",
            reason: "Use arrest route if identity risk, non-compliance, or further offences appear.",
            ukReference: "PACE s24",
          },
        ];
      }
    }

    if (risk.level === "low" && grounds.level === "none") {
      return [
        {
          method: "No Further Action (NFA)",
          reason: "Low risk and no articulable offence threshold currently met.",
          ukReference: "Recorded rationale",
        },
        {
          method: "Words of Advice",
          reason: "Proportionate educational outcome for minor concern only.",
          ukReference: "Officer discretion",
        },
      ];
    }

    if (risk.level === "medium") {
      return [
        {
          method: "Detain for Enquiries",
          reason: "Medium risk with developing grounds requires structured checks.",
          ukReference: "PACE s1 / policy",
        },
        {
          method: "Summons / Release Under Investigation",
          reason: "Use post-scene disposal if arrest necessity is not sustained.",
          ukReference: "Case progression",
        },
      ];
    }

    return [
      {
        method: "Arrest + Custody Transfer",
        reason: "Risk/behavior profile exceeds threshold for field disposal.",
        ukReference: "PACE s24",
      },
      {
        method: "Case Build and Supervisor Review",
        reason: "Formal evidential package required before final charging outcome.",
        ukReference: "Custody workflow",
      },
    ];
  }

  function buildEvidenceChecklist(scene, contexts, grounds) {
    var evidence = [
      "Exact timeline with location and unit arrival sequence.",
      "Specific behavior quotes/actions (avoid vague language).",
      "Grounds narrative written as observable facts.",
      "BWV and witness references linked to timeline.",
    ];

    if (contexts.vehicleContext) {
      evidence.push("Vehicle details: plate, model, condition, occupant map.");
      evidence.push("Speed estimate source, road type, and traffic density at key moments.");
    }
    if (contexts.pursuitContext) {
      evidence.push("Pursuit log: start time, duration, failed stop signals, route changes.");
    }
    if (contexts.drugContext && grounds.drugGrounded) {
      evidence.push("Drug details: type estimate, quantity (g), packaging, recovery location.");
    }
    if (scene.taserHitTwo) {
      evidence.push("Taser cycle count and post-deployment subject state.");
    }
    return evidence;
  }

  function buildRationale(risk, grounds) {
    var notes = [];
    notes.push("Server rule gates are applied before tactical or legal suggestions.");
    notes.push("Risk classification is score-based and deterministic (no AI dependency).");
    notes.push(grounds.summary);
    if (risk.factors.length > 0) {
      notes.push("Top risk driver: " + risk.factors[0].label + " (+" + risk.factors[0].points + ").");
    }
    notes.push("Use this as RP support only, not real legal advice.");
    return notes;
  }

  function evaluateScene(rawInput) {
    var scene = normalizeScene(rawInput);
    var log = formatLocalTimestamp();
    var contexts = deriveContexts(scene);
    var grounds = assessGrounds(scene, contexts);
    var risk = calculateRisk(scene, contexts);
    var gate = gateServerRules(scene, contexts);
    var arrestReasons = buildArrestReasons(scene, risk, grounds, contexts);
    var likelyOffences = buildLikelyOffences(scene, grounds, contexts);
    var sections = selectLegalSections(scene, grounds, contexts, arrestReasons);
    var immediateActions = buildImmediateActions(scene, risk, grounds, contexts);
    var tacticalActions = buildTacticalActions(scene, risk, contexts);
    var disposals = buildDisposals(scene, risk, grounds, contexts, arrestReasons, gate.blocked.length);
    var evidence = buildEvidenceChecklist(scene, contexts, grounds);
    var rationale = buildRationale(risk, grounds);

    return {
      log: log,
      scene: scene,
      contexts: contexts,
      grounds: grounds,
      risk: risk,
      gate: gate,
      arrestReasons: arrestReasons,
      likelyOffences: likelyOffences,
      cautionText: PACE_CAUTION_TEXT,
      sections: sections,
      immediateActions: immediateActions,
      tacticalActions: tacticalActions,
      disposals: disposals,
      evidence: evidence,
      rationale: rationale,
    };
  }

  return {
    normalizeScene: normalizeScene,
    deriveContexts: deriveContexts,
    evaluateScene: evaluateScene,
  };
});
