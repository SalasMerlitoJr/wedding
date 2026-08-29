# Merlito & Daisa — Wedding Invitation

A single-link, fully responsive wedding invitation site. Ivory, champagne
gold, blush pink, and sage green, with a script/serif type pairing, a
wax-seal entry gate, scroll-triggered reveals, a live countdown, a masonry
gallery with lightbox, a validated RSVP form, a digital guestbook, and a
dark/light mode toggle.

## Quick start

No build step is required to preview or deploy — it's plain HTML/CSS/JS.

```bash
npm run serve      # or just open index.html in a browser
```

## Add your content

1. **Photos & music** — drop files into `assets/` using the names listed in
   `assets/README.md`. Missing files fall back to elegant placeholders, so
   the site never looks broken while you're gathering content.
2. **Names, dates, venue** — edit the text directly in `index.html`
   (Hero, Details, Program sections). The countdown target date lives in
   `js/script.js` as `WEDDING_DATE`.
3. **Map** — the Details section has a map placeholder card with a
   "Open in Google Maps" link pre-built from your venue name; swap in a
   real embed (Google Maps iframe or your preferred map provider) once you
   have an API key.
4. **Bank / GCash details** — edit the Gift Registry section in
   `index.html`; replace the QR placeholder SVG with an `<img>` of your
   real QR code.

## Project structure

```
index.html          Markup for all 10 sections
css/style.css        All styling (design tokens as CSS custom properties)
js/script.js          Site behavior — this is what index.html loads
scss/                 SCSS token source (optional authoring layer)
ts/script.ts           TypeScript source — validation & countdown logic
tsconfig.json         Compiles ts/ → js/ if you wire up a TS build step
package.json           npm scripts for the optional SCSS/TS pipeline
vercel.json            Static hosting config, ready to deploy
```

## Tech notes

- **RSVPs and guestbook messages** are stored in the visitor's own browser
  (`localStorage`) as a lightweight demo persistence layer — there's no
  backend. For a real event, wire the RSVP form's `submit` handler in
  `js/script.js` to your form endpoint of choice (Formspree, a serverless
  function, Google Sheets via Apps Script, etc.) instead of/alongside the
  local save.
- **Accessibility**: semantic landmarks, visible focus states, `aria-live`
  regions for the countdown and guestbook, and `prefers-reduced-motion`
  support throughout.
- **Performance**: gallery images are `loading="lazy"`, fonts are
  preconnected, and the only animation running continuously (ambient
  particles) is skipped entirely when reduced motion is requested.

## Deploy to Vercel

```bash
npx vercel
```

No framework detection needed — it's a static site, so Vercel will serve
it as-is using `vercel.json`.
