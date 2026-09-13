import { verifyAdmin, jsonResponse } from './auth.js';

const defaultCategories = [
  {
    name: 'Slow Cooker',
    slug: 'slow-cooker',
    description: 'Tender, hearty, and effortlessly delicious slow-cooked meals for busy days.',
  },
  {
    name: 'High Protein',
    slug: 'high-protein',
    description: 'Nutritious, high-protein recipes packed with clean ingredients and macros.',
  },
  {
    name: 'Quick Dinners',
    slug: 'quick-dinners',
    description: 'Fast 30-minute skillet and sheet pan meals perfect for easy weeknights.',
  },
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

  let categories = defaultCategories;
  if (kv) {
    try {
      const stored = await kv.get(`categories:${siteId}`, 'json');
      if (Array.isArray(stored) && stored.length > 0) {
        categories = stored;
      }
    } catch {
      // fallback to default
    }
  }

  return jsonResponse({ success: true, siteId, categories });
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

    // If an entire categories array was sent
    if (Array.isArray(body.categories)) {
      const sanitized = body.categories.map((c) => ({
        name: String(c.name || '').trim(),
        slug: String(c.slug || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, ''),
        description: String(c.description || '').trim(),
      })).filter((c) => c.slug && c.name);

      await kv.put(`categories:${siteId}`, JSON.stringify(sanitized));
      return jsonResponse({ success: true, siteId, categories: sanitized });
    }

    // If a single new category was sent to append/update
    const name = (body.name || '').trim();
    const slug = (body.slug || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    const description = (body.description || '').trim();

    if (!name || !slug) {
      return jsonResponse({ success: false, error: 'Category name and slug are required' }, 400);
    }

    let categories = defaultCategories;
    try {
      const stored = await kv.get(`categories:${siteId}`, 'json');
      if (Array.isArray(stored)) {
        categories = stored;
      }
    } catch {
      // ignore
    }

    const existingIndex = categories.findIndex((c) => c.slug === slug);
    if (existingIndex >= 0) {
      categories[existingIndex] = { name, slug, description };
    } else {
      categories.push({ name, slug, description });
    }

    await kv.put(`categories:${siteId}`, JSON.stringify(categories));
    return jsonResponse({ success: true, siteId, categories });
  } catch {
    return jsonResponse({ success: false, error: 'Failed to save category' }, 400);
  }
}

export async function onRequestDelete(context) {
  if (!verifyAdmin(context)) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const kv = context.env?.RECIPE_KV;
  if (!kv) {
    return jsonResponse({ success: false, error: 'RECIPE_KV is not bound' }, 500);
  }

  try {
    const url = new URL(context.request.url);
    let siteId = url.searchParams.get('siteId') || 'site1';
    let slug = url.searchParams.get('slug');

    if (!slug) {
      try {
        const body = await context.request.json();
        siteId = body.siteId || siteId;
        slug = body.slug;
      } catch {
        // no body
      }
    }

    if (!slug) {
      return jsonResponse({ success: false, error: 'Slug is required' }, 400);
    }

    let categories = defaultCategories;
    try {
      const stored = await kv.get(`categories:${siteId}`, 'json');
      if (Array.isArray(stored)) {
        categories = stored;
      }
    } catch {
      // ignore
    }

    categories = categories.filter((c) => c.slug !== slug);
    await kv.put(`categories:${siteId}`, JSON.stringify(categories));

    return jsonResponse({ success: true, siteId, slug, categories });
  } catch {
    return jsonResponse({ success: false, error: 'Failed to delete category' }, 500);
  }
}
