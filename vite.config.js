import fs from 'node:fs'
import process from 'node:process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Lit les réglages du site (src/content/settings.json, éditables depuis /admin)
// pour remplir index.html (SEO, partage) et générer sitemap.xml + robots.txt.
const siteMeta = () => {
  const settings = JSON.parse(
    fs.readFileSync(new URL('./src/content/settings.json', import.meta.url), 'utf8')
  )
  const base = (process.env.SITE_URL || settings.site_url || '').replace(/\/+$/, '')
  // Logo : accepte une adresse complète OU un chemin local (ex. /images/logo.png)
  const logo = /^https?:/.test(settings.logo_url || '') ? settings.logo_url : base + (settings.logo_url || '')
  // Téléphone pour Google (JSON-LD) : premier numéro de phone_display, converti au format international
  const first = String(settings.phone_display || '').split('/')[0].replace(/\D/g, '')
  const phone = first ? '+213' + first.replace(/^0/, '') : ''
  const social = Object.values(settings.social || {}).filter(Boolean)
  const pages = ['', '/donate', '/volunteer', '/news', '/programs', '/gallery',
    '/sadaqa-jariya', '/privacy-policy', '/terms-of-use', '/report-problem']

  return {
    name: 'site-meta',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => html
        .replaceAll('__SITE_URL__', base)
        .replaceAll('__LOGO_URL__', logo)
        .replaceAll('__PHONE__', phone)
        .replaceAll('__EMAIL__', settings.email || '')
        .replaceAll('__SAME_AS__', JSON.stringify(social)),
    },
    generateBundle() {
      const today = new Date().toISOString().slice(0, 10)
      // lastmod réel : date du dernier article (pour /news), sinon date fixe — évite de dire « modifié aujourd'hui » pour tout à chaque build
      let lastNews = today
      try {
        const names = fs.readdirSync(new URL('./src/content/news/', import.meta.url)).map((f) => f.slice(0, 10)).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort()
        if (names.length) lastNews = names[names.length - 1]
      } catch { /* pas de dossier news : on garde today */ }
      const urls = pages.map((p) =>
        `  <url><loc>${base}${p || '/'}</loc><lastmod>${p === '/news' || p === '' ? lastNews : '2026-01-01'}</lastmod><priority>${p ? '0.6' : '1.0'}</priority></url>`
      ).join('\n')
      this.emitFile({
        type: 'asset', fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      })
      this.emitFile({
        type: 'asset', fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${base}/sitemap.xml\n`,
      })
    },
  }
}


// Mode "تعطيل الموقع" : si activé dans /admin, le serveur répond 503 (au lieu de 200)
// pour que Google comprenne que c'est temporaire et ne désindexe pas le site.
// /admin, /oauth et les fichiers statiques restent accessibles.
const maintenance503 = () => ({
  name: 'maintenance-503',
  apply: 'build',
  closeBundle() {
    const settings = JSON.parse(
      fs.readFileSync(new URL('./src/content/settings.json', import.meta.url), 'utf8')
    )
    if (!settings.maintenance?.enabled) return
    const file = new URL('./dist/.htaccess', import.meta.url)
    if (!fs.existsSync(file)) return
    const block = [
      '  # --- MAINTENANCE: الموقع معطّل (503) ---',
      '  RewriteCond %{REQUEST_URI} !^/(admin|oauth|assets|images|fonts|\\.well-known)(/|$)',
      '  RewriteCond %{REQUEST_URI} !^/index\\.html$',
      '  RewriteCond %{REQUEST_URI} !\\.(js|css|png|jpe?g|webp|svg|ico|woff2?|json|xml|txt)$',
      '  RewriteRule ^ - [R=503,L]',
      '',
    ].join('\n')
    let ht = fs.readFileSync(file, 'utf8')
    const marker = '  # --- OAuth'
    ht = ht.includes(marker) ? ht.replace(marker, block + marker) : ht
    ht += '\n# صفحة 503 = نفس index.html (تعرض رسالة التعطيل)\nErrorDocument 503 /index.html\n'
    fs.writeFileSync(file, ht)
  },
})
// Hors-ligne : génère /precache.json = fichiers à garder en cache par le service worker
// (application + pages Accueil / Don / Bénévolat avec leurs dépendances + polices + CSS).
const precacheList = () => ({
  name: 'precache-list',
  apply: 'build',
  generateBundle(_, bundle) {
    const wanted = /pages\/(Home|Donate|Volunteer)\.jsx$/
    const files = new Set()
    const add = (name) => {
      if (files.has(name) || !bundle[name]) return
      files.add(name)
      const c = bundle[name]
      if (c.type === 'chunk') (c.imports || []).forEach(add)
    }
    for (const [name, c] of Object.entries(bundle)) {
      if (c.type === 'chunk' && (c.isEntry || wanted.test(c.facadeModuleId || ''))) add(name)
      if (/\.(css|woff2)$/.test(name)) files.add(name)
    }
    this.emitFile({
      type: 'asset', fileName: 'precache.json',
      source: JSON.stringify({ files: [...files].map((f) => '/' + f) }),
    })
  },
})

export default defineConfig({
  plugins: [react(), tailwindcss(), siteMeta(), maintenance503(), precacheList()],
  build: {
    chunkSizeWarningLimit: 600,
    cssCodeSplit: true,
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
          leaflet: ['leaflet', 'react-leaflet'],
        },
      },
    },
  }
})
