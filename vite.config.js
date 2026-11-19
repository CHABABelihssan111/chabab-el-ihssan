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
      const urls = pages.map((p) =>
        `  <url><loc>${base}${p || '/'}</loc><lastmod>${today}</lastmod><priority>${p ? '0.6' : '1.0'}</priority></url>`
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

// Mode "تعطيل الموقع" : réponse 503 quand activé dans /admin
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
    ht += '\n# صفحة 503 = نفس index.html\nErrorDocument 503 /index.html\n'
    fs.writeFileSync(file, ht)
  },
})

export default defineConfig({
  plugins: [react(), tailwindcss(), siteMeta(), maintenance503()],
  build: {
    chunkSizeWarningLimit: 1400
  }
})
