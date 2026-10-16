# Cursed University: The Degree of Understanding

A spooky D&D-inspired, four-year cooperative assessment-redesign game, based on the interaction style of *Curiosity University: It's Alive!* but rewritten for a different learning objective.

**This build runs entirely on GitHub Pages. No developer tools, databases, APIs, or build steps are required to publish it.**

## Play the game

Open `index.html` in a modern browser, or publish the folder with GitHub Pages. It works offline, though the optional Google Fonts stylesheet will use fallback fonts when offline.

1. Participants form tables, **physically roll a six-sided die**, and enter their roll and party name.
2. The table receives one of six students: Jax, Elena, Priya, Marcus, Zoe, or Talia.
3. The spooky campus has four academic buildings (one per year), unlocking in order.
4. Each year, complete **three scenarios**, each requiring a purposeful AI-friction strategy and at least one of the three assessment redesign elements.
5. Face the annual Chancellor boss. Roll a d20 or enter a physical d20 result to determine which type of challenge to answer.
6. A facilitator checks the two KP criteria (+10 for defensible AI friction, +10 for at least one defensible redesign element). **The site does not automatically judge prose.**
7. After four years, face the **Commencement Trial** for the final 20 KP. Four bosses × 20 and commencement × 20 = 100 KP maximum.
8. A table that has fewer than 100 KP may **revisit and strengthen** its earlier boss defenses. It earns only the improved difference, not duplicate points. Graduation requires four years and all 100 KP.

## How to put the game on GitHub Pages

1. Create a repository, for example `cursed-university`.
2. Upload **the contents** of this folder (not the outer zip file) to the repository root. It must include `index.html`, `assets/data.js`, `assets/game.js`, `assets/style.css`, and `.nojekyll`.
3. Go to **Settings → Pages → Build and deployment**.
4. Set **Source: Deploy from a branch** and choose **Branch: main, Folder: /(root)**. Save.
5. GitHub provides a URL in the pattern `https://YOUR-USERNAME.github.io/cursed-university/` once published.

GitHub's instructions: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

**Note:** GitHub Pages is public-facing hosting and cannot execute Node/Python backends. If a future version uses a language model to evaluate team responses, use a separate secured API service and **never place an API key in `index.html` or repository files**.

## Files

- `index.html`: the complete game interface
- `assets/style.css`: the spooky university appearance, maps, transitions, glass brain visuals
- `assets/game.js`: game flow, dice, forms, facilitator scoring, local progress, graduation
- `assets/data.js`: content for **6 × 12 = 72 scenarios** (used in the browser)
- `assets/data.json`: same narrative data for easier inspection or importing
- `STORY_AND_SCENARIOS.md`: full four-year storyline and all 72 playable scenarios
- `printables/character_cards.pdf`: letter-size cards ready to print, 3 cards per page
- `printables/character_cards.html`: a browser-printable edition of the six character cards
- `.nojekyll`: prevents Jekyll from interfering with a plain HTML site

## Changing the game

Edit `assets/data.js` (or edit `assets/data.json` and replace the JavaScript object) to change character names, majors, storyline dialogue, scenario text, assignment constraints, or difficulty. Every character contains 12 scenarios, 3 per year.

The **scored** KP progression is separate from formative scenarios so that a table cannot race to 100 by entering arbitrary long answers. Facilitation remains important: check the quality of a team's friction strategy, its application of at least one framework element, and its reasoning about limitations.

## Privacy and save behavior

- Each table's party name, chosen character, and text inputs are stored in **that browser's localStorage**. They are not automatically sent to GitHub, to other tables, or to instructors.
- Teams sharing a device should use one browser profile and avoid clearing storage during play.
- A new table can press **Reset** to clear locally saved responses on that device.
- GitHub Pages alone does not synchronize scores or store responses centrally.
- For institution-wide live use, ensure tables understand that this is local-only progress and that any required faculty-review export is handled separately.

## Scoring note

A score of 20 means a *defensible response to that challenge*, not a guaranteed proof of student learning. Intentional AI friction is a design choice, not a requirement to prohibit AI. The three assessment elements are **meaningful practice**, **a reason to engage**, and **reasonable conditions and friction**.

## Version

Initial complete GitHub Pages prototype, October 2026.


## Scenario 1: Save Design & Continue troubleshooting (v1.1)

The scenario form now displays a live **0 of 3 ready** checklist. To continue, enter at least 15 characters in both the AI friction and assessment redesign fields and check at least one framework element. The form highlights missing steps and displays a visible message at the top of the screen, rather than silently staying on the same scenario.

After a valid save, the game returns to the top of the page and clearly labels the next scenario (or the Chancellor encounter after scenario 3). Your typed drafts are saved automatically. When updating an existing GitHub Pages site, replace the existing `index.html`, `assets/game.js`, and `assets/style.css` with the updated versions, preserving the rest of the files. **Do not reset the adventure.** The game continues to use the original `cursed-university-v1` localStorage key, so progress on the same browser and GitHub Pages URL is retained.

## Scenario save reliability update — BUILD 1.2.0

This update replaces the implicit HTML form submit with a **direct click handler** for `Save Design & Continue`. A successful save commits the complete draft and its `submitted` flag together before navigating to the next scenario. Each save displays a persistent result under the button as well as the on-screen toast. If the game throws an exception, the message is shown directly under the button rather than failing silently. The game keeps the original `cursed-university-v1` browser storage key.

**After publishing to GitHub Pages:** Look for `BUILD 1.2.0 · Game ready` in the lower-right corner. The CSS and JS file URLs also include `?v=1.2.0` so browsers fetch updated assets after deployment. If the old build is still showing, check that your repository has been updated and reload the Pages URL. **Do not use Reset** while troubleshooting, since that clears the saved party and responses.

When opening a downloaded standalone HTML file, browser storage behavior varies by browser and file location. Copy any unsaved writing before switching files. For a live workshop, use the same published GitHub Pages URL and browser profile to maintain local progress.
