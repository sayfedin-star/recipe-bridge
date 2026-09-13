import { verifyAdmin, jsonResponse } from './auth.js';
import defaultConfig from '../../../config.json';

const defaultNavLinks = [
  { label: 'Home', url: '/' },
  { label: 'Slow Cooker', url: '/category/slow-cooker' },
  { label: 'High Protein', url: '/category/high-protein' },
  { label: 'Quick Dinners', url: '/category/quick-dinners' },
  { label: 'E-Books', url: '/#recipe' },
];

export async function onRequestOptions() {
  return jsonResponse({ ok: true });
}

export async function onRequestGet(context) {
  if (!verifyAdmin(context)) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const url = new URL(context.request.url);
  const siteId = url.searchParams.get('siteId') || 'site1';
  const kv = context.env?.RECIPE_KV;

  let siteConfig = null;

  if (kv) {
    try {
      siteConfig = await kv.get(`config:${siteId}`, 'json');
    } catch {
      // fallback
    }
  }

  if (!siteConfig) {
    siteConfig = {
      siteName: `${siteId.toUpperCase()} Hub`,
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
      navigation: {
        logoText: `${siteId.toUpperCase()} Kitchen`,
        navLinks: defaultNavLinks,
      },
      theme: defaultConfig.theme || '40aprons',
    };
  } else {
    if (!siteConfig.navigation) {
      siteConfig.navigation = {
        logoText: siteConfig.siteName || `${siteId.toUpperCase()} Kitchen`,
        navLinks: defaultNavLinks,
      };
    }
    if (!siteConfig.theme) {
      siteConfig.theme = defaultConfig.theme || '40aprons';
    }
  }

  return jsonResponse({ success: true, siteId, config: siteConfig });
}

export async function onRequestPost(context) {
  if (!verifyAdmin(context)) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  try {
    const body = await context.request.json();
    const siteId = (body.siteId || 'site1').trim();
    const newConfig = body.config || body;

    const sanitizedConfig = {
      siteName: newConfig.siteName || `${siteId.toUpperCase()} Hub`,
      targetDomain: newConfig.targetDomain || 'https://schnellrezept.com',
      triggers: {
        touch: Boolean(newConfig.triggers?.touch),
        scroll: Boolean(newConfig.triggers?.scroll),
        click: Boolean(newConfig.triggers?.click),
        timer: Boolean(newConfig.triggers?.timer),
      },
      settings: {
        scrollThreshold: Number(newConfig.settings?.scrollThreshold) || 80,
        timerDelayMs: Number(newConfig.settings?.timerDelayMs) || 3000,
        actionDelayMs: Number(newConfig.settings?.actionDelayMs) || 150,
      },
      utm: {
        source: newConfig.utm?.source || 'pinterest',
        medium: newConfig.utm?.medium || '{siteId}',
        campaign: newConfig.utm?.campaign || '{slug}',
      },
      productDefaults: {
        price: String(newConfig.productDefaults?.price || '2.25'),
        currency: String(newConfig.productDefaults?.currency || 'USD'),
        availability: String(newConfig.productDefaults?.availability || 'https://schema.org/InStock'),
        brand: String(newConfig.productDefaults?.brand || 'Recipe Bridge'),
      },
      navigation: {
        logoText: String(newConfig.navigation?.logoText || newConfig.siteName || `${siteId.toUpperCase()} Kitchen`),
        navLinks: Array.isArray(newConfig.navigation?.navLinks)
          ? newConfig.navigation.navLinks
              .map((l) => ({
                label: String(l.label || '').trim(),
                url: String(l.url || '').trim(),
              }))
              .filter((l) => l.label && l.url)
          : defaultNavLinks,
      },
      theme: newConfig.theme === 'editorial' ? 'editorial' : '40aprons',
    };

    const kv = context.env?.RECIPE_KV;
    if (kv) {
      await kv.put(`config:${siteId}`, JSON.stringify(sanitizedConfig));
    }

    return jsonResponse({ success: true, siteId, config: sanitizedConfig });
  } catch {
    return jsonResponse({ success: false, error: 'Failed to update config' }, 400);
  }
}
