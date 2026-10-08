/**
 * SPEC §10/§11 verification suite — run against the dev server:
 *   node scripts/verify.mjs   (expects http://127.0.0.1:3000)
 * Covers: normal animation pass, reduced-motion pass, no-JS pass,
 * mobile nav, overflow, console/page/HTTP errors.
 */
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
let failures = 0;

const check = (name, cond, detail = '') => {
  results.push(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
  if (!cond) failures++;
};

const watch = (page, label, errors) => {
  page.on('pageerror', (e) => errors.push(`[${label}] pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`[${label}] console.error: ${m.text()}`);
  });
  page.on('response', (r) => {
    if (r.status() >= 400) errors.push(`[${label}] HTTP ${r.status()} ${r.url()}`);
  });
};

async function runAll() {
  const browser = await chromium.launch({ args: ['--disable-gpu'] });
  try {

/* ---------- 1. desktop, normal motion ---------- */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  watch(page, 'desktop', errors);

  await page.goto(BASE + '/', { waitUntil: 'load' });
  await sleep(400);
  const preEarly = await page
    .locator('[data-preloader]')
    .evaluate((el) => el.classList.contains('is-active'))
    .catch(() => false);
  await sleep(3600);
  const preAfter = await page
    .locator('[data-preloader]')
    .evaluate((el) => el.classList.contains('is-active'));
  check('A1 preloader runs then leaves', preEarly && !preAfter, `early=${preEarly} after=${preAfter}`);

  const hero = await page.locator('.hero__title').evaluate((el) => {
    const lines = el.querySelectorAll('.split-line');
    return {
      lines: lines.length,
      opacity: parseFloat(getComputedStyle(el).opacity),
      line0: lines.length ? parseFloat(getComputedStyle(lines[0]).opacity) : 1,
      lineY: lines.length ? getComputedStyle(lines[0]).transform : 'none',
      h: el.getBoundingClientRect().height,
    };
  });
  check(
    'A2 hero SplitText revealed',
    hero.lines >= 1 && hero.opacity > 0.95 && hero.line0 > 0.95 && hero.h > 10,
    JSON.stringify(hero)
  );

  const m1 = await page.locator('.marquee__track').evaluate((el) => getComputedStyle(el).transform);
  await sleep(400);
  const m2 = await page.locator('.marquee__track').evaluate((el) => getComputedStyle(el).transform);
  check('A9 marquee animating', m1 !== 'none' && m2 !== 'none' && m1 !== m2, `${m1} → ${m2}`);

  await page.evaluate(() => window.scrollTo({ top: 1500, behavior: 'instant' }));
  await sleep(700);
  const down = await page.locator('[data-header]').evaluate((el) => ({
    bottom: Math.round(el.getBoundingClientRect().bottom),
    scrolled: el.classList.contains('is-scrolled'),
  }));
  check('A12 nav background after hero', down.scrolled, JSON.stringify(down));
  check('A11 header hides scrolling down', down.bottom <= 1, `bottom=${down.bottom}`);

  await page.evaluate(() => window.scrollTo({ top: 700, behavior: 'instant' }));
  await sleep(700);
  const up = await page.locator('[data-header]').evaluate((el) =>
    Math.round(el.getBoundingClientRect().bottom)
  );
  check('A11 header returns scrolling up', up > 50, `bottom=${up}`);

  await page.locator('#services').scrollIntoViewIfNeeded();
  await sleep(1400);
  const caps = await page
    .locator('.cap-card')
    .evaluateAll((els) => els.map((el) => +parseFloat(getComputedStyle(el).opacity)));
  check('A4 capability cards revealed', caps.length === 6 && caps.every((o) => o > 0.95), JSON.stringify(caps));

  await page.locator('.stats').scrollIntoViewIfNeeded();
  await sleep(2200);
  const nums = await page.locator('.stat__num').allTextContents();
  check('A8 counters land on final values', nums.map((s) => s.trim()).join(',') === '3,5,120', nums.join(','));

  const artT = await page.locator('.work-card__art').first().evaluate((el) => getComputedStyle(el).transform);
  check('A6 work-card parallax transform', artT !== 'none' && artT.length > 0, artT);

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await sleep(600);
  await page.locator('.hero__actions a[href="#work"]').click();
  await sleep(1500);
  const after = await page.evaluate(() => ({
    hash: location.hash,
    focus: document.activeElement?.id,
    y: Math.round(window.scrollY),
  }));
  check(
    'A14 smooth anchor + focus target',
    after.hash === '#work' && after.focus === 'work' && after.y > 200,
    JSON.stringify(after)
  );

  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
  await sleep(1800);
  const cta = await page
    .locator('.cta__inner')
    .evaluate((el) => [...el.children].map((c) => +parseFloat(getComputedStyle(c).opacity)));
  check('A4 CTA section fully revealed', cta.length >= 3 && cta.every((o) => o > 0.95), JSON.stringify(cta));
  const footText = await page.locator('.footer-list a').first().evaluate((el) => ({
    opacity: +parseFloat(getComputedStyle(el).opacity),
    text: el.textContent.trim(),
  }));
  check('footer links visible', footText.opacity === 1 && footText.text.length > 0, JSON.stringify(footText));

  const of1 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check('no horizontal overflow @1440', of1 <= 1, `overflow=${of1}px`);
  check('desktop: zero console/page/HTTP errors', errors.length === 0, errors.slice(0, 5).join(' | '));
  await ctx.close();
}

/* ---------- 2. prefers-reduced-motion ---------- */
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  const page = await ctx.newPage();
  const errors = [];
  watch(page, 'reduced', errors);

  await page.goto(BASE + '/', { waitUntil: 'load' });
  await sleep(900);
  const st = await page.evaluate(() => {
    const pre = document.querySelector('[data-preloader]');
    const title = document.querySelector('.hero__title');
    return {
      preActive: pre?.classList.contains('is-active'),
      preDisplay: pre ? getComputedStyle(pre).display : 'gone',
      titleOpacity: parseFloat(getComputedStyle(title).opacity),
      splits: title.querySelectorAll('.split-line').length,
      track: getComputedStyle(document.querySelector('.marquee__track')).transform,
    };
  });
  await sleep(500);
  const track2 = await page.evaluate(
    () => getComputedStyle(document.querySelector('.marquee__track')).transform
  );
  check('reduced: preloader never shows', !st.preActive && st.preDisplay === 'none', JSON.stringify(st));
  check('reduced: hero visible & unsplit', st.titleOpacity > 0.95 && st.splits === 0, JSON.stringify(st));
  check('reduced: marquee static', st.track === track2, `${st.track} vs ${track2}`);

  const nums = await page.locator('.stat__num').allTextContents();
  check('reduced: counters show final values', nums.map((s) => s.trim()).join(',') === '3,5,120', nums.join(','));

  await page.evaluate(() => window.scrollTo({ top: 1500, behavior: 'instant' }));
  await sleep(500);
  const nav = await page.locator('[data-header]').evaluate((el) => ({
    bottom: Math.round(el.getBoundingClientRect().bottom),
    scrolled: el.classList.contains('is-scrolled'),
  }));
  check('reduced: header never hides, bg on', nav.bottom > 50 && nav.scrolled, JSON.stringify(nav));
  check('reduced: zero errors', errors.length === 0, errors.slice(0, 4).join(' | '));
  await ctx.close();
}

/* ---------- 3. JavaScript disabled ---------- */
{
  const ctx = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 1440, height: 900 },
  });
  const page = await ctx.newPage();
  const noJsErrors = [];
  watch(page, 'no-js', noJsErrors);
  const resp = await page.goto(BASE + '/', { waitUntil: 'load' });
  check('no-JS: page loads with HTTP 200', !!resp && resp.status() === 200, `status=${resp && resp.status()}`);
  await page.locator('.hero__title').waitFor({ state: 'visible', timeout: 5000 });
  const capOpacity = await page
    .locator('.cap-card')
    .first()
    .evaluate((el) => getComputedStyle(el).opacity)
    .catch(() => 'evaluate-blocked');
  const counterText = await page.locator('.stat__num').nth(2).textContent();
  const heroVisible = await page.locator('.hero__title').isVisible();
  const workVisible = await page.locator('.work-card').first().isVisible();
  check('no-JS: content fully visible', capOpacity === '1', `cap-card opacity=${capOpacity}`);
  check('no-JS: counters show real values', counterText.trim() === '120', counterText);
  check('no-JS: hero + work visible', heroVisible && workVisible, `hero=${heroVisible} work=${workVisible}`);
  check('no-JS: zero errors', noJsErrors.length === 0, noJsErrors.slice(0, 4).join(' | '));
  await ctx.close();

  const ctx2 = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 360, height: 740 },
  });
  const page2 = await ctx2.newPage();
  const noJs2Errors = [];
  watch(page2, 'no-js-mobile', noJs2Errors);
  const resp2 = await page2.goto(BASE + '/', { waitUntil: 'load' });
  check('no-JS mobile: page loads with HTTP 200', !!resp2 && resp2.status() === 200, `status=${resp2 && resp2.status()}`);
  await page2.locator('.nav__link').first().waitFor({ state: 'visible', timeout: 5000 });
  const navVisible = await page2.locator('.nav__link').first().isVisible();
  check('no-JS mobile: zero errors', noJs2Errors.length === 0, noJs2Errors.slice(0, 4).join(' | '));
  const overflow = await page2.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth
  );
  check('no-JS mobile: nav links reachable', navVisible);
  check('no-JS mobile: no horizontal overflow', overflow <= 1, `overflow=${overflow}px`);
  await ctx2.close();
}

/* ---------- 4. mobile nav (JS on) ---------- */
{
  const ctx = await browser.newContext({ viewport: { width: 360, height: 740 } });
  const page = await ctx.newPage();
  const errors = [];
  watch(page, 'mobile', errors);
  await page.goto(BASE + '/', { waitUntil: 'load' });
  await sleep(3600);

  const burgerVisible = await page.locator('.nav-toggle').isVisible();
  await page.locator('.nav-toggle').click();
  await sleep(900);
  const opened = await page.evaluate(() => ({
    open: document.body.classList.contains('nav-open'),
    expanded: document.querySelector('.nav-toggle')?.getAttribute('aria-expanded'),
    linkVisible: getComputedStyle(document.querySelector('.nav__link')).visibility,
    bodyOverflow: getComputedStyle(document.body).overflow,
  }));
  check(
    'mobile: menu opens (aria + scroll lock)',
    burgerVisible && opened.open && opened.expanded === 'true' && opened.linkVisible === 'visible',
    JSON.stringify(opened)
  );

  // geometry: an inline transform on the header would break the fixed overlay
  const geom = await page.evaluate(() => {
    const menu = document.querySelector('.nav__links');
    const r = menu.getBoundingClientRect();
    const links = [...document.querySelectorAll('.nav__link')].map((a) => {
      const lr = a.getBoundingClientRect();
      return {
        t: a.textContent.trim(),
        ok:
          lr.top >= 0 &&
          lr.bottom <= innerHeight &&
          lr.left >= 0 &&
          lr.right <= innerWidth &&
          getComputedStyle(a).visibility === 'visible',
      };
    });
    return {
      top: Math.round(r.top),
      left: Math.round(r.left),
      w: Math.round(r.width),
      h: Math.round(r.height),
      vw: innerWidth,
      vh: innerHeight,
      links,
      headerTransform: document.querySelector('[data-header]').style.transform,
    };
  });
  check(
    'mobile: overlay covers full viewport',
    geom.top <= 0 && geom.left <= 0 && geom.h >= geom.vh - 1 && geom.w >= geom.vw - 1,
    JSON.stringify(geom)
  );
  check(
    'mobile: all 4 links visible incl. Home',
    geom.links.length === 4 && geom.links.every((l) => l.ok),
    JSON.stringify(geom.links)
  );
  check(
    'mobile: header has no inline transform while menu open',
    geom.headerTransform === '',
    `transform="${geom.headerTransform}"`
  );

  await page.keyboard.press('Escape');
  await sleep(800);
  const closed = await page.evaluate(() => !document.body.classList.contains('nav-open'));
  check('mobile: Escape closes menu', closed);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth
  );
  check('mobile: no horizontal overflow @360', overflow <= 1, `overflow=${overflow}px`);
  check('mobile: zero errors', errors.length === 0, errors.slice(0, 4).join(' | '));
  await ctx.close();
}

/* ---------- 5. about + contact pages ---------- */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  for (const path of ['/about.html', '/contact.html']) {
    const page = await ctx.newPage();
    const errors = [];
    watch(page, path, errors);
    await page.goto(BASE + path, { waitUntil: 'load' });
    await sleep(1600);

    const title = await page.locator('.page-title').evaluate((el) => ({
      splits: el.querySelectorAll('.split-line').length,
      opacity: parseFloat(getComputedStyle(el).opacity),
      h: Math.round(el.getBoundingClientRect().height),
    }));
    check(`${path}: A5 heading split + revealed`, title.splits >= 1 && title.opacity > 0.95 && title.h > 10, JSON.stringify(title));

    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
    await sleep(1400);
    const lastOpacity = await page
      .locator('[data-anim="reveal"]')
      .last()
      .evaluate((el) => {
        const kid = el.children[0] || el;
        return parseFloat(getComputedStyle(kid).opacity);
      });
    check(`${path}: bottom reveals finished`, lastOpacity > 0.95, `opacity=${lastOpacity}`);

    const of = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(`${path}: no horizontal overflow`, of <= 1, `overflow=${of}px`);
    check(`${path}: zero errors`, errors.length === 0, errors.slice(0, 4).join(' | '));
    await page.close();
  }

  const page = await ctx.newPage();
  await page.goto(BASE + '/contact.html', { waitUntil: 'load' });
  await sleep(800);
  const form = await page.evaluate(() => ({
    fields: document.querySelectorAll('#form [required]').length,
    labels: document.querySelectorAll('#form label').length,
    status: !!document.querySelector('[role="status"]'),
  }));
  check('contact: required fields + labels + live status', form.fields === 3 && form.labels === 4 && form.status, JSON.stringify(form));
  await ctx.close();
}

  } finally {
    await browser.close().catch(() => {});
  }
}

/* The headless shell crashes intermittently in this sandbox — retry the whole
   suite on a crash; every check must still pass on the run that counts. */
let attempt = 0;
for (;;) {
  attempt += 1;
  try {
    await runAll();
    break;
  } catch (err) {
    const flaky = /crash|closed|Target|Protocol|Timeout/i.test(String(err && err.message));
    if (flaky && attempt < 3) {
      console.log(`# browser crash on attempt ${attempt}, retrying...`);
      results.length = 0;
      failures = 0;
      continue;
    }
    console.error(err);
    process.exit(2);
  }
}

console.log('\n' + results.join('\n'));
console.log(`\n${results.length - failures}/${results.length} checks passed`);
process.exit(failures ? 1 : 0);
