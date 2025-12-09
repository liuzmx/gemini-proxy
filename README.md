# Gemini Proxy with Auth Key (Cloudflare Worker)

A secure Cloudflare Worker that proxies requests to Google's Generative Language API (`generativelanguage.googleapis.com`) with custom authentication.

🔒 Your Google API Key is never exposed.  
🔑 Clients must provide a secret `X-Auth-Key` header to use the proxy.

---

## 🔧 Features

- Hides your Google API Key
- Requires `X-Auth-Key` for access control
- Supports all Gemini endpoints (e.g., `generateContent`, `streamGenerateContent`)
- CORS enabled for frontend use
- Built with TypeScript + Wrangler

---

## 🚀 Deployment

1. Install [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/):
   ```bash
   npm install -g wrangler
   ```
