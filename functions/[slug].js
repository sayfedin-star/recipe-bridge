import recipesData from '../data/recipes.json';

/**
 * Escapes special characters to avoid XSS in HTML output.
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Finds a recipe by slug from bundled data or ASSETS fallback.
 */
async function getRecipe(slug, context) {
  const normalizedSlug = typeof slug === 'string' ? decodeURIComponent(slug).trim().toLowerCase() : '';
  if (!normalizedSlug) return null;

  if (Array.isArray(recipesData)) {
    const found = recipesData.find((r) => r.slug && r.slug.toLowerCase() === normalizedSlug);
    if (found) return found;
  }

  // Fallback to fetch from static ASSETS binding if available
  if (context && context.env && context.env.ASSETS && typeof context.env.ASSETS.fetch === 'function') {
    try {
      const assetRes = await context.env.ASSETS.fetch(new URL('/data/recipes.json', context.request.url));
      if (assetRes.ok) {
        const json = await assetRes.json();
        if (Array.isArray(json)) {
          return json.find((r) => r.slug && r.slug.toLowerCase() === normalizedSlug) || null;
        }
      }
    } catch {
      // Ignore fallback error
    }
  }

  return null;
}

/**
 * Generates 404 HTML response page.
 */
function render404(slug) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>404 - Recipe Not Found | Recipe Bridge</title>
  <style>
    :root {
      --bg: #0f172a;
      --surface: #1e293b;
      --border: #334155;
      --primary: #f97316;
      --primary-hover: #ea580c;
      --text: #f8fafc;
      --text-muted: #94a3b8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      text-align: center;
    }
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 1rem;
      padding: 3rem 2rem;
      max-width: 480px;
      width: 100%;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: rgba(249, 115, 22, 0.15);
      color: var(--primary);
      border: 1px solid rgba(249, 115, 22, 0.3);
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }
    h1 { font-size: 2rem; font-weight: 800; margin-bottom: 0.75rem; }
    p { color: var(--text-muted); font-size: 1rem; margin-bottom: 2rem; }
    .btn {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      background: var(--primary);
      color: #fff;
      text-decoration: none;
      font-weight: 600;
      border-radius: 0.5rem;
      transition: background 0.2s ease;
    }
    .btn:hover { background: var(--primary-hover); }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Error 404</div>
    <h1>Recipe Not Found</h1>
    <p>The requested recipe <strong>"${escapeHtml(slug)}"</strong> was not found in our database.</p>
    <a href="/" class="btn">Return to Homepage</a>
  </div>
