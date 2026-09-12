export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

/**
 * Handles incoming click tracking events from sendBeacon or fetch.
 */
export async function onRequestPost(context) {
  const kv = context.env?.RECIPE_KV;
  if (!kv) {
    return new Response(JSON.stringify({ ok: false, message: 'RECIPE_KV not configured' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  try {
    let payload = {};
    const contentType = context.request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      payload = await context.request.json();
    } else {
      const rawText = await context.request.text();
      try {
        payload = JSON.parse(rawText);
      } catch {
        const url = new URL(context.request.url);
        payload = {
          siteId: url.searchParams.get('siteId'),
          slug: url.searchParams.get('slug'),
        };
      }
    }

    const siteId = (payload.siteId || 'site1').trim().toLowerCase();
    const slug = (payload.slug || 'general').trim().toLowerCase();
    const today = new Date().toISOString().slice(0, 10);
    const key = `stats:${siteId}:${today}`;

    let stats = null;
    try {
      stats = await kv.get(key, 'json');
    } catch {
      stats = null;
    }

    if (!stats || typeof stats !== 'object') {
      stats = { totalClicks: 0, slugs: {} };
    }
    if (!stats.slugs || typeof stats.slugs !== 'object') {
      stats.slugs = {};
    }

    stats.totalClicks = (stats.totalClicks || 0) + 1;
    stats.slugs[slug] = (stats.slugs[slug] || 0) + 1;

    await kv.put(key, JSON.stringify(stats));

    return new Response(JSON.stringify({ ok: true, totalClicks: stats.totalClicks }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return new Response(JSON.stringify({ ok: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
