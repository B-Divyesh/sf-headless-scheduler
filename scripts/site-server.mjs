import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, resolve, sep } from 'node:path'

const contentTypes = {
  '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.webp': 'image/webp'
}

const matchesRoute = (pathname, route) => route.endsWith('/*') ? pathname.startsWith(route.slice(0, -1)) : pathname === route

export async function startStaticSite(root, port = 0) {
  let currentRoot = resolve(root)
  const headersFor = async pathname => {
    const config = JSON.parse(await readFile(resolve(currentRoot, 'staticwebapp.config.json'), 'utf8'))
    const headers = { ...(config.globalHeaders ?? {}) }
    const route = (config.routes ?? []).find(candidate => matchesRoute(pathname, candidate.route))
    if (route) Object.assign(headers, route.headers ?? {})
    return headers
  }
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://site.local').pathname)
      let file = resolve(currentRoot, `.${pathname}`)
      if (file !== currentRoot && !file.startsWith(`${currentRoot}${sep}`)) { response.writeHead(403).end(); return }
      let fallback = false
      try { if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html') } catch {
        if (extname(pathname)) { response.writeHead(404).end(); return }
        file = resolve(currentRoot, '404.html')
        fallback = true
      }
      const body = await readFile(file)
      response.writeHead(fallback ? 404 : 200, { ...await headersFor(fallback ? '/' : pathname), 'Content-Type': contentTypes[extname(file)] ?? 'application/octet-stream' })
      response.end(body)
    } catch { response.writeHead(404).end() }
  })
  await new Promise((resolvePromise, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolvePromise) })
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Could not start static site server')
  return {
    url: `http://127.0.0.1:${address.port}`,
    setRoot(root) { currentRoot = resolve(root) },
    close: () => new Promise(resolvePromise => server.close(resolvePromise))
  }
}
