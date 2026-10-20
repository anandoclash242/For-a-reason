# BLOOM TYPE — Interactive Generative Typography Garden

A living botanical typography art installation built with React, Vite, TypeScript, Canvas API, and Tailwind CSS. Every letter generates procedural vines, leaves, stems, and cursor-aware blooming roses.

---

## Deploying to Vercel

BLOOM TYPE is 100% client-side and requires no server runtime or database, making it ideal for free zero-configuration hosting on **Vercel**.

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub, GitLab, or Bitbucket**.
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **Add New…** → **Project**.
4. Select your **BLOOM TYPE** repository and click **Import**.
5. Vercel automatically detects the Vite framework using the bundled `vercel.json`:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Click **Deploy**. Your app will be live with a global HTTPS URL in under 30 seconds!

---

### Method 2: Deploy via Vercel CLI

If you have the Vercel CLI installed:

```bash
# Log in to Vercel
npx vercel login

# Deploy to preview
npx vercel

# Deploy directly to production
npx vercel --prod
```

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start local dev server (port 3000)
npm run dev

# 3. Run unit tests
node --test

# 4. Compile production build
npm run build
```

---

## Features

- **Procedural Botanical Growth**: Real-time Bézier curves and layered rose geometry formed along typed letterforms.
- **Cursor-Aware Blossoms**: Roses tilt toward mouse or touch movement with spring damping.
- **Butterfly Dynamics**: Click/tap to spawn fluttering butterflies that land on blooms.
- **Prune & Wither**: Spacebar to prune random vines; Backspace to wither letters.
- **10 Botanical Color Palettes**: From Rose Garden to Midnight Bloom and Sakura Dream.
- **Poster Studio (1080×1080)**: Download PNG, ultra-high-resolution print still, or animated WebM video.
- **Local Persistence & Shareable URLs**: State saved to localStorage and encoded in URL query params.
