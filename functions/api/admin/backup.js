import { verifyAdmin, jsonResponse } from './auth.js';

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

  if (!kv) {
    return jsonResponse({ success: false, error: 'RECIPE_KV is not bound' }, 500);
  }

  try {
    const config = (await kv.get(`config:${siteId}`, 'json')) || null;
    const categories = (await kv.get(`categories:${siteId}`, 'json')) || [];

    // Collect all pages
    const pagesPrefix = `pages:${siteId}:`;
    const listedPages = await kv.list({ prefix: pagesPrefix });
    const pages = [];
    for (const key of listedPages.keys || []) {
      const pageData = await kv.get(key.name, 'json');
      if (pageData) pages.push(pageData);
    }

    // Collect all roundups
    const roundupsPrefix = `roundups:${siteId}:`;
    const listedRoundups = await kv.list({ prefix: roundupsPrefix });
    const roundups = [];
    for (const key of listedRoundups.keys || []) {
      const roundupData = await kv.get(key.name, 'json');
      if (roundupData) roundups.push(roundupData);
    }

    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      siteId,
      config,
      categories,
      pages,
      roundups,
    };

    return jsonResponse({ success: true, siteId, backup });
  } catch {
    return jsonResponse({ success: false, error: 'Failed to generate backup' }, 500);
  }
}

export async function onRequestPost(context) {
  if (!verifyAdmin(context)) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const kv = context.env?.RECIPE_KV;
  if (!kv) {
    return jsonResponse({ success: false, error: 'RECIPE_KV is not bound' }, 500);
  }

  try {
    const body = await context.request.json();
    const siteId = (body.siteId || 'site1').trim();
    const backup = body.backup || body;

    if (!backup || typeof backup !== 'object') {
      return jsonResponse({ success: false, error: 'Invalid backup payload' }, 400);
    }

    // Restore Config
    if (backup.config && typeof backup.config === 'object') {
      await kv.put(`config:${siteId}`, JSON.stringify(backup.config));
    }

    // Restore Categories
    if (Array.isArray(backup.categories)) {
      await kv.put(`categories:${siteId}`, JSON.stringify(backup.categories));
    }

    // Restore Pages
    let restoredPagesCount = 0;
    if (Array.isArray(backup.pages)) {
      for (const page of backup.pages) {
        if (page && page.slug) {
          const cleanSlug = String(page.slug).trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
          if (cleanSlug) {
            await kv.put(`pages:${siteId}:${cleanSlug}`, JSON.stringify(page));
            restoredPagesCount++;
          }
        }
      }
    }

    // Restore Roundups
    let restoredRoundupsCount = 0;
    if (Array.isArray(backup.roundups)) {
      for (const r of backup.roundups) {
        if (r && r.slug) {
          const cleanSlug = String(r.slug).trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
          if (cleanSlug) {
            await kv.put(`roundups:${siteId}:${cleanSlug}`, JSON.stringify(r));
            restoredRoundupsCount++;
          }
        }
      }
    }

    return jsonResponse({
      success: true,
      siteId,
      message: 'Backup data restored successfully',
      restored: {
        config: Boolean(backup.config),
        categoriesCount: Array.isArray(backup.categories) ? backup.categories.length : 0,
        pagesCount: restoredPagesCount,
        roundupsCount: restoredRoundupsCount,
      },
    });
  } catch {
    return jsonResponse({ success: false, error: 'Failed to restore backup' }, 400);
  }
}
