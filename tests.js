const { evaluateScene } = require("./engine.js");

const scenarios = [
  {
    name: "Hostage blocked under 4 PD",
    input: {
      location: "Legion Square",
      mode: "foot",
      incidentType: "hostage",
      behavior: "aggressive",
      pdOnDuty: 3,
      groupSize: 2,
      grounds: ["witness_statement"],
    },
  },
  {
    name: "Traffic stop with low quantity drugs",
    input: {
      location: "Alta St",
      mode: "vehicle",
      incidentType: "traffic_stop",
      behavior: "compliant",
      pdOnDuty: 6,
      groupSize: 1,
      grounds: ["smell_drugs", "drug_paraphernalia"],
      speedMph: 38,
      roadType: "urban",
      trafficDensity: "medium",
      drugType: "cannabis",
      drugQuantityGrams: 14.5,
      drugPackaging: "personal",
      seizedCashGbp: 8500,
      vehicleAntisocial: false,
      priorS59Warning: false,
    },
  },
  {
    name: "Officer profile with multiple suspects",
    input: {
      location: "Sinner Street Police Station",
      mode: "vehicle",
      incidentType: "traffic_stop",
      behavior: "evasive",
      officerName: "Tom Workingston",
      officerRank: "spc",
      officerNumber: "110",
      officerPatrolMode: "traffic_unit",
      suspectNames: ["Tommy Egan", "Unknown Male"],
      pdOnDuty: 6,
      groupSize: 2,
      grounds: ["witness_statement"],
      speedMph: 61,
      roadType: "urban",
      trafficDensity: "medium",
      vehiclePulledOver: true,
      refusesProvideId: true,
      refusesVehicleDocs: true,
    },
  },
  {
    name: "Cash over threshold with drug indicators",
    input: {
      location: "Little Seoul",
      mode: "foot",
      incidentType: "suspicious_person",
      behavior: "evasive",
      pdOnDuty: 6,
      groupSize: 1,
      grounds: ["smell_drugs", "admission_made"],
      drugType: "class_b",
      drugQuantityGrams: 8,
      drugPackaging: "split_bags",
      seizedCashGbp: 18000,
      refusesProvideId: true,
      suspectedFalseIdentity: true,
      obstructiveConduct: true,
    },
  },
  {
    name: "Traffic stop with ID and docs refusal",
    input: {
      location: "Downtown",
      mode: "vehicle",
      incidentType: "traffic_stop",
      behavior: "evasive",
      pdOnDuty: 5,
      groupSize: 1,
      speedMph: 76,
      roadType: "urban",
      trafficDensity: "medium",
      vehiclePulledOver: true,
      refusesProvideId: true,
      refusesVehicleDocs: true,
      noFixedAddress: true,
      grounds: ["witness_statement"],
    },
  },
  {
    name: "Vehicle context without lawful stop yet",
    input: {
      location: "Del Perro",
      mode: "vehicle",
      incidentType: "suspicious_person",
      behavior: "compliant",
      pdOnDuty: 4,
      groupSize: 1,
      speedMph: 0,
      roadType: "urban",
      trafficDensity: "low",
      vehiclePulledOver: false,
      refusesVehicleDocs: true,
      refusesProvideId: true,
      grounds: [],
    },
  },
  {
    name: "Face covering refusal without s60 authorization",
    input: {
      location: "Mission Row",
      mode: "foot",
      incidentType: "suspicious_person",
      behavior: "compliant",
      pdOnDuty: 6,
      faceCoveringPresent: true,
      refusesRemoveFaceCovering: true,
      grounds: ["intel_link"],
      s60Authorized: false,
    },
  },
  {
    name: "Public disorder with safeguarding and obstruction risks",
    input: {
      location: "Legion Square",
      mode: "foot",
      incidentType: "public_disorder",
      behavior: "aggressive",
      pdOnDuty: 7,
      groupSize: 4,
      childVulnerableRisk: true,
      propertyDamageRisk: true,
      highwayObstructionRisk: true,
      publicDecencyRisk: true,
      grounds: ["witness_statement"],
    },
  },
  {
    name: "Extended high-speed pursuit with weapons",
    input: {
      location: "Vinewood Blvd",
      mode: "vehicle",
      incidentType: "pursuit",
      behavior: "fleeing",
      pdOnDuty: 8,
      groupSize: 3,
      publicDensity: "high",
      grounds: ["weapon_bulge", "stolen_vehicle_marker", "admission_made"],
      weaponSeen: true,
      activeShots: true,
      knownViolenceMarker: true,
      speedMph: 124,
      roadType: "urban",
      trafficDensity: "high",
      pursuitDurationMin: 24,
      failedStopSignals: 7,
      vehicleCondition: "blown_tires",
      taserHitTwo: true,
      medicalAttemptDuringActive: true,
      priorS59Warning: true,
    },
  },
];

for (const scenario of scenarios) {
  const result = evaluateScene(scenario.input);
  console.log("=".repeat(72));
  console.log("Scenario:", scenario.name);
  console.log("Local Log:", result.log.local, "| TZ:", result.log.timezone);
  console.log("Risk:", result.risk.level.toUpperCase(), "Score:", result.risk.score);
  console.log("Grounds:", result.grounds.level.toUpperCase(), "Score:", result.grounds.score);
  console.log("Officer:", result.officerProfile.display, "| Patrol:", result.officerProfile.patrolLabel);
  console.log("Suspects:", result.suspectSummary);
  console.log("Blocked:", result.gate.blocked.length ? result.gate.blocked.join(" | ") : "No");
  console.log("Arrest reasons:", result.arrestReasons.length ? result.arrestReasons.join(" ; ") : "None");
  console.log("Offences:", result.likelyOffences.length ? result.likelyOffences.join(" ; ") : "None");
  console.log("Quick ref:", result.quickReference.primaryAction, "|", result.quickReference.disposal);
  console.log("Top bar:", result.topBarSummary.topPoint, "|", result.topBarSummary.keySection, "|", result.topBarSummary.nextStep);
  console.log(
    "IDCOPPLAN:",
    result.necessityChecklist.length
      ? result.necessityChecklist
          .map((n) => `${n.code === "P2" ? "P" : n.code}:${n.title}`)
          .join(" | ")
      : "None"
  );
  console.log("PACE:", result.paceTriggers.length ? result.paceTriggers.join(" | ") : "None");
  console.log(
    "Pointer:",
    result.triggerPointers.length ? `${result.triggerPointers[0].level.toUpperCase()} - ${result.triggerPointers[0].title}` : "None"
  );
  console.log("Speed profile:", result.risk.speedProfile.speedLimit, "limit,", result.risk.speedProfile.overLimit, "over");
  console.log(
    "Disposals:",
    result.disposals
      .map((d) => `${d.method} [${d.ukReference}]`)
      .join(" ; ")
  );
}
