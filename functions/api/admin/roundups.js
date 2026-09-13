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
    return jsonResponse({ success: true, siteId, roundups: [] });
  }

  try {
    // If specific slug requested
    if (slug) {
      const roundup = await kv.get(`roundups:${siteId}:${slug}`, 'json');
      if (!roundup) {
        return jsonResponse({ success: false, error: 'Roundup not found' }, 404);
      }
      return jsonResponse({ success: true, siteId, slug, roundup });
    }

    // List all roundups for this site
    const prefix = `roundups:${siteId}:`;
    const listed = await kv.list({ prefix });
    const roundups = [];

    for (const key of listed.keys || []) {
      const itemSlug = key.name.replace(prefix, '');
      const itemData = await kv.get(key.name, 'json');
      if (itemData) {
        roundups.push({
          slug: itemSlug,
          title: itemData.title || itemSlug,
          description: itemData.description || '',
          category: itemData.category || '',
          postType: itemData.postType || (Array.isArray(itemData.cards) && itemData.cards.length > 0 ? 'roundup' : 'single'),
          customPrice: itemData.customPrice || '',
          customProductTitle: itemData.customProductTitle || '',
          prepTime: itemData.prepTime || '',
          cookTime: itemData.cookTime || '',
          servings: itemData.servings || '',
          calories: itemData.calories || '',
          ingredients: itemData.ingredients || '',
          chefNotes: itemData.chefNotes || '',
          faqs: Array.isArray(itemData.faqs) ? itemData.faqs : [],
          image: itemData.image || '',
          cardsCount: Array.isArray(itemData.cards) ? itemData.cards.length : 0,
          updatedAt: itemData.updatedAt || null,
        });
      }
    }

    return jsonResponse({ success: true, siteId, roundups });
  } catch {
    return jsonResponse({ success: false, error: 'Failed to retrieve roundups' }, 500);
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

    if (!slug) {
      return jsonResponse({ success: false, error: 'Slug is required' }, 400);
    }

    const faqs = Array.isArray(body.faqs)
      ? body.faqs
          .filter((f) => f && typeof f === 'object' && ((f.question || f.q) || (f.answer || f.a)))
          .map((f) => ({
            question: String(f.question || f.q || '').trim(),
            answer: String(f.answer || f.a || '').trim(),
          }))
      : [];

    const roundupData = {
      slug,
      title: body.title || slug,
      description: body.description || '',
      category: body.category || '',
      postType: body.postType === 'single' ? 'single' : 'roundup',
      customPrice: body.customPrice ? String(body.customPrice).trim() : '',
      customProductTitle: body.customProductTitle ? String(body.customProductTitle).trim() : '',
      prepTime: body.prepTime ? String(body.prepTime).trim() : '',
      cookTime: body.cookTime ? String(body.cookTime).trim() : '',
      servings: body.servings ? String(body.servings).trim() : '',
      calories: body.calories ? String(body.calories).trim() : '',
      ingredients: body.ingredients ? String(body.ingredients).trim() : '',
      chefNotes: body.chefNotes ? String(body.chefNotes).trim() : '',
      faqs,
      image: body.image || '',
      cards: Array.isArray(body.cards) ? body.cards : [],
      updatedAt: new Date().toISOString(),
    };

    await kv.put(`roundups:${siteId}:${slug}`, JSON.stringify(roundupData));

    return jsonResponse({ success: true, siteId, slug, roundup: roundupData });
  } catch {
    return jsonResponse({ success: false, error: 'Failed to save roundup' }, 400);
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

    await kv.delete(`roundups:${siteId}:${slug}`);
    return jsonResponse({ success: true, siteId, slug, message: 'Roundup deleted' });
  } catch {
    return jsonResponse({ success: false, error: 'Failed to delete roundup' }, 500);
  }
}
