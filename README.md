# EPICAL PD Assistant - Dynamic Local Test

Rule-based UK-policing RP assistant for FiveM (no API key required).

## What changed in this iteration

- Dynamic form sections that appear/disappear based on prior choices:
  - `Vehicle Dynamics`
  - `Pursuit Metrics`
  - `Drug Intelligence`
- Expanded risk factors:
  - Speed against city limits (50 non-motorway, 100 motorway)
  - Road type, traffic density
  - Pursuit duration, failed stop signals
  - Drug quantity and packaging profile
  - Cash amount vs city tolerance threshold (GBP 10,000)
  - Subject violence/intoxication flags
- Structured outputs:
  - Specific disposal methods with reasons + UK references
  - Arrest necessity reasons
  - Likely offences
  - PACE caution text
  - Local timestamp logging (`en-GB` style)
- City policy routes:
  - Cannabis <=15g defaults to confiscation/street resolution when no aggravating factors
  - Cash <=GBP 10,000 treated as generally acceptable unless other indicators escalate
  - Traffic lights treated as give-way reminder included
- New continuation workflow:
  - `investigations.html` handover page fed from latest action card via `localStorage`
  - Generates a city-computer arrest record format with initial/final outcome and authorization lines
- UI:
  - Dark mode with persistent local preference across pages

## Run locally

1. Open `index.html` in browser.
2. Complete the scene form (action card auto-refreshes live).
3. Click `Open Investigations Handover Page` to continue into follow-on casework.

## Run CLI tests

```powershell
cd C:\Users\bobman\epical-pd-local-test
node .\tests.js
```

## Files

- `index.html` - dynamic scene form UI
- `app.js` - browser logic, show/hide flow, rendering, case save
- `engine.js` - deterministic rule engine
- `investigations.html` - follow-on investigations page
- `investigations.js` - handover generator and copy tool
- `tests.js` - local CLI scenario tests

## Important

This is RP decision support only, not real legal advice.