</body>
</html>`;
}

/**
 * Generates recipe page HTML. Injects interaction redirection script for normal browsers only.
 */
function renderRecipePage(recipe, pageUrl, isPinterestBot) {
  const safeTitle = escapeHtml(recipe.title);
  const safeDesc = escapeHtml(recipe.description);
  const safeImage = escapeHtml(recipe.image);
  const safeUrl = escapeHtml(pageUrl);
  const safeTargetUrl = JSON.stringify(recipe.targetUrl || '/');

  // JSON-LD structured data for rich culinary snippet
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Recipe",
    "name": recipe.title,
    "description": recipe.description,
    "image": [recipe.image],
    "url": pageUrl,
  });

  // Interaction script only for normal browsers (never for pinterestbot)
  const redirectScript = isPinterestBot
    ? ''
    : `
  <script>
    (function() {
      var targetUrl = ${safeTargetUrl};
      var redirected = false;

      function triggerRedirect() {
        if (redirected) return;
        redirected = true;
        window.location.href = targetUrl;
      }

      var events = ['touchstart', 'scroll', 'click'];
      events.forEach(function(evt) {
        window.addEventListener(evt, triggerRedirect, { once: true, passive: true });
      });
    })();
  </script>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle} - Recipe Bridge</title>
  <meta name="description" content="${safeDesc}" />

  <!-- Open Graph Meta Tags for Pinterest & Social Platforms -->
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Recipe Bridge" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDesc}" />
  <meta property="og:image" content="${safeImage}" />
  <meta property="og:url" content="${safeUrl}" />

  <!-- Twitter Card Meta Tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDesc}" />
  <meta name="twitter:image" content="${safeImage}" />

  <!-- Schema.org Recipe Structured Data -->
  <script type="application/ld+json">
    ${jsonLd}
  </script>

  <style>
    :root {
      --bg: #0f172a;
      --surface: #1e293b;
      --surface-border: #334155;
      --primary: #f97316;
      --primary-hover: #ea580c;
      --text: #f8fafc;
      --text-muted: #94a3b8;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      line-height: 1.6;
    }

    header {
      border-bottom: 1px solid var(--surface-border);
      padding: 1.25rem 2rem;
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(8px);
    }

    .nav-container {
      max-width: 900px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .logo {
      font-size: 1.25rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text);
      text-decoration: none;
    }

    .logo-badge {
      background: linear-gradient(135deg, #f97316, #fb923c);
      color: #fff;
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      font-size: 0.85rem;
      font-weight: 800;
    }

    main {
      flex: 1;
      max-width: 900px;
      margin: 0 auto;
      padding: 2.5rem 1.5rem;
      width: 100%;
    }

    .recipe-card {
      background: var(--surface);
      border: 1px solid var(--surface-border);
      border-radius: 1rem;
      overflow: hidden;
      box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
    }

    .recipe-image-container {
      width: 100%;
      height: 380px;
      position: relative;
      background: #1e293b;
      overflow: hidden;
    }

    .recipe-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.3s ease;
    }

    .recipe-content {
      padding: 2rem;
    }

    .recipe-tag {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: rgba(249, 115, 22, 0.15);
      border: 1px solid rgba(249, 115, 22, 0.3);
      color: #fb923c;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 1rem;
    }

    .recipe-title {
      font-size: clamp(1.75rem, 4vw, 2.5rem);
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 1rem;
      color: #ffffff;
    }

    .recipe-description {
      font-size: 1.15rem;
      color: var(--text-muted);
      margin-bottom: 2rem;
      line-height: 1.7;
    }

    .action-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--surface-border);
      padding-top: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .btn-view {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: var(--primary);
      color: #fff;
      text-decoration: none;
      font-weight: 600;
      border-radius: 0.5rem;
      transition: background 0.2s ease;
    }

    .btn-view:hover {
      background: var(--primary-hover);
    }

    footer {
      border-top: 1px solid var(--surface-border);
      padding: 1.5rem;
      text-align: center;
      color: var(--text-muted);
      font-size: 0.875rem;
      margin-top: auto;
    }
  </style>
</head>
<body>
  <header>
    <div class="nav-container">
      <a href="/" class="logo">
        <span class="logo-badge">RB</span>
        <span>Recipe Bridge</span>
      </a>
      <span style="font-size: 0.875rem; color: var(--text-muted);">Recipe View</span>
    </div>
  </header>

  <main>
    <article class="recipe-card">
      <div class="recipe-image-container">
        <img
          src="${safeImage}"
          alt="${safeTitle}"
          class="recipe-image"
          loading="eager"
        />
      </div>

      <div class="recipe-content">
        <span class="recipe-tag">Featured Recipe</span>
        <h1 class="recipe-title">${safeTitle}</h1>
        <p class="recipe-description">${safeDesc}</p>

        <div class="action-bar">
          <a href="${escapeHtml(recipe.targetUrl || '#')}" class="btn-view" id="cta-link">
            <span>View Full Recipe</span>
            <span>&rarr;</span>
          </a>
          <span style="font-size: 0.85rem; color: var(--text-muted);">
            Tap or scroll anywhere to continue
          </span>
        </div>
      </div>
    </article>
  </main>

  <footer>
    <p>&copy; 2026 Recipe Bridge. All rights reserved.</p>
  </footer>${redirectScript}
</body>
</html>`;
}

/**
 * Cloudflare Pages Function onRequest handler.
 */
export async function onRequest(context) {
  const { slug } = context.params;
  const recipe = await getRecipe(slug, context);

  if (!recipe) {
    return new Response(render404(slug), {
      status: 404,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  }

  const userAgent = (context.request.headers.get('user-agent') || '').toLowerCase();
  const isPinterestBot = userAgent.includes('pinterestbot');
  const pageUrl = context.request.url;

  const html = renderRecipePage(recipe, pageUrl, isPinterestBot);

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': isPinterestBot ? 'public, max-age=3600' : 'no-store, no-cache, must-revalidate',
    },
  });
}
