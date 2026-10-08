# SPEC — Sadiq Emeran Portfolio Site (GSAP + HTML/CSS Animation)

| | |
|---|---|
| **Status** | Draft v0.2 — core decisions locked, content pending |
| **Date** | 2026-10-08 |
| **Owner** | Sadiq Emeran |
| **Repo** | `Creative-Nerd/site` (branch `main`) |
| **v0.2 changes** | Full repo overwrite decided (D0); owner + positioning confirmed (Q1); 3 WordPress projects, details TBC (Q3); blog dropped from v1 (Q5 default); unanswered questions defaulted so they don't block M1 |

---

## 0. Ground rules

- **D0 — Full overwrite.** This repo is replaced wholesale: the charity template (Bootstrap 3, jQuery, superfish, waypoints, stellar, animate.css, sass, icomoon, demo images, 4 old pages) is removed in M1. Git history (`654ca04`) preserves it if ever needed.
- **Positioning:** *Sadiq Emeran — WordPress development, SEO & AI.* Three pillars (**WordPress / SEO / AI**) drive the content: capabilities, marquee, project tags, and (later) writing topics.
- Everything ships in this repo as static HTML/CSS/JS — no template leftovers.

---

## 1. Purpose & success criteria

Build a personal portfolio that:

1. **Showcases work** — a visitor understands who Sadiq is, what he's built (WordPress sites), and how to contact him within ~60 seconds.
2. **Demonstrates animation craft** — GSAP-driven motion is the signature of the site, layered on top of HTML/CSS, not a gimmick bolted on.
3. **Stays fast and accessible** — motion never costs usability.

**Success measures:**

- Lighthouse: Performance ≥ 90, Accessibility ≥ 95 (mobile, throttled).
- Scroll/animation runs at 60 fps; transform/opacity animation only.
- Fully readable with JavaScript disabled; all content reachable by keyboard.
- `prefers-reduced-motion: reduce` → equivalent page with motion removed, no content hidden.

---

## 1b. Current state → target state

| | Today (v0.1 repo) | Target (v0.2) |
|---|---|---|
| Pages | index/about/blog/contact (charity copy) | **index/about/contact** — blog dropped from v1 (Q5) |
| CSS | Bootstrap 3, animate.css, superfish.css, icomoon.css, style.css, unbuilt sass | `css/tokens.css` + `base.css` + `components.css` + `animations.css` (custom properties, no framework) |
| JS | jQuery + 8 plugins, `main.js` | Vanilla ES modules + vendored GSAP (`js/vendor/`) |
| Fonts/icons | icomoon, bootstrap glyphs | Inline SVG icons; 2 self-hosted woff2 (Q6 default) |
| Images | charity/Unsplash demo | None required for v1 — type-led + CSS-generated visuals; real assets dropped into `images/` later (Q2) |
| Build | none | `package.json` only: pins `gsap`, `vite` for dev serve (D1) |
| GSAP | absent | GSAP 3.13+ (plugins free), vendored locally |

---

## 2. Scope

**In scope**

- 3 static pages: Home, About, Contact (file-per-page: `index.html`, `about.html`, `contact.html`).
- Design system in modern CSS (custom properties, fluid type, no preprocessor).
- GSAP animation system per §6: intro, scroll reveals, parallax, counters, marquee, hover micro-interactions, magnetic CTA.
- Content: owner intro, **3 WordPress project cards** (placeholders until details arrive), WordPress/SEO/AI capabilities, contact.
- Responsive (mobile-first), dark direction (D4 default), a11y + perf budgets (§8–9).

**Out of scope (v1)**

- Blog/Journal page — dropped; replaced by an external "Writing" link section (can return in M5 with a static generator).
- CMS/backend/form service — contact uses `mailto:` + placeholder socials until Q7 answered.
- 3D/WebGL, video, audio, page-transition frameworks, ScrollSmoother, custom cursor (M5 candidates).

---

## 3. Information architecture

### Page map

```
index.html    Home — hero, marquee, selected work, about, capabilities, contact CTA
about.html    Story, timeline, capabilities detail, working method
contact.html  Contact details, social links, mailto form
```

### Homepage section order (the animation spine)

| # | Section | Signature animation |
|---|---|---|
| 0 | Preloader | counter 0→100 + curtain wipe out (`power4.inOut`) |
| 1 | Fixed nav | hides on scroll down, returns on scroll up; bg fades in after hero |
| 2 | Hero | name + role SplitText line reveal; parallax/gradient backdrop; scroll cue |
| 3 | Marquee strip | infinite ticker: `WordPress · SEO · AI · WooCommerce · …` |
| 4 | Selected work | 3 WordPress project cards: staggered reveals + in-card image parallax (A6) |
| 5 | About / stats | heading mask reveal + animated counters (years, projects, coffee) |
| 6 | Capabilities | 6 cards — WordPress dev, Technical SEO, Content SEO, AI integration, Performance, Maintenance — staggered fade-up, hover lift |
| 7 | Contact CTA | oversized heading reveal + magnetic button |
| 8 | Footer | social icons stagger in |

