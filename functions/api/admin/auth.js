/**
 * Helper to check admin authorization.
 */
export function verifyAdmin(context) {
  const expectedKey = context.env?.ADMIN_KEY || 'admin123';
  const authHeader = context.request.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const url = new URL(context.request.url);
  const queryKey = url.searchParams.get('adminKey') || '';

  return Boolean((token && token === expectedKey) || (queryKey && queryKey === expectedKey));
}

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function onRequestOptions() {
  return jsonResponse({ ok: true });
}

export async function onRequestGet(context) {
  if (!verifyAdmin(context)) {
    return jsonResponse({ authenticated: false, error: 'Unauthorized' }, 401);
  }
  return jsonResponse({ authenticated: true });
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const providedKey = (body.key || body.password || '').trim();
    const expectedKey = context.env?.ADMIN_KEY || 'admin123';

    if (providedKey === expectedKey) {
      return jsonResponse({ success: true, token: expectedKey });
    }

    return jsonResponse({ success: false, error: 'Invalid ADMIN_KEY' }, 401);
  } catch {
    return jsonResponse({ success: false, error: 'Invalid request body' }, 400);
  }
}
