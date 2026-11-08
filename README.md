# Disaster Access Lab — Capstone 02

An interactive South Carolina research explorer combining county-level CDC PLACES
hearing-disability estimates, NOAA tornado county-event records (2023–2025), FEMA
modeled hurricane economic losses, and a seven-county public-document review.

**Public research snapshot:** 2026-11-08  
**Scope:** 46 counties; 7 reviewed for public documentation; 49 criteria
(21 documented,
28 needing confirmation).

## Run locally

From this folder:

```powershell
python -m http.server 8000
```

Open <http://localhost:8000>.

## Deploy

Import this repository into Vercel. Set **Framework Preset: Other**, **Root
Directory: ./**, and disable/leave blank the build command. This is a static
HTML/CSS/JavaScript site; no runtime environment variables are required.
See `DEPLOYMENT_GUIDE.md`.

## Interpretation

- This is **not** a weather forecast, emergency warning, personal vulnerability
  score, or assessment of ADA compliance.
- FEMA's expected annual loss reflects modeled **economic** loss, not alert
  accessibility, individual safety, or storm probability.
- NOAA county-event records need not represent unique tornadoes.
- County disability percentages are model estimates, not identified individuals.
- Public-document statuses reflect evidence reviewed; no documentation is **not**
  proof that accommodations are missing.
- The tornado-classification comparison is retrospective, with one held-out year
  (2025). Better ranking did not establish reliable probability calibration.

## Sources

- [CDC PLACES](https://www.cdc.gov/places/)
- [NOAA Storm Events](https://www.ncei.noaa.gov/stormevents/)
- [FEMA National Risk Index](https://www.fema.gov/flood-maps/products-tools/national-risk-index)
- [ADA effective communication](https://www.ada.gov/resources/effective-communication/)

This repository contains a **public-facing static app only**. Raw datasets,
research scripts, private outreach drafts and replies are not included in this
release. The full research pipeline remains in the separate local project.
