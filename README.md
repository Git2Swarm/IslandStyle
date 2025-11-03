# Island Style Wigs Website

Island Style Wigs is a compassionate digital home for women navigating medical or autoimmune hair loss. The site reflects Sheri Blow's faith-forward mission, pairing graceful visuals with education-first content, curated shopping highlights, and clear calls to book private consultations.

This repository now contains both the live site implementation and the original planning collateral so designers, writers, and developers can work from a single source of truth.

## Running the site locally

The site is built with static HTML, CSS, and a small amount of JavaScript. Any static file server will work—use the Python option below if you do not have a preferred tool.

1. **Install dependencies:** none are required.
2. **Start a local server:**
   ```bash
   cd IslandStyle
   python3 -m http.server 4173
   ```
   or run the bundled Node server:
   ```bash
   node scripts/demo-server.mjs
   ```
3. **Open the site:** visit [http://127.0.0.1:4173/index.html](http://127.0.0.1:4173/index.html) in your browser.
4. **Explore the try-on demo:** navigate directly to [http://127.0.0.1:4173/try-on.html](http://127.0.0.1:4173/try-on.html) to upload or sample a portrait.
5. **Stop the server:** press `Ctrl+C` in the terminal when you are finished.

> If you prefer Node-based tooling, `npx serve` from the project root will provide an equivalent static server.

## Project structure

```
IslandStyle/
├── assets/
│   ├── css/
│   │   └── styles.css          # Global typography, color palette, layouts, and responsive rules
│   └── js/
│       ├── main.js            # Mobile navigation toggle and footer year helper
│       ├── try-on-data.js     # Demo favorites, overlays, and sample portrait definitions
│       └── try-on.js          # In-browser try-on controller for uploads and overlays
├── index.html                  # Homepage with hero, promise highlights, testimonials, and consultation CTA
├── about.html                  # Sheri's story, values, and community gratitude messaging
├── expert-help.html            # Glossaries, measurement support, and trusted partner references
├── guides.html                 # Deep-dive resource roadmap and actionable how-to content
├── videos.html                 # Upcoming video programming overview with encouragement features
├── shop.html                   # Curated product categories and future e-commerce roadmap
├── contact.html                # Consultation request form, direct contact details, and FAQs
├── README.md                   # You are here
└── reference/                  # Owner direction, inspiration, and CRM certification resources
```

## Experience highlights

- **Unified navigation & design system:** Sticky navigation, elegant typography, and a neutral-to-gold palette inspired by the owner's reference imagery.
- **Homepage storytelling:** Hero message with dual CTAs, value pillars, testimonial placeholders, faith-affirming callouts, and consultation CTA.
- **Dedicated subpages:** Purpose-built content for About, Expert Help Hub, Hair & Wig Guides, Video Library, Shop Highlights, and Contact per the original blueprint.
- **Accessibility & responsiveness:** Semantic headings, clear focus states, mobile-friendly navigation, and high-contrast call-to-action treatments.

## Planning collateral

Reference materials remain available for future iterations:

- [Owner Direction & Build Strategy](reference/owner-notes-summary.md)

> Note: The design inspiration images mentioned in the original brief should live in `reference/images/`. Upload or refresh them as new creative assets arrive.

## Outstanding inputs

- Confirm the physical address or service locations before publishing contact sections.
- Replace testimonial placeholders when final client stories are ready.
- Prepare downloadable worksheets for the Expert Help Hub as they are finalized.

Keep this README updated as new guidance or assets arrive so the project team always knows where to find the latest references.

## AI Try-On Experience

The repository now ships with an in-browser try-on demo that uses layered artwork to mimic the eventual AI workflow. Everything runs
locally—no external services or credentials required.

- `try-on.html` loads `assets/js/try-on-data.js` and `assets/js/try-on.js` to handle portrait uploads, wig selection, sizing controls,
  and composite downloads directly in the browser.
- `assets/js/try-on-data.js` stores sample favorites, including SVG overlays and a sample portrait. Swap these entries with transparent
  PNGs from your catalog to customize the experience.
- `docs/ai-try-on/` describes both the demo capabilities and the forward-looking production plan.
- `server/` and `ai-service/` remain as future-facing scaffolds. Keep them around if you plan to connect the UI to a cloud-based
  blending pipeline later on.
- `scripts/demo-server.mjs` spins up a zero-dependency static server at [http://127.0.0.1:4173/try-on.html](http://127.0.0.1:4173/try-on.html)
  so reviewers can exercise the demo without additional tooling.

Launch the static server described above and head to `/try-on.html` for a working preview.
