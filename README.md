# EPICAL PD Assistant - Dynamic Local Test

Rule-based UK-policing RP assistant for FiveM (no API key required).

## What changed in this iteration

- Dynamic form sections that appear/disappear based on prior choices:
  - `Vehicle Dynamics`
  - `Pursuit Metrics`
  - `Drug Intelligence`
- Expanded risk factors:
  - Speed, road type, traffic density
  - Pursuit duration, failed stop signals
  - Drug quantity and packaging profile
  - Subject violence/intoxication flags
- Structured outputs:
  - Specific disposal methods with reasons + UK references
  - Arrest necessity reasons
  - Likely offences
  - PACE caution text
  - Local timestamp logging (`en-GB` style)
- New continuation workflow:
  - `investigations.html` handover page fed from latest action card via `localStorage`
  - Generates a UK-style investigation log for follow-on roleplay

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
