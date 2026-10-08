# Sadiq Emeran — Portfolio

Static portfolio site for **Sadiq Emeran** — WordPress development, SEO & AI.
Hand-rolled HTML/CSS/JS with **GSAP** (ScrollTrigger, SplitText, ScrollTo) animations.
Full requirements and animation inventory: see [`SPEC.md`](SPEC.md).

## Quick start

```bash
npm install       # gsap + vite
npm run vendor    # copy GSAP dist files into js/vendor/ (already committed)
npm run dev       # dev server → http://localhost:3000
```

No build step: the repo *is* the deployable site (any static host —
GitHub Pages, Netlify, Cloudflare Pages; all paths are relative).

## Structure

```
index.html  about.html  contact.html   # pages
css/        tokens · base · components · animations (design system)
js/         main.js (shell) + vendor/ (gsap, ScrollTrigger, SplitText, ScrollToPlugin)
fonts/      self-hosted variable woff2 (Inter, Space Grotesk — latin subset)
images/     personal assets (drop in when ready)
```

## Conventions

- Animation is data-attribute driven (`data-anim`, `data-counter`, `data-magnetic`) — see SPEC §6.3.
- Hidden initial states are applied by JS only, so the site works without JS.
- `prefers-reduced-motion` disables all motion (SPEC §6.4).