Each section has `id` anchors (`#work`, `#about`, `#contact`) for in-page nav.

---

## 4. Design system

All values as CSS custom properties in `:root`; GSAP reads the same tokens so motion and design never drift.

```css
:root {
  /* color — D4 default (dark); refine when Q8 reference lands */
  --color-bg, --color-surface, --color-text, --color-muted, --color-accent, --color-line;

  /* fluid type scale */
  --fs-display: clamp(3rem, 8vw, 7.5rem);
  --fs-h2:     clamp(2rem, 4.5vw, 3.5rem);
  --fs-body:   clamp(1rem, 1.1vw, 1.125rem);

  /* spacing & layout */
  --space-section: clamp(5rem, 12vh, 10rem);
  --container: min(1400px, 92vw);
  --gutter: clamp(1rem, 3vw, 2rem);

  /* motion tokens — single source of truth */
  --dur-fast: 0.25s;   --dur-base: 0.6s;  --dur-slow: 1s;
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out-quart: cubic-bezier(0.76, 0, 0.24, 1);
}
```

- **Grid:** 12-column on `--container`; breakpoints 640 / 900 / 1200 px (mobile-first).
- **Type (Q6 default):** Space Grotesk (display) + Inter (text), self-hosted woff2, `font-display: swap`.
- **Icons (D5):** inline SVG — no icon-font dependency.

---

## 5. Content model

| Field | Status |
|---|---|
| Name | **Sadiq Emeran** ✅ |
| Role / pillars | **WordPress development · SEO · AI** ✅ |
| Tagline | draft: *"I build fast WordPress sites that rank — and put AI to work."* (wording TBC) |
| Projects | **3 WordPress sites** ✅ — placeholders with fields: name, industry, URL, stack, SEO outcome (traffic/keywords), AI usage. Details from Sadiq (Q3b). |
| Marquee skills | WordPress, WooCommerce, Technical SEO, Local SEO, Core Web Vitals, AI automation, ChatGPT/API integrations, content strategy |
| About copy + stats | placeholder stats until Q4 |
| Portrait/brand imagery | none required for v1 (type-led); drop into `images/` when available (Q2) |
| Email + socials | placeholders until Q7 |
| Favicon | simple "SE" SVG mark until brand asset arrives |

Placeholder copy must be visibly marked `TODO` in source; never lorem in the final pass.

---

## 6. Animation system (core of the spec)

### 6.1 Principles

1. **Transform + opacity only** — no animating layout properties; `will-change` only while animating.
2. **Scroll animations play once** (`once: true`) unless scrubbed parallax.
3. **Data-attribute driven** (`data-anim`) — new markup gets animation with zero JS edits.
4. **One `gsap.context()` per page** for clean teardown/revert.
5. **Progressive enhancement** — with JS off everything is visible; hidden initial states applied by JS, never CSS alone.
6. **`ScrollTrigger.refresh()`** after font/image load and debounced resize.

### 6.2 Animation inventory

| ID | Name | Trigger | What moves | Timing | Plugin |
|----|------|---------|-----------|--------|--------|
| A1 | Preloader exit | assets loaded / 2.5s timeout | counter, curtain panels up | `1s power4.inOut` | gsap |
| A2 | Hero line reveal | on load (after A1) | SplitText lines `yPercent 110 → 0`, masked | `1.1s expo.out`, stagger `0.08` | SplitText |
| A3 | Hero parallax | scroll, scrub | backdrop `yPercent -15` | scrub | ScrollTrigger |
| A4 | Section reveal | enter `top 80%` | `[data-anim]` children `y:40, opacity:0 → 0,1` | `0.9s expo.out`, stagger `0.09` | ScrollTrigger |
| A5 | Heading mask reveal | enter | lines mask up | `0.8s power3.out` | ScrollTrigger + SplitText |
| A6 | Work card parallax | scrub | inner visual `scale 1.15`, `yPercent ±8` | scrub | ScrollTrigger |
| A7 | Pinned horizontal work | *(gated by D6 — off by default)* | track `x` | `scrub 1`, pin | ScrollTrigger |
| A8 | Counters | enter once | `0 → n` textContent | `1.6s power1.out` | gsap |
| A9 | Marquee | continuous | duplicated track `xPercent -50` | `20s linear repeat:-1` | gsap |
| A10 | Magnetic button | pointer move | `x/y` toward cursor, max 12px | `quickTo 0.4s power3.out` | gsap |
| A11 | Nav hide/show | scroll direction | nav `yPercent -100 ↔ 0` | `0.4s power2.out` | ScrollTrigger |
| A12 | Nav background | past hero | bg + blur fade in | `0.3s` | ScrollTrigger |
| A13 | Hover micro-interactions | CSS only | underline sweep, card lift, SVG arrow slide | `--dur-fast` | CSS transition |
| A14 | Smooth anchor scroll | nav click | scrollTo with offset | `1s expo.inOut` | ScrollToPlugin |
| A15 | *(Optional)* custom cursor | pointer (fine pointers) | dot + lagging ring | `quickTo` | gsap |

