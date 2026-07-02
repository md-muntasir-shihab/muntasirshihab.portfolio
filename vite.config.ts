import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  // Expose env keys to import.meta.env
  const envDefine: Record<string, any> = {};
  const keysToExpose = [
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_DB_PASSWORD',
    'FIREBASE_WEB_PUSH_CERT',
    'FIREBASE_URL',
    'FIREBASE_PRIVATE_KEY_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_CLIENT_ID',
    'FIREBASE_CLIENT_X509_CERT_URL',
    'RESEND_API_KEY',
    'EMAIL_FROM',
    'EMAIL_TO',
    'GITHUB_TOKEN',
    'RENDER_API_KEY'
  ];
  
  for (const key of keysToExpose) {
    envDefine[`import.meta.env.${key}`] = JSON.stringify(env[key] || '');
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    define: envDefine,
  };
});
