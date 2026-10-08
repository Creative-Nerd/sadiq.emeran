/**
 * SPEC §6.2 — A9 marquee, A10 magnetic buttons, A14 smooth anchor scroll.
 * Gated by main.js: reduced motion never reaches this module.
 */

const gsap = window.gsap;

export function initInteractions() {
  /* A9 — seamless skills marquee (two identical groups → -50% loops cleanly) */
  const track = document.querySelector('[data-marquee] .marquee__track');
  if (track) {
    gsap.to(track, { xPercent: -50, duration: 20, ease: 'none', repeat: -1 });
  }

  /* A10 — magnetic hover, fine pointers only, max 12px (SPEC §6.5) */
  if (matchMedia('(pointer: fine)').matches) {
    const MAX = 12;
    const STRENGTH = 0.35;
    const clamp = (n) => Math.max(-MAX, Math.min(MAX, n));

    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });

      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        xTo(clamp((e.clientX - r.left - r.width / 2) * STRENGTH));
        yTo(clamp((e.clientY - r.top - r.height / 2) * STRENGTH));
      });
      el.addEventListener('pointerleave', () => {
        xTo(0);
        yTo(0);
      });
    });
  }

  /* A14 — in-page anchor scroll with nav offset; focus lands on the target (a11y) */
  const navOffset = () => {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--nav-h');
    return (parseInt(v, 10) || 76) + 16;
  };
  const currentFile = location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('a[href*="#"]').forEach((a) => {
    const href = a.getAttribute('href') || '';
    if (href === '#' || a.classList.contains('skip-link')) return;
    const [path, hash] = href.split('#');
    if (!hash) return;
    // same-page targets only; cross-page links keep native navigation
    if (path && path !== currentFile && path !== './' + currentFile) return;
    const target = document.getElementById(decodeURIComponent(hash));
    if (!target) return;

    a.addEventListener('click', (e) => {
      e.preventDefault();
      gsap.to(window, {
        duration: 1,
        ease: 'expo.inOut',
        scrollTo: { y: target, offsetY: navOffset() },
        onComplete: () => {
          history.pushState(null, '', '#' + hash);
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        },
      });
    });
  });
}