### 6.3 Technical notes

- **Delivery:** vendored UMD files in `js/vendor/` (`gsap.min.js`, `ScrollTrigger.min.js`, `SplitText.min.js`, `ScrollToPlugin.min.js`) via `<script>` tags — pinned in `package.json`, copied by `npm run vendor`. No CDN.
- **SplitText** free since GSAP 3.13 — used for A2/A5, re-split on breakpoint change (`ResizeObserver`).
- **ScrollSmoother:** not in v1 (mobile caveats, weight); native scroll + A3/A6 covers it. Revisit M5.
- **Modules:** `js/main.js` (boot + reduced-motion gate + plugin registration) → `js/animations/{intro,scroll,interactions}.js`, each `init(ctx)`.
- **Registry:**

  ```html
  <section data-anim="reveal" data-stagger="0.09">…</section>
  <h2 data-anim="mask-lines">…</h2>
  <div data-counter="120" data-suffix="+">0</div>
  ```
- **Replacements:** stellar → A3/A6; waypoints+animate.css → A4/A5; superfish → CSS + vanilla toggle; jQuery → vanilla/`gsap.utils`.

### 6.4 Reduced-motion policy

- `matchMedia('(prefers-reduced-motion: reduce)')` checked **before** creating timelines.
- If reduce: A1 skipped (preloader hidden immediately), reveals set to final state, A3/A6/A7/A9/A14/A15 disabled, A13 kept (≤150ms opacity/color only).
- CSS backstop: `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; } }`.

### 6.5 Mobile policy

- A7 desktop-only ≥900px (currently off by default per D6).
- A15 only on `(pointer: fine)`.
- FPS sampling in M4; disable scrub effects if jank detected.

---

## 7. Tech stack & file structure

Static HTML + modern CSS + vanilla JS + vendored GSAP. No framework, no bundler, no jQuery.

```
/
├── index.html  about.html  contact.html
├── SPEC.md  README.md  package.json  vite.config.js (if needed)
├── css/
│   ├── tokens.css          # custom properties (§4)
│   ├── base.css            # reset, typography, layout primitives
│   ├── components.css      # nav, cards, buttons, marquee, footer
│   └── animations.css      # keyframes + reduced-motion backstop
├── js/
│   ├── vendor/             # gsap.min.js, ScrollTrigger.min.js, SplitText.min.js, ScrollToPlugin.min.js
│   ├── main.js             # boot, gsap.context(), reduced-motion gate
│   └── animations/
│       ├── intro.js        # A1, A2
│       ├── scroll.js       # A3–A8, A11, A12 (data-anim registry)
│       └── interactions.js # A9, A10, A14, A15
├── images/                 # personal assets when available (Q2)
├── fonts/                  # self-hosted woff2 subset
└── favicon.svg             # "SE" mark
```

**Removed in M1:** `css/*` (bootstrap, animate, icomoon, style, superfish), `js/*` (all jQuery plugins + old main.js), `sass/`, `fonts/bootstrap`, `fonts/icomoon`, `images/*` demo art, `blog.html`, `README.txt`.

---

## 8. Performance budgets

| Metric | Budget |
|---|---|
| JS first load (gzip) | ≤ 60 KB; GSAP core + ScrollTrigger ≈ 40 KB gz |
| CSS (gzip) | ≤ 25 KB |
| Images per page | ≤ 350 KB; hero preloaded, rest `loading="lazy"` `decoding="async"` |
| Fonts | ≤ 2 woff2 subset, preloaded, `font-display: swap` |
| LCP | ≤ 2.5 s simulated mobile |
| CLS | < 0.1 (`width/height` or `aspect-ratio` on all media) |
| Long tasks during scroll | none > 50 ms |

---

## 9. Accessibility

