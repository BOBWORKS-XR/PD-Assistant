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
      drugQuantityGrams: 1.5,
      drugPackaging: "personal",
      vehicleAntisocial: false,
      priorS59Warning: false,
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
  console.log("Blocked:", result.gate.blocked.length ? result.gate.blocked.join(" | ") : "No");
  console.log("Arrest reasons:", result.arrestReasons.length ? result.arrestReasons.join(" ; ") : "None");
  console.log("Offences:", result.likelyOffences.length ? result.likelyOffences.join(" ; ") : "None");
  console.log(
    "Disposals:",
    result.disposals
      .map((d) => `${d.method} [${d.ukReference}]`)
      .join(" ; ")
  );
}
