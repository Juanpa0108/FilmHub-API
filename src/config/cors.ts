import { CorsOptions } from 'cors'

/**
 * CORS Configuration for the API
 *
 * Defines the allowed origins, credentials, methods, and headers that
 * can interact with the backend. The whitelist includes the frontend URL
 * defined in the environment variable `FRONTEND_URL`.
 *
 * If the backend is started with the `--api` argument, it also allows
 * `undefined` as an origin (useful for testing with Postman/Insomnia).
 * @constant
 * @type {CorsOptions}
 * @property {function(string, function): void} origin - Function that validates whether the origin is allowed.
 * @property {boolean} credentials - Indicates whether cookies/authorization headers are allowed.
 * @property {string[]} methods - Allowed HTTP methods.
 * @property {string[]} allowedHeaders - Allowed HTTP headers.
 */
export const corsConfig: CorsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void): void {
    // Helper to normalize origins (remove trailing slash)
    const normalize = (s: string) => s.replace(/\/+$/, '')

    // Gather allowed origins from env (single) and list (comma-separated)
    const envOriginsRaw = [
      process.env.FRONTEND_URL || '',
      ...(process.env.FRONTEND_URLS ? process.env.FRONTEND_URLS.split(',') : [])
    ].map(o => o.trim()).filter(Boolean)
    const envOrigins = envOriginsRaw.map(normalize)

    // Local dev defaults
    const localOrigins = ['http://localhost:5173', 'http://localhost:5174']

    // Optional Postman/Insomnia without origin
    const allowUndefined = process.argv.includes('--api')

    // Helper for wildcard vercel domains if explicitly enabled
    const allowVercelWildcard = process.env.ALLOW_VERCEL_WILDCARD === 'true'

    // Build a set including both normalized and trailing-slash variants
    const all = new Set<string>([
      ...envOrigins.flatMap(o => [o, `${o}/`]),
      ...localOrigins.flatMap(o => [o, `${o}/`])
    ])

    const allowUndefinedOrigin = process.env.ALLOW_UNDEFINED_ORIGIN === 'true' || allowUndefined

    const isAllowed = (ori: string | undefined): boolean => {
      if (!ori) return allowUndefinedOrigin
      if (all.has(ori)) return true
      const nori = normalize(ori)
      if (all.has(nori)) return true
      if (allowVercelWildcard) {
        try {
          const u = new URL(ori)
          if (u.hostname.endsWith('.vercel.app')) return true
        } catch {}
      }
      return false
    }

    if (isAllowed(origin)) {
      callback(null, true)
    } else {
      const msg = `CORS Error: origin ${origin ?? 'undefined'} is not allowed. Whitelist: ${[...all].join(', ')}`
      callback(new Error(msg))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}