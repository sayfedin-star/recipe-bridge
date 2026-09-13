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
  const slug = url.searchParams.get('slug');
  const kv = context.env?.RECIPE_KV;

  if (!kv) {
    return jsonResponse({ success: true, siteId, pages: [] });
  }

  try {
    // If specific slug requested
    if (slug) {
      const pageData = await kv.get(`pages:${siteId}:${slug}`, 'json');
      if (!pageData) {
        return jsonResponse({ success: false, error: 'Page not found' }, 404);
      }
      return jsonResponse({ success: true, siteId, slug, page: pageData });
    }

    // List all pages for this site
    const prefix = `pages:${siteId}:`;
    const listed = await kv.list({ prefix });
    const pages = [];

    for (const key of listed.keys || []) {
      const itemSlug = key.name.replace(prefix, '');
      const itemData = await kv.get(key.name, 'json');
      if (itemData) {
        pages.push({
          slug: itemSlug,
          title: itemData.title || itemSlug,
          updatedAt: itemData.updatedAt || null,
        });
      }
    }

    return jsonResponse({ success: true, siteId, pages });
  } catch {
    return jsonResponse({ success: false, error: 'Failed to retrieve pages' }, 500);
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
    const slug = (body.slug || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    const title = (body.title || slug).trim();
    const content = (body.content || '').trim();

    if (!slug || !title) {
      return jsonResponse({ success: false, error: 'Slug and Title are required' }, 400);
    }

    const pageData = {
      slug,
      title,
      content,
      updatedAt: new Date().toISOString(),
    };

    await kv.put(`pages:${siteId}:${slug}`, JSON.stringify(pageData));

    return jsonResponse({ success: true, siteId, slug, page: pageData });
  } catch {
    return jsonResponse({ success: false, error: 'Failed to save page' }, 400);
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

    await kv.delete(`pages:${siteId}:${slug}`);
    return jsonResponse({ success: true, siteId, slug, message: 'Page deleted' });
  } catch {
    return jsonResponse({ success: false, error: 'Failed to delete page' }, 500);
  }
}
