import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  if (command === 'build' && !env.VITE_API_URL) {
    // Deploy platforms (Vercel, Render, Netlify, GitHub Actions) all set one of
    // these. A deploy build without VITE_API_URL would ship a bundle pointing
    // at localhost, so fail it here with a clear message. Local verification
    // builds (`npm run build` on a dev machine) still succeed with a warning;
    // their artifact refuses to boot in production anyway (see src/utils/env.js).
    const isDeployEnvironment = Boolean(
      process.env.VERCEL || process.env.CI || process.env.RENDER || process.env.NETLIFY
    )
    const message =
      'VITE_API_URL is not set. The bundle would call http://localhost:3001. ' +
      'Set VITE_API_URL to the deployed API, e.g. https://api.example.com/api/v1'

    if (isDeployEnvironment) {
      throw new Error(message)
    }
    console.warn(`\n[soloway] WARNING: ${message}\n`)
  }

  return {
    plugins: [react()],
    server: {
      port: 3000,
      open: true,
      // Listen on LAN so phones on the same Wi‑Fi can open http://<your-ip>:3000
      host: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
  }
})
