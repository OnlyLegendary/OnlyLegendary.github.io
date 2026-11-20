# Seth / Hardware — portfolio website

A complete static engineering portfolio using HTML, CSS and JavaScript. No build step, analytics, external fonts, frameworks or trackers. All project pictures are the owner's uploaded work.

## Files

- `index.html` — main site
- `projects/offinator.html`, `rp2350.html`, `pendant.html` — individual project pages
- `assets/styles.css`, `assets/main.js`, `assets/favicon.svg`
- `assets/*.webp` — actual engineering photos, schematics and CAD renders

## Deploy to GitHub Pages

1. Back up your existing photography website first.
2. Open the GitHub repository currently used to serve your portfolio domain.
3. Replace the old site files at its published root with the contents of **this folder**, not the folder itself.
4. Commit and push. Your existing GitHub Pages configuration and custom domain should continue to work **if you keep the repository's existing CNAME file and Pages settings**.
5. Test `/`, `/projects/offinator.html`, `/projects/rp2350.html`, `/projects/pendant.html` and the mobile menu.

**Do not delete your existing `CNAME` file.** If you publish through a custom domain, preserve its exact contents. Confirm the intended domain spelling.

## Customize before publishing

- `index.html`: edit the intro, project descriptions, and "About" to reflect your words.
- `index.html`: current Contact button links to `https://github.com/OnlyLegendary` rather than publishing a personal email. Swap it for a dedicated professional email if desired.
- The pages describe the Offinator as physically fabricated and assembled; other projects are labeled as design-stage work. Update status text only as supported by your evidence.
- If you prefer not to display that you're in high school or located in Florida on a public website, remove that sentence in the About section.

## Local test

Open `index.html` in a browser or run `python3 -m http.server 8000` from this folder and visit `http://localhost:8000`.
