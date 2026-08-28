import axe from 'axe-core';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('/usr/lib/node_modules/playwright');

const base = 'https://headless-scheduler.sociobot.in';
const out = {};
const browser = await chromium.launch({ headless: true });

for (const [name, viewport] of Object.entries({
  mobile: { width: 390, height: 844 },
  desktop: { width: 1440, height: 900 },
})) {
  const context = await browser.newContext({ viewport, serviceWorkers: 'block' });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  await page.goto(base, { waitUntil: 'networkidle' });
  const beforeFold = await page.evaluate(() => {
    const visible = element => {
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return box.top < innerHeight && box.bottom > 0 && box.left < innerWidth && box.right > 0 && style.visibility !== 'hidden' && style.display !== 'none';
    };
    return [...document.querySelectorAll('body *')]
      .filter(element => element.children.length === 0 && visible(element) && element.textContent?.trim())
      .map(element => ({ tag: element.tagName.toLowerCase(), text: element.textContent.trim(), top: Math.round(element.getBoundingClientRect().top) }));
  });
  await page.screenshot({ path: `.factory/evidence/review-1-${name}-cold.png`, fullPage: false });
  out[name] = {
    url: page.url(),
    title: await page.title(),
    h1: await page.locator('h1').allTextContents(),
    beforeFold,
    consoleErrors,
  };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  const page = await context.newPage();
  const requests = [];
  page.on('request', request => requests.push({ url: request.url(), method: request.method(), type: request.resourceType() }));
  await page.goto(base, { waitUntil: 'networkidle' });
  const actions = await page.getByRole('link').allTextContents();
  const buttons = await page.getByRole('button').allTextContents();
  const requiredTryLink = page.getByRole('link', { name: /Try it with sample data/i });
  const actualTryLink = page.getByRole('link', { name: /Try the timeline/i });
  out.demo = { actions, buttons, requiredTryCount: await requiredTryLink.count(), actualTryCount: await actualTryLink.count() };
  if (await actualTryLink.count()) {
    await actualTryLink.first().click();
    await page.waitForLoadState('networkidle');
    out.demo.afterClick = {
      url: page.url(),
      title: await page.title(),
      h1: await page.locator('h1').allTextContents(),
      text: (await page.locator('body').innerText()).slice(0, 8000),
      resetCount: await page.getByRole('button', { name: /Reset demo/i }).count(),
      startRealCount: await page.getByRole('link', { name: /Start for real/i }).count(),
      bannerCount: await page.getByText(/Demo — sample data, nothing is saved/i).count(),
      storageBefore: await page.evaluate(async () => ({ local: { ...localStorage }, session: { ...sessionStorage }, cookies: document.cookie, indexedDB: await indexedDB.databases() })),
    };
    const initialEvents = await page.locator('.event-block').count();
    await page.getByRole('button', { name: 'Add event' }).first().click();
    await page.getByLabel('Event title').fill('Audit sample event');
    await page.getByRole('button', { name: 'Add event' }).last().click();
    const changedEvents = await page.locator('.event-block').count();
    const storageAfterChange = await page.evaluate(async () => ({ local: { ...localStorage }, session: { ...sessionStorage }, cookies: document.cookie, indexedDB: await indexedDB.databases() }));
    await page.reload({ waitUntil: 'networkidle' });
    const reloadedEvents = await page.locator('.event-block').count();
    out.demo.persistence = { initialEvents, changedEvents, reloadedEvents, storageAfterChange };
    await page.screenshot({ path: '.factory/evidence/review-1-demo.png', fullPage: true });
  }
  out.demo.requests = requests;
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  const page = await context.newPage();
  await page.goto(`${base}/demo`, { waitUntil: 'networkidle' });
  out.demoRoute = {
    url: page.url(), title: await page.title(), h1: await page.locator('h1').allTextContents(),
    bannerCount: await page.getByText(/Demo — sample data, nothing is saved/i).count(),
  };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript({ content: axe.source });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  const result = await page.evaluate(async () => await globalThis.axe.run(document));
  out.axe = {
    violations: result.violations.map(violation => ({ id: violation.id, impact: violation.impact, help: violation.help, nodes: violation.nodes.length }))
  };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  const page = await context.newPage();
  const routeResults = [];
  for (const route of ['/', '/demo', '/privacy/', '/terms/', '/does-not-exist']) {
    const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
    routeResults.push(await page.evaluate(({ route, status }) => ({
      route, status, title: document.title, h1: [...document.querySelectorAll('h1')].map(node => node.textContent?.trim()),
      main: document.querySelectorAll('main').length, header: document.querySelectorAll('header').length, footer: document.querySelectorAll('footer').length,
      description: document.querySelector('meta[name="description"]')?.getAttribute('content') ?? null,
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null,
      ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content') ?? null,
      twitterCard: document.querySelector('meta[name="twitter:card"]')?.getAttribute('content') ?? null,
      favicon: document.querySelector('link[rel~="icon"]')?.getAttribute('href') ?? null,
      appleTouch: document.querySelector('link[rel="apple-touch-icon"]')?.getAttribute('href') ?? null,
      links: [...document.querySelectorAll('a')].map(link => link.getAttribute('href')),
    }), { route, status: response?.status() ?? null }));
  }
  out.routes = routeResults;
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.getByRole('link', { name: /Try the timeline/i }).click();
  const afterHash = await page.evaluate(() => ({ url: location.href, active: document.activeElement?.textContent?.trim() || document.activeElement?.tagName, h1Focused: document.activeElement === document.querySelector('h1') }));
  await page.goBack();
  await page.waitForTimeout(100);
  const afterBack = await page.evaluate(() => ({ url: location.href, active: document.activeElement?.textContent?.trim() || document.activeElement?.tagName, h1Focused: document.activeElement === document.querySelector('h1') }));
  out.historyFocus = { afterHash, afterBack };
  await context.close();
}

{
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null);
  await context.setOffline(true);
  const response = await page.reload({ waitUntil: 'domcontentloaded' });
  out.offline = { responseStatus: response?.status() ?? null, h1: await page.locator('h1').allTextContents(), online: await page.evaluate(() => navigator.onLine) };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  out.touchTargets = await page.evaluate(() => [...document.querySelectorAll('a,button,input,select')].flatMap(element => {
    const box = element.getBoundingClientRect();
    if (getComputedStyle(element).display === 'none' || box.width === 0 || box.height === 0) return [];
    if (box.width >= 44 && box.height >= 44) return [];
    return [{ name: element.getAttribute('aria-label') || element.textContent?.trim() || element.getAttribute('name'), width: Math.round(box.width), height: Math.round(box.height) }];
  }));
  await context.close();
}

fs.writeFileSync('.factory/evidence/review-1-browser.json', JSON.stringify(out, null, 2));
await browser.close();
