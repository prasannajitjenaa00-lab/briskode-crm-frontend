/**
 * Centralized Application Configuration
 * Single source of truth for all environment variables, API endpoints, static assets, and third-party services.
 */

const env = import.meta.env;

// Root Backend Server URL (Render or Localhost)
// e.g. "https://your-crm-backend.onrender.com" or "http://localhost:5000"
const rawBackendUrl =
  env.VITE_BACKEND_URL ||
  (env.VITE_API_BASE_URL ? env.VITE_API_BASE_URL.replace(/\/api\/?$/, '') : '') ||
  env.VITE_SOCKET_URL ||
  'http://localhost:5000';

const cleanBackendUrl = rawBackendUrl.replace(/\/+$/, '');

export const config = {
  app: {
    name: env.VITE_APP_NAME || 'Meta Ads CRM',
    logoUrl: env.VITE_APP_LOGO_URL || '/logo.png',
    backgroundUrl: env.VITE_APP_BG_URL || '/crm_bg.jpg',
    storagePrefix: env.VITE_STORAGE_PREFIX || 'meta_crm_',
  },
  api: {
    backendUrl: cleanBackendUrl,
    baseUrl: env.VITE_API_BASE_URL || `${cleanBackendUrl}/api`,
    socketUrl: env.VITE_SOCKET_URL || cleanBackendUrl,
    getPdfUrl: (invoiceId) => `${env.VITE_API_BASE_URL || `${cleanBackendUrl}/api`}/invoices/${invoiceId}/pdf`,
  },
  integrations: {
    whatsappBaseUrl: env.VITE_WHATSAPP_BASE_URL || 'https://wa.me',
    metaWebhookUrl: env.VITE_META_WEBHOOK_PUBLIC_URL || `${cleanBackendUrl}/api/meta/webhook`,
    defaultTargetUrl: env.VITE_DEFAULT_CAMPAIGN_TARGET_URL || 'https://apexmeta.io/demo',
  },
  defaults: {
    avatarUrl: env.VITE_DEFAULT_AVATAR_URL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    campaignMediaUrl: env.VITE_DEFAULT_CAMPAIGN_MEDIA_URL || 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80',
    fallbackMediaUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
  },
};

export default config;
