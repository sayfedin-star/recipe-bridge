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
  const targetDate = url.searchParams.get('date');
  const kv = context.env?.RECIPE_KV;

  if (!kv) {
    return jsonResponse({
      success: true,
      siteId,
      date: targetDate || new Date().toISOString().slice(0, 10),
      stats: { totalClicks: 0, slugs: {} },
      recentDays: [],
    });
  }

  try {
    const today = new Date().toISOString().slice(0, 10);
    const dateQuery = targetDate || today;

    // Fetch stats for the specific date
    const dayStats = (await kv.get(`stats:${siteId}:${dateQuery}`, 'json')) || {
      totalClicks: 0,
      slugs: {},
    };

    // List recent days under this site
    const prefix = `stats:${siteId}:`;
    const listed = await kv.list({ prefix, limit: 14 });
    const recentDays = [];

    for (const key of (listed.keys || []).reverse()) {
      const d = key.name.replace(prefix, '');
      const s = await kv.get(key.name, 'json');
      if (s) {
        recentDays.push({
          date: d,
          totalClicks: s.totalClicks || 0,
          uniqueSlugs: Object.keys(s.slugs || {}).length,
        });
      }
    }

    return jsonResponse({
      success: true,
      siteId,
      date: dateQuery,
      stats: dayStats,
      recentDays,
    });
  } catch {
    return jsonResponse({ success: false, error: 'Failed to retrieve stats' }, 500);
  }
}
