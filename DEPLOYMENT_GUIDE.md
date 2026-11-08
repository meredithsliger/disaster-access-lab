# Step 32 — GitHub and Vercel deployment guide

## Before publishing

1. Review `data/research.json` and `data/sc_counties.geojson` to confirm they
   contain only research metrics, county shapes, evidence statuses and public URLs.
2. Recheck official source links, the methodology, and any dataset use conditions.
3. Confirm `index.html`, `styles.css` and `app.js` work locally.
4. Never add the original `data/`, `reports/`, `.venv/`, SQLite database,
   outreach spreadsheets, draft messages, or `.env` files to this release.

## Create the public GitHub repository

1. In GitHub, make a new **empty** public repository named `disaster-access-lab`.
   Do not add a README, .gitignore or license on GitHub; this release has its own.
2. Open PowerShell in the **release/disaster-access-lab-site** folder.
3. Verify Git is available: `git --version`.
4. Run:

   git init
   git add .
   git status
   git commit -m "Publish Disaster Access Lab static research explorer"
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/disaster-access-lab.git
   git push -u origin main

   Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username.
   Before committing, `git status` should show only the public allowlisted files
   and these release documentation files.

## Connect Vercel

1. Open https://vercel.com/new and import `disaster-access-lab`.
2. Choose **Framework Preset: Other** and **Root Directory: ./**.
3. Set **Build Command** override to blank (no build); don't use Python on Vercel.
4. Deploy and open the actual Vercel-assigned URL. Do not assume the slug.
5. Test maps, evidence links, the 46-county table, mobile, keyboard, and DevTools console.
6. Only after the live application passes, add its actual URL to the existing portfolio.

## Updating later

When research changes, regenerate the original local webapp (Step 29), apply
Step 30, rerun Step 31 and recreate this package. Review the changed files before
pushing new commits. Do not overwrite a Git repository's `.git` directory.
