/**
 * SPEC §6.2 — A3 backdrop parallax, A4 section reveals, A5 heading masks,
 * A6 work-card parallax, A8 counters, A11 nav hide/show, A12 nav background.
 * Driven by the data-attribute registry: new markup animates with no JS edits.
 */

const gsap = window.gsap;

const fontsReady = () =>
  (document.fonts ? document.fonts.ready : Promise.resolve()).catch(() => {});

export function initScroll() {
  const hero = document.querySelector('.hero, .page-hero');
  const header = document.querySelector('[data-header]');

  /* A3 — backdrop parallax (scrub) */
  const backdrop = document.querySelector('[data-parallax]');
  if (backdrop && hero) {
    gsap.to(backdrop, {
      yPercent: -15,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  /* A4 — staggered section reveals (once) */
  document.querySelectorAll('[data-anim="reveal"]').forEach((el) => {
    const targets = el.children.length ? [...el.children] : [el];
    gsap.from(targets, {
      y: 40,
      opacity: 0,
      duration: 0.9,
      ease: 'expo.out',
      stagger: 0.09,
      clearProps: 'transform', // don't leave inline transforms over CSS :hover
      scrollTrigger: { trigger: el, start: 'top 80%', once: true },
    });
  });

  /* A5 — heading mask reveal (hero headings are owned by intro.js) */
  fontsReady().then(() => {
    document.querySelectorAll('[data-split]').forEach((el) => {
      if (el.closest('.hero')) return;
      try {
        const split = new window.SplitText(el, {
          type: 'lines',
          mask: 'lines',
          linesClass: 'split-line',
        });
        gsap.from(split.lines, {
          yPercent: 110,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
      } catch (err) {
        console.error('[animation:split]', err); // heading stays visible
      }
    });
    window.ScrollTrigger.refresh();
  });

  /* A6 — work-card visual parallax (scrub, ±8% / scale 1.15) */
  document.querySelectorAll('.work-card').forEach((card) => {
    const art = card.querySelector('.work-card__art');
    if (!art) return;
    gsap.fromTo(
      art,
      { yPercent: -8, scale: 1.15 },
      {
        yPercent: 8,
        scale: 1.15,
        ease: 'none',
        scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true },
      }
    );
  });

  /* A8 — counters (markup carries the FINAL value so no-JS shows real numbers) */
  document.querySelectorAll('[data-counter]').forEach((el) => {
    const end = parseFloat(el.dataset.counter);
    if (Number.isNaN(end)) return;
    const suffix = el.dataset.suffix || '';
    try {
      const obj = { v: 0 };
      gsap.to(obj, {
        v: end,
        duration: 1.6,
        ease: 'power1.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        onUpdate: () => {
          el.textContent = String(Math.round(obj.v)) + suffix;
        },
      });
      el.textContent = '0' + suffix; // armed only after the trigger exists
    } catch (err) {
      console.error('[animation:counter]', err); // leave the real number in place
    }
  });

  /* A11 — nav hides on scroll down, returns on scroll up.
     CAVEAT: an inline transform on the header would make it the containing
     block for the position:fixed mobile menu (fixed children would position
     against the 76px header, not the viewport). So at rest the header must
     carry NO inline transform — show() clears it on completion. */
  if (header) {
    let hidden = false;
    const show = () => {
      if (!hidden && !header.style.transform) return; // already at rest
      hidden = false;
      gsap.to(header, {
        yPercent: 0,
        duration: 0.4,
        ease: 'power2.out',
        overwrite: 'auto',
        onComplete: () => gsap.set(header, { clearProps: 'transform' }),
      });
    };
    const hide = () => {
      if (hidden) return;
      hidden = true;
      gsap.to(header, { yPercent: -100, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
    };
    window.ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const y = self.scroll();
        if (document.body.classList.contains('nav-open') || y <= 80) show();
        else if (self.direction === 1) hide();
        else show();
      },
    });
  }

  /* A12 — nav background + blur once past the hero top (24px) */
  if (header && hero) {
    window.ScrollTrigger.create({
      trigger: hero,
      start: 'top top-=24',
      onEnter: () => header.classList.add('is-scrolled'),
      onLeaveBack: () => header.classList.remove('is-scrolled'),
    });
  }
}
