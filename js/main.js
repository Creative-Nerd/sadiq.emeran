/**
 * Boot — SPEC §6.
 * Shell behaviour (nav, year, contact form) + GSAP animation wiring.
 * Principles honoured here:
 *   §6.1.5  hidden states are applied by JS only → site works without JS
 *   §6.4    prefers-reduced-motion → animation modules never run at all
 */

import { initIntro } from './animations/intro.js';
import { initScroll } from './animations/scroll.js';
import { initInteractions } from './animations/interactions.js';

document.documentElement.classList.add('js');

/* ---------- mobile nav ---------- */
const body = document.body;
const header = document.querySelector('[data-header]');
const toggle = document.querySelector('.nav-toggle');
const navLinks = document.getElementById('nav-links');

function setNav(open) {
  body.classList.toggle('nav-open', open);
  toggle?.setAttribute('aria-expanded', String(open));
  // A11 may have hidden the header — put it back at rest instantly and leave
  // NO inline transform, otherwise the fixed menu positions against the header
  if (open && window.gsap && header) {
    window.gsap.killTweensOf(header);
    window.gsap.set(header, { yPercent: 0 });
    header.style.transform = '';
  }
}
toggle?.addEventListener('click', () => setNav(!body.classList.contains('nav-open')));
navLinks?.addEventListener('click', (e) => {
  if (e.target.closest('a')) setNav(false);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') setNav(false);
});

/* ---------- footer year ---------- */
document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = String(new Date().getFullYear());
});

/* ---------- contact form → mailto (TODO Q7: swap for a real endpoint) ---------- */
const form = document.querySelector('[data-contact-form]');
form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const subject = `Portfolio enquiry — ${data.get('type') || 'project'}`;
  const message = `Name: ${data.get('name')}\nEmail: ${data.get('email')}\n\n${data.get('message')}`;
  const status = form.querySelector('.form__status');
  if (status) status.textContent = 'Opening your email app…';
  window.location.href =
    'mailto:hello@sadiqemeran.com' + // TODO Q7: confirm real address
    `?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
});

/* ---------- animations (M2) ---------- */
const gsap = window.gsap;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

function boot() {
  if (reduced || !gsap || !window.ScrollTrigger) {
    // Reduced motion (or missing GSAP): header never hides; keep the
    // background toggle so nav stays readable over content (SPEC §6.4).
    const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return;
  }

  gsap.registerPlugin(window.ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(window.SplitText);
  if (window.ScrollToPlugin) gsap.registerPlugin(window.ScrollToPlugin);

  for (const [name, init] of [
    ['intro', initIntro],
    ['scroll', initScroll],
    ['interactions', initInteractions],
  ]) {
    try {
      init();
    } catch (err) {
      console.error(`[animation:${name}]`, err); // one failing module ≠ blank page
    }
  }

  // triggers must re-measure once images/fonts settle (SPEC §6.1.6)
  window.addEventListener('load', () => window.ScrollTrigger.refresh());
}

boot();