- Landmarks `header/nav/main/section/footer`; one `h1` per page; ordered headings.
- `:focus-visible` ring; skip-to-content link.
- Nothing hover-only; nav keyboard-usable; A7 keyboard-safe if enabled.
- Contrast ≥ 4.5:1 body / 3:1 large.
- `aria-label` on icon-only controls; visible form labels; `aria-live` errors.
- Reduced-motion parity (§6.4); content never depends on an animation finishing.

---

## 10. Acceptance criteria

- [ ] All §5 pending content fields delivered by Sadiq; `TODO` markers removed.
- [ ] 3 pages render at 360 / 768 / 1280 / 1920 px with no horizontal overflow.
- [ ] Zero template remnants: no jQuery/Bootstrap/animate.css/waypoints/stellar/icomoon references or files.
- [ ] All pages load GSAP from `js/vendor/` locally (no CDN).
- [ ] A1–A14 implemented and verified per §6.2 (A15/A7 only if their gates flip).
- [ ] JS-disabled pass: all content visible and navigable.
- [ ] `prefers-reduced-motion` pass: no motion, no hidden content.
- [ ] Keyboard pass: tab order, visible focus, anchor scroll targets focused.
- [ ] Lighthouse ≥ 90 perf / ≥ 95 a11y; §8 budgets met (report attached).
- [ ] Scroll profiling: no long tasks > 50 ms.
- [ ] Dev-server preview verified in browser panel: console clean, no 404s, content correct.

---

## 11. Milestones

| # | Deliverable | Exit |
|---|---|---|
| **M0** | Spec agreed (this doc) | D0–D7 set, Q1 answered |
| **M1** | Foundation: old repo wiped, tokens + CSS system, 3 page shells with real structure & placeholder content | preview renders, responsive |
| **M2** | Animation core: A1–A5, A11–A14 + reduced-motion gate | intro + reveals verified |
| **M3** | Work section A6, counters A8, marquee A9, magnetic A10 | homepage motion complete |
| **M4** | Content & polish: real project details, imagery, a11y + perf gates | §10 checklist green |
| **M5** | Optional: blog/journal, page transitions, ScrollSmoother, cursor, SEO extras | as prioritized |

---

## 12. Decisions & open questions

**Decisions:**

| ID | Topic | Status / resolution |
|----|---|---|
| D0 | Repo strategy | ✅ **Full overwrite** — charity template removed in M1 |
| D1 | Build tooling | ✅ No bundler — `package.json` pins GSAP; Vite for dev serve |
| D2 | CSS framework | ✅ Drop Bootstrap — hand-rolled custom-property system |
| D3 | Page structure | ✅ 3 pages: Home one-pager (#work #about #contact) + About + Contact |
| D4 | Visual direction | ⚠️ **Default: dark, high-contrast, oversized type** — swap when Q8 lands |
| D5 | Icons | ✅ Inline SVG |
| D6 | Work section motion | ⚠️ **Default: staggered grid + A6 parallax**; A7 pin off unless requested |
| D7 | Extra flourishes | ✅ Deferred to M5 |

**Questions:**

| ID | Question | Status |
|---|---|---|
| Q1 | Name/role/pitch | ✅ **Sadiq Emeran — WordPress, SEO, AI** (tagline wording TBC) |
| Q2 | Personal imagery | ⏳ Default: type-led design, no photos needed for v1 |
| Q3 | Project details | ⏳ **3 WordPress sites confirmed** — need: name, URL, industry, what you did, SEO results, AI angle |
| Q4 | About copy + stats | ⏳ Placeholder stats for M1–M3, real values before M4 |
| Q5 | Blog page | ✅ **Dropped from v1** (external "Writing" link instead) |
| Q6 | Typography | ⚠️ Default: Space Grotesk + Inter, self-hosted |
| Q7 | Contact email/socials | ⏳ `mailto:` + placeholder links until provided |
| Q8 | Aesthetic reference | ⏳ Default dark/high-contrast stands until reference given |
| Q9 | Hosting target | ⏳ Default: relative paths → any static host (GH Pages/Netlify/CF Pages) |

---

## 13. Risks

| Risk | Mitigation |
|---|---|
| Animation-heavy page janks on low-end mobile | Budgets §8, mobile policy §6.5, profiling gate M4 |
| Motion hides content if JS fails | Progressive enhancement §6.1.5 |
| Scope creep mid-build | Inventory frozen §6.2; new items → M5 |
| Placeholder content ships in final | Q3/Q4/Q7 block M4, tracked §10 |
| Old template accidentally mixed in | §10 "zero template remnants" check + `grep` verification in M4 |
