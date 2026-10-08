/**
 * SPEC §6.2 — A1 preloader exit, A2 hero line reveal.
 * Only ever called when JS is on and reduced motion is NOT requested:
 * hidden states live here, never in CSS (principle §6.1.5).
 */

const gsap = window.gsap;
const SplitText = window.SplitText;

const fontsReady = () =>
  (document.fonts ? document.fonts.ready : Promise.resolve()).catch(() => {});

export function initIntro() {
  const pre = document.querySelector('[data-preloader]');
  const hero = document.querySelector('.hero');

  // A1 — show preloader immediately and start the counter (SPEC: 0→100, 2.5s cap)
  let counted = Promise.resolve();
  if (pre) {
    pre.classList.add('is-active');
    const numEl = pre.querySelector('[data-preloader-num]');
    const count = { v: 0 };
    counted = new Promise((resolve) => {
      gsap.to(count, {
        v: 100,
        duration: 1.2,
        ease: 'power2.inOut',
        onUpdate: () => {
          if (numEl) numEl.textContent = String(Math.round(count.v));
        },
        onComplete: resolve,
      });
    });
  }

  const ready = new Promise((resolve) => {
    if (document.readyState === 'complete') resolve();
    else window.addEventListener('load', resolve, { once: true });
    window.setTimeout(resolve, 2500); // SPEC A1 timeout
  });

  Promise.all([ready, counted, fontsReady()])
    .then(() => {
      if (!hero) return;
      const tl = buildHeroTimeline();
      liftCurtain();
      tl?.play();
    })
    .catch((err) => {
      console.error('[animation:intro]', err);
      removePreloader(); // fail open: hero is untouched and fully visible
    });

  function buildHeroTimeline() {
    // Split BEFORE any from() so a SplitText failure can't leave text hidden
    const splits = [...hero.querySelectorAll('[data-split]')].map(
      (el) => new SplitText(el, { type: 'lines', mask: 'lines', linesClass: 'split-line' })
    );
    const tl = gsap.timeline({ paused: true });
    splits.forEach((split) => {
      // A2 — masked line reveal, 1.1s expo.out, stagger 0.08
      tl.from(split.lines, { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.08 }, 0);
    });
    const soft = hero.querySelectorAll('.eyebrow, .hero__lede, .hero__actions, .hero__foot > *');
    if (soft.length) {
      tl.from(soft, { y: 24, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08 }, 0.25);
    }
    return tl;
  }

  function liftCurtain() {
    if (!pre) return;
    gsap.to(pre, {
      yPercent: -100,
      duration: 1,
      ease: 'power4.inOut',
      onComplete: removePreloader,
    });
  }

  function removePreloader() {
    if (!pre) return;
    pre.classList.remove('is-active');
    gsap.set(pre, { clearProps: 'all' });
  }
}
