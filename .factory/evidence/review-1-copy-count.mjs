import fs from 'node:fs';

const markdown = fs.readFileSync('README.md', 'utf8');
const fence = String.fromCharCode(96).repeat(3);
const prose = markdown
  .replace(new RegExp(`${fence}[\\s\\S]*?${fence}`, 'g'), '')
  .replace(/^#+ .*$/gm, '')
  .replace(/^[-*] .*$/gm, '')
  .replace(/^\*\*v[^\n]*$/gm, '')
  .replace(/^MIT ©.*$/gm, '');

const count = sentence => (sentence.match(/[A-Za-z0-9@]+(?:[’'_.:/+-][A-Za-z0-9@]+)*/g) ?? []).length;

console.log('LANDING');
for (const sentence of [
  'No premium views',
  'Your schedule.',
  'Your surface.',
  'A headless calendar core with resource timelines, continuous months, and pointer interactions—ready for your Tailwind system.',
  'FREE / OPEN / HEADLESS',
  '0 core dependencies',
  '4 useful views',
  'MIT forever',
  'Structure without somebody else’s skin.',
  'The actual library, in motion',
  'Plan across people and places',
  'Drag events to reschedule.',
  'Arrow keys move a focused event by 15 minutes; tab to its resize control, then use left or right arrows to change its duration.',
  'Every view below comes from the same headless state.',
  'Ready locally',
  'Tip: drag an event or focus it and use arrow keys.',
  'Why another calendar?',
  'Because layout is infrastructure, not a licence tier.',
  'Resource scheduling should not force your product into a vendor’s visual language—or its premium plan.',
  'Headless Scheduler gives you date math, collision geometry, input behavior, and accessible navigation as typed primitives.',
  'Resource timelines',
  'Hours or days across any number of people, rooms, tools, or tracks.',
  'Clipping and percentages are already calculated.',
  'Keep scrolling',
  'Windowed month models make an endless vertical calendar practical without rendering an endless DOM.',
  'Move like you mean it',
  'Pointer capture, snapping, resize handles, keyboard intent, and live announcements—without prescribing components.',
  'One package.',
  'Bring your stack.',
  'Ship the scheduler, not the fight.',
  'ESM, CJS, declarations, zero runtime dependencies in the core.',
  'React is optional.',
  'Small on purpose',
  'Primitives you can hold in your head',
  'Calendar infrastructure, printed your way.',
  'MIT licensed.',
  'No telemetry.',
  'No licence wall.',
  'You’re offline.',
  'The in-memory schedule still works; persistence is yours to connect.',
  'No events in this range',
  'Choose another date or add the first event.',
  'Add a title so people know what is scheduled.',
]) console.log(`${count(sentence)}\t${sentence}`);

console.log('README');
for (const item of new Intl.Segmenter('en', { granularity: 'sentence' }).segment(prose)) {
  const segmented = item.segment.replace(/\s+/g, ' ').trim();
  if (!segmented) continue;
  const sentences = segmented
    .replace("'resize-end'`. `pixelsPerMinute`", "'resize-end'`.\n`pixelsPerMinute`")
    .replace('clean tarball. `npm run dev`', 'clean tarball.\n`npm run dev`')
    .split('\n');
  for (const sentence of sentences) console.log(`${count(sentence)}\t${sentence}`);
}

console.log('README_API');
for (const sentence of [
  'createScheduler(options) — observable event/view state and immutable CRUD/move/resize operations.',
  'buildMonth, getContinuousMonthWindow — calendar math and virtual month windows.',
  'buildTimeGrid, buildResourceTimeline, layoutOverlaps — view models with collision columns.',
  'createPointerInteraction — pointer create/move/resize with snapping.',
  'getGridNavigation — Arrow/Home/End/PageUp/PageDown keyboard intent.',
  'nativeDateAdapter, createTemporalAdapter, createDateFnsAdapter — replaceable date math.',
  'HeadlessScheduler, useScheduler from /react — optional React bindings.',
  'MIT © 2026 Sociobot (Param Factory). See LICENSE.',
]) console.log(`${count(sentence)}\t${sentence}`);
