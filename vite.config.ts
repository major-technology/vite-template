import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.MAJOR_API_BASE_URL || 'https://api.prod.major.build'
  
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    define: {
      // Use local proxy in development
      'import.meta.env.MAJOR_API_BASE_URL': JSON.stringify(mode === 'development' ? '/api' : apiTarget),
      'import.meta.env.MAJOR_JWT_TOKEN': JSON.stringify(env.MAJOR_JWT_TOKEN || ''),
    },
  }
})
