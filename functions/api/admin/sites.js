import { verifyAdmin, jsonResponse } from './auth.js';
import defaultConfig from '../../../config.json';

export async function onRequestOptions() {
  return jsonResponse({ ok: true });
}

export async function onRequestGet(context) {
  if (!verifyAdmin(context)) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const kv = context.env?.RECIPE_KV;
  let sites = ['site1'];

  if (kv) {
    try {
      const kvSites = await kv.get('sites', 'json');
      if (Array.isArray(kvSites) && kvSites.length > 0) {
        sites = kvSites;
      }
    } catch {
      // fallback to default
    }
  }

  return jsonResponse({ success: true, sites });
}

export async function onRequestPost(context) {
  if (!verifyAdmin(context)) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  try {
    const body = await context.request.json();
    const siteId = (body.siteId || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');

    if (!siteId) {
      return jsonResponse({ success: false, error: 'siteId is required and must be alphanumeric' }, 400);
    }

    const kv = context.env?.RECIPE_KV;
    let sites = ['site1'];

    if (kv) {
      const existing = await kv.get('sites', 'json');
      if (Array.isArray(existing)) {
        sites = existing;
      }

      if (!sites.includes(siteId)) {
        sites.push(siteId);
        await kv.put('sites', JSON.stringify(sites));
      }

      // Initialize default config if not existing for this new site
      const existingConfig = await kv.get(`config:${siteId}`, 'json');
      if (!existingConfig) {
        const initialConfig = {
          siteName: body.siteName || `${siteId.toUpperCase()} Hub`,
          targetDomain: defaultConfig.targetDomain || 'https://schnellrezept.com',
          triggers: defaultConfig.triggers || { touch: true, scroll: false, click: true, timer: false },
          settings: defaultConfig.settings || { scrollThreshold: 80, timerDelayMs: 3000, actionDelayMs: 150 },
          utm: { source: 'pinterest', medium: '{siteId}', campaign: '{slug}' },
          productDefaults: defaultConfig.productDefaults || {
            price: '2.25',
            currency: 'USD',
            availability: 'https://schema.org/InStock',
            brand: 'Recipe Bridge',
          },
        };
        await kv.put(`config:${siteId}`, JSON.stringify(initialConfig));
      }
    }

    return jsonResponse({ success: true, siteId, sites });
  } catch {
    return jsonResponse({ success: false, error: 'Failed to process request' }, 400);
  }
}
