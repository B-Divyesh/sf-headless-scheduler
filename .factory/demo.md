# Demo sandbox

- Direct URL: <https://headless-scheduler.sociobot.in/demo>
- Query entry: <https://headless-scheduler.sociobot.in/?demo=1>
- First action: **Try it with sample data** on the home page.
- Sample: four resources and five studio-planning events on 27–29 August 2026.
- Editable input: the first event is exposed as JSON beside the live output.
- Reset: **Reset demo** restores the original events, resources, view, and input.
- Exit: **Start for real** discards the current demo and returns home.
- Isolation: demo state exists only in the page’s in-memory scheduler instance. It does not read or write localStorage, sessionStorage, IndexedDB, cookies, or application data.
- Offline: the generated service worker caches the demo shell and bundled sample.
