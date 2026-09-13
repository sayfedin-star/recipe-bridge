import defaultConfig from '../config.json';
import recipesData from '../data/recipes.json';

const defaultNavLinks = [
  { label: 'Home', url: '/' },
  { label: 'Slow Cooker', url: '/category/slow-cooker' },
  { label: 'High Protein', url: '/category/high-protein' },
  { label: 'Quick Dinners', url: '/category/quick-dinners' },
  { label: 'E-Books', url: '/#recipe' },
];

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

const defaultIngredients = [
  '4 cups fresh broccoli florets, trimmed into bite-sized pieces',
  '1/2 cup crisp crumbled bacon or smoked turkey bacon',
  '1/3 cup red onion, finely diced',
  '1/2 cup sharp cheddar cheese, freshly shredded',
  '1/4 cup toasted sunflower seeds or sliced almonds',
  '3/4 cup creamy homemade dressing (mayo, apple cider vinegar, honey)',
  'Sea salt and freshly cracked black pepper to taste',
];

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
      postType: 'single',
      customPrice: '',
      customProductTitle: '',
      ingredients: defaultIngredients.join('\n'),
      cards: [],
    };
  }

  const generatedTitle = formatTitleFromSlug(normalizedSlug);
  return {
    title: generatedTitle,
    description: `Discover our easy and delicious recipe for ${generatedTitle}. Fresh ingredients, simple step-by-step instructions, and authentic culinary taste.`,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80',
    postType: 'single',
    customPrice: '',
    customProductTitle: '',
    ingredients: defaultIngredients.join('\n'),
    cards: [],
  };
}

/**
 * Returns shared CSS styles for the Light Editorial Food Theme.
 * Note: header uses position: relative to flow naturally with document.
 */
function getSharedStyles() {
  return `
    :root {
      --bg-page: #fbfaf8;
      --surface: #ffffff;
      --border-subtle: #f1f5f9;
      --border-card: #e2e8f0;
      --text-heading: #1e293b;
      --text-body: #475569;
      --text-muted: #64748b;
      --primary: #ea580c;
      --primary-hover: #c2410c;
      --primary-light: #fff7ed;
      --emerald: #059669;
      --emerald-light: #ecfdf5;
      --amber: #d97706;
      --font-serif: Georgia, Cambria, "Times New Roman", Times, serif;
      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: var(--font-sans);
      background-color: var(--bg-page);
      color: var(--text-body);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      line-height: 1.65;
      -webkit-font-smoothing: antialiased;
    }

    /* Header fixed to flow naturally with page (no sticky, no fixed) */
    header {
      background: var(--surface);
      border-bottom: 1px solid var(--border-card);
      position: relative;
      z-index: 10;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
    }

    .header-inner {
      max-width: 1040px;
      margin: 0 auto;
      padding: 0.9rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      text-decoration: none;
      color: var(--text-heading);
      font-weight: 800;
      font-size: 1.3rem;
      letter-spacing: -0.02em;
    }

    .logo-badge {
      background: linear-gradient(135deg, #ea580c, #f97316);
      color: #fff;
      font-size: 0.8rem;
      font-weight: 800;
      padding: 0.25rem 0.55rem;
      border-radius: 0.375rem;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      list-style: none;
    }

    .nav-link {
      text-decoration: none;
      color: var(--text-muted);
      font-size: 0.875rem;
      font-weight: 600;
      transition: color 0.15s ease;
    }

    .nav-link:hover {
      color: var(--primary);
    }

    @media (max-width: 720px) {
      .nav-links { display: none; }
    }

    main {
      flex: 1;
      max-width: 960px;
      width: 100%;
      margin: 0 auto;
      padding: 2.5rem 1.25rem 4rem;
    }

    footer {
      background: #ffffff;
      border-top: 1px solid var(--border-card);
      margin-top: auto;
      padding: 3rem 1.5rem 2rem;
    }

    .footer-inner {
      max-width: 1040px;
      margin: 0 auto;
      text-align: center;
    }

    .footer-links {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
      list-style: none;
    }

    .footer-link {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 600;
      transition: color 0.15s ease;
    }

    .footer-link:hover {
      color: var(--primary);
    }

    .footer-disclaimer {
      font-size: 0.8rem;
      color: var(--text-muted);
      line-height: 1.6;
      max-width: 760px;
      margin: 0 auto 1.25rem;
    }

    .footer-copy {
      font-size: 0.8rem;
      color: #94a3b8;
    }
  `;
}

/**
 * Returns CSS styles specifically tailored for the 40 Aprons Theme.
 * Warm ivory background, charcoal serif titles, terracotta accents, WPRM card, 2-column layout.
 */
function get40ApronsStyles() {
  return `
    :root {
      --fa-bg: #faf7f2;
      --fa-surface: #ffffff;
      --fa-surface-card: #fdfbf7;
      --fa-surface-peach: #fceded;
      --fa-peach-border: #fed7aa;
      --fa-border: #e7e0d6;
      --fa-heading: #2d2926;
      --fa-body: #374151;
      --fa-muted: #6b7280;
      --fa-primary: #c86a37;
      --fa-primary-hover: #b45b29;
      --fa-stars: #d97706;
      --font-serif: Georgia, "Times New Roman", Times, serif;
      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: var(--fa-bg);
      color: var(--fa-body);
      font-family: var(--font-sans);
      line-height: 1.65;
      -webkit-font-smoothing: antialiased;
    }

    /* Header flows naturally with page (no sticky, no fixed) */
    header {
      background: #ffffff;
      border-bottom: 1px solid var(--fa-border);
      position: relative;
      z-index: 10;
    }

    .header-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      font-family: var(--font-serif);
      font-weight: 700;
      font-size: 1.35rem;
      color: var(--fa-heading);
    }

    .logo-badge {
      background: var(--fa-primary);
      color: #fff;
      font-family: var(--font-sans);
      font-size: 0.75rem;
      font-weight: 800;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      list-style: none;
      margin: 0;
      padding: 0;
      flex-wrap: wrap;
    }

    .nav-link {
      text-decoration: none;
      color: var(--fa-heading);
      font-size: 0.9rem;
      font-weight: 600;
      transition: color 0.15s ease;
    }

    .nav-link:hover {
      color: var(--fa-primary);
    }

    @media (max-width: 720px) {
      .nav-links { display: none; }
    }

    /* Hero Bar */
    .fa-hero-wrapper {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1.75rem 1.25rem 0;
    }

    .fa-breadcrumbs {
      font-size: 0.85rem;
      color: var(--fa-muted);
      margin-bottom: 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .fa-breadcrumbs a {
      color: var(--fa-muted);
      text-decoration: none;
      transition: color 0.15s ease;
    }

    .fa-breadcrumbs a:hover {
      color: var(--fa-primary);
    }

    .fa-breadcrumbs .active {
      color: var(--fa-heading);
      font-weight: 600;
    }

    .fa-title {
      font-family: var(--font-serif);
      font-size: clamp(2rem, 4.5vw, 3.1rem);
      font-weight: 700;
      color: var(--fa-heading);
      line-height: 1.15;
      margin-bottom: 0.75rem;
      letter-spacing: -0.015em;
    }

    .fa-rating-bar {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 0.85rem;
    }

    .fa-stars {
      color: var(--fa-stars);
      font-size: 1.15rem;
      letter-spacing: 2px;
    }

    .fa-rating-score {
      font-weight: 700;
      color: var(--fa-heading);
      font-size: 0.95rem;
    }

    .fa-rating-count {
      font-size: 0.85rem;
      color: var(--fa-muted);
    }

    .fa-meta-bar {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      flex-wrap: wrap;
      font-size: 0.875rem;
      color: var(--fa-muted);
      padding-bottom: 1.25rem;
      border-bottom: 1px solid var(--fa-border);
      margin-bottom: 1.25rem;
    }

    .fa-meta-sep {
      color: #d1d5db;
    }

    .fa-action-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .btn-jump-recipe {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.75rem 1.75rem;
      background: var(--fa-primary);
      color: #ffffff;
      font-weight: 800;
      font-size: 0.925rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      border-radius: 9999px;
      text-decoration: none;
      box-shadow: 0 4px 15px rgba(200, 106, 55, 0.3);
      transition: all 0.2s ease;
      border: none;
      cursor: pointer;
    }

    .btn-jump-recipe:hover {
      background: var(--fa-primary-hover);
      transform: translateY(-1px);
    }

    .fa-icon-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-icon-action {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.6rem 1rem;
      background: #ffffff;
      border: 1px solid #d1d5db;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--fa-heading);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-icon-action:hover {
      border-color: var(--fa-primary);
      color: var(--fa-primary);
    }

    /* 2-Column Grid */
    .fa-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.25rem 3.5rem;
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 2.5rem;
      align-items: start;
    }

    @media (max-width: 960px) {
      .fa-container {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
    }

    /* Main Column */
    .fa-main-content {
      min-width: 0;
    }

    .fa-hero-media {
      width: 100%;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 1.75rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    }

    .fa-hero-img {
      width: 100%;
      max-height: 480px;
      object-fit: cover;
      display: block;
    }

    .fa-media-caption {
      padding: 0.65rem 1rem;
      font-size: 0.85rem;
      color: var(--fa-muted);
      font-style: italic;
      text-align: center;
      background: #ffffff;
      border: 1px solid var(--fa-border);
      border-top: none;
      border-bottom-left-radius: 12px;
      border-bottom-right-radius: 12px;
    }

    .fa-lead-content {
      margin-bottom: 2rem;
    }

    .fa-lead-p {
      font-size: 1.15rem;
      line-height: 1.75;
      color: var(--fa-heading);
      font-weight: 500;
      margin-bottom: 1rem;
    }

    .fa-story-p {
      font-size: 1.025rem;
      line-height: 1.8;
      color: #4b5563;
      margin-bottom: 1.5rem;
    }

    /* Chef's Tips */
    .fa-tips-box {
      background: var(--fa-surface-peach);
      border: 1px solid var(--fa-peach-border);
      border-radius: 12px;
      padding: 1.5rem 1.75rem;
      margin-bottom: 2.25rem;
    }

    .fa-tips-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.85rem;
    }

    .fa-tips-icon {
      font-size: 1.25rem;
    }

    .fa-tips-title {
      font-family: var(--font-serif);
      font-size: 1.25rem;
      font-weight: 700;
      color: #9a3412;
      margin: 0;
    }

    .fa-tips-list {
      margin: 0;
      padding-left: 1.25rem;
      color: #7c2d12;
      line-height: 1.8;
      font-size: 0.95rem;
    }

    .fa-tips-list li {
      margin-bottom: 0.4rem;
    }

    /* Cooking FAQ */
    .fa-faq-section {
      margin-bottom: 2.5rem;
    }

    .fa-faq-heading {
      font-family: var(--font-serif);
      font-size: 1.45rem;
      font-weight: 700;
      color: var(--fa-heading);
      margin-bottom: 1rem;
    }

    .fa-faq-stack {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .fa-faq-item {
      background: #ffffff;
      border: 1px solid var(--fa-border);
      border-radius: 10px;
      overflow: hidden;
    }

    .fa-faq-question {
      padding: 1rem 1.25rem;
      font-weight: 700;
      font-size: 1rem;
      color: var(--fa-heading);
      cursor: pointer;
      list-style: none;
      display: flex;
      justify-content: space-between;
      align-items: center;
      user-select: none;
      background: var(--fa-surface-card);
    }

    .fa-faq-question::-webkit-details-marker {
      display: none;
    }

    .fa-faq-question::after {
      content: "＋";
      font-size: 1.1rem;
      color: var(--fa-primary);
      font-weight: 700;
    }

    .fa-faq-item[open] .fa-faq-question::after {
      content: "−";
    }

    .fa-faq-answer {
      padding: 1rem 1.25rem;
      font-size: 0.95rem;
      line-height: 1.7;
      color: #4b5563;
      border-top: 1px solid #f3f4f6;
    }

    /* WPRM Recipe Card */
    .wprm-recipe-card {
      background: var(--fa-surface-card);
      border: 2px solid var(--fa-border);
      border-radius: 14px;
      padding: 2rem;
      box-shadow: 0 6px 25px rgba(0, 0, 0, 0.03);
      margin-bottom: 2.5rem;
    }

    .wprm-badge {
      display: inline-block;
      background: var(--fa-primary);
      color: #fff;
      font-size: 0.75rem;
      font-weight: 800;
      padding: 0.25rem 0.65rem;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 0.75rem;
    }

    .wprm-title {
      font-family: var(--font-serif);
      font-size: clamp(1.6rem, 3.5vw, 2.1rem);
      font-weight: 700;
      color: var(--fa-heading);
      line-height: 1.2;
      margin-bottom: 0.5rem;
    }

    .wprm-stars-line {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.85rem;
    }

    .wprm-stars {
      color: var(--fa-stars);
      font-size: 1.1rem;
      letter-spacing: 2px;
    }

    .wprm-rating-text {
      font-size: 0.85rem;
      color: var(--fa-muted);
      font-weight: 600;
    }

    .wprm-summary {
      font-size: 0.975rem;
      line-height: 1.65;
      color: #4b5563;
      margin-bottom: 1.5rem;
    }

    .wprm-times-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
      padding: 1.1rem;
      background: #ffffff;
      border: 1px solid var(--fa-border);
      border-radius: 8px;
      margin-bottom: 1.75rem;
      text-align: center;
    }

    @media (max-width: 600px) {
      .wprm-times-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .wprm-time-label {
      display: block;
      font-size: 0.725rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #9ca3af;
      margin-bottom: 0.25rem;
    }

    .wprm-time-val {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--fa-heading);
    }

    /* Digital Product Box inside WPRM */
    .fa-product-box {
      background: #ffffff;
      border: 1.5px dashed var(--fa-primary);
      border-radius: 10px;
      padding: 1.25rem;
      margin-bottom: 1.75rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .fa-prod-badge {
      font-size: 0.75rem;
      font-weight: 800;
      background: #fff7ed;
      color: var(--fa-primary);
      border: 1px solid #fed7aa;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .fa-prod-info {
      flex: 1;
      min-width: 200px;
    }

    .fa-prod-name {
      font-weight: 700;
      font-size: 0.95rem;
      color: var(--fa-heading);
      margin-bottom: 0.2rem;
    }

    .fa-prod-desc {
      font-size: 0.8rem;
      color: var(--fa-muted);
    }

    .fa-prod-price-tag {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--fa-primary);
    }

    .btn-fa-preview {
      padding: 0.6rem 1.1rem;
      background: var(--fa-primary);
      color: #fff;
      font-size: 0.85rem;
      font-weight: 700;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-fa-preview:hover {
      background: var(--fa-primary-hover);
    }

    /* WPRM Ingredients Checklist */
    /* WPRM Ingredients Checklist (Compact 40 Aprons Style) */
    .wprm-ingredients-section {
      margin-bottom: 1.75rem;
    }

    .wprm-section-title {
      font-family: var(--font-serif);
      font-size: 1.55rem;
      font-weight: 700;
      color: #2d2926;
      margin-bottom: 0.75rem;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .wprm-section-title::after {
      content: "";
      flex: 1;
      height: 1px;
      background: #e8e3dc;
    }

    .wprm-section-hint {
      display: none;
    }

    .wprm-checklist {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .wprm-item {
      display: flex;
      align-items: baseline;
      gap: 10px;
      padding: 4px 0;
      border: none;
      background: transparent;
      box-shadow: none;
      border-radius: 0;
      font-size: 15px;
      line-height: 1.5;
      color: #2d2926;
    }

    .wprm-checkbox-label {
      display: flex;
      align-items: baseline;
      gap: 10px;
      cursor: pointer;
      user-select: none;
      width: 100%;
    }

    .wprm-checkbox {
      width: 16px;
      height: 16px;
      min-width: 16px;
      accent-color: #c05621;
      border: 1px solid #d1d5db;
      border-radius: 3px;
      cursor: pointer;
      margin: 0;
      flex-shrink: 0;
      position: relative;
      top: 2px;
    }

    .wprm-text {
      font-size: 15px;
      line-height: 1.5;
      color: #2d2926;
      transition: all 0.15s ease;
    }

    .wprm-section-subhead {
      list-style: none;
      padding: 0 0 4px 0;
      margin-top: 18px;
      margin-bottom: 8px;
      border-bottom: 1px solid #e8e3dc;
    }

    .wprm-section-subhead:first-child {
      margin-top: 4px;
    }

    .wprm-section-subhead h4 {
      font-family: var(--font-serif);
      font-size: 18px;
      font-weight: 700;
      color: #2d2926;
      margin: 0;
      line-height: 1.3;
    }

    /* WPRM CTA Button */
    .wprm-btn-cta {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 1.15rem 1.5rem;
      background: var(--fa-primary);
      color: #ffffff;
      font-size: 1.1rem;
      font-weight: 800;
      border-radius: 10px;
      text-decoration: none;
      cursor: pointer;
      box-shadow: 0 6px 20px rgba(200, 106, 55, 0.35);
      transition: all 0.2s ease;
      border: none;
    }

    .wprm-btn-cta:hover {
      background: var(--fa-primary-hover);
      transform: translateY(-1px);
    }

    /* Sidebar */
    .fa-sidebar {
      position: sticky;
      top: 1.5rem;
    }

    .fa-widget {
      background: #ffffff;
      border: 1px solid var(--fa-border);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.75rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
    }

    .fa-widget-title {
      font-family: var(--font-serif);
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--fa-heading);
      padding-bottom: 0.6rem;
      border-bottom: 2px solid var(--fa-peach-border);
      margin-bottom: 1.25rem;
    }

    .fa-author-widget {
      text-align: center;
    }

    .fa-author-avatar-wrap {
      width: 90px;
      height: 90px;
      margin: 0 auto 1rem;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid #ffffff;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .fa-author-avatar {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .fa-author-name {
      font-family: var(--font-serif);
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--fa-heading);
      margin-bottom: 0.5rem;
    }

    .fa-author-bio {
      font-size: 0.875rem;
      line-height: 1.6;
      color: #4b5563;
      margin-bottom: 1.25rem;
    }

    .fa-author-btn {
      display: block;
      width: 100%;
      text-align: center;
      padding: 0.65rem 1rem;
      border: 2px solid var(--fa-primary);
      color: var(--fa-primary);
      font-weight: 700;
      font-size: 0.85rem;
      border-radius: 9999px;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .fa-author-btn:hover {
      background: var(--fa-primary);
      color: #ffffff;
    }

    .fa-search-form {
      display: flex;
      gap: 0.4rem;
    }

    .fa-search-input {
      flex: 1;
      padding: 0.6rem 0.85rem;
      border: 1px solid var(--fa-border);
      border-radius: 6px;
      font-size: 0.875rem;
      outline: none;
    }

    .fa-search-input:focus {
      border-color: var(--fa-primary);
    }

    .fa-search-btn {
      padding: 0.6rem 1rem;
      background: var(--fa-heading);
      color: #ffffff;
      border: none;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .fa-search-btn:hover {
      background: var(--fa-primary);
    }

    .fa-mini-cards {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .fa-mini-card {
      display: flex;
      gap: 0.85rem;
      align-items: center;
    }

    .fa-mini-thumb {
      width: 68px;
      height: 68px;
      border-radius: 8px;
      object-fit: cover;
      flex-shrink: 0;
      background: #f1f5f9;
    }

    .fa-mini-tag {
      display: inline-block;
      font-size: 0.7rem;
      font-weight: 800;
      color: var(--fa-primary);
      letter-spacing: 0.05em;
      margin-bottom: 0.2rem;
    }

    .fa-mini-title {
      font-size: 0.875rem;
      font-weight: 700;
      line-height: 1.35;
      margin: 0;
    }

    .fa-mini-link {
      color: var(--fa-heading);
      text-decoration: none;
      transition: color 0.15s ease;
    }

    .fa-mini-link:hover {
      color: var(--fa-primary);
    }

    /* Modal */
    .modal-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 999;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }

    .modal-card {
      background: #ffffff;
      border: 1px solid var(--fa-border);
      border-radius: 1.25rem;
      max-width: 480px;
      width: 100%;
      padding: 2.25rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
      text-align: center;
    }

    .modal-badge {
      display: inline-block;
      background: #fff7ed;
      color: var(--fa-primary);
      border: 1px solid var(--fa-peach-border);
      font-size: 0.75rem;
      font-weight: 800;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 1rem;
    }

    .modal-title {
      font-family: var(--font-serif);
      font-size: 1.65rem;
      font-weight: 700;
      color: var(--fa-heading);
      margin-bottom: 0.75rem;
    }

    .modal-text {
      font-size: 0.95rem;
      line-height: 1.65;
      color: var(--fa-body);
      margin-bottom: 1.75rem;
    }

    .modal-btn-group {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .btn-modal-primary {
      width: 100%;
      padding: 0.9rem 1.25rem;
      background: var(--fa-primary);
      color: #fff;
      font-weight: 800;
      font-size: 0.95rem;
      border-radius: 0.5rem;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(200, 106, 55, 0.3);
    }

    .btn-modal-sec {
      width: 100%;
      padding: 0.75rem 1.25rem;
      background: #f1f5f9;
      color: #475569;
      font-weight: 600;
      font-size: 0.9rem;
      border-radius: 0.5rem;
      border: none;
      cursor: pointer;
    }

    /* 40 Aprons Food Blog Professional Footer */
    footer {
      background: #f4eee6;
      border-top: 1px solid #e8e0d5;
      margin-top: 60px;
      padding: 40px 20px 30px;
      text-align: center;
      width: 100%;
    }

    .footer-inner {
      max-width: 900px;
      margin: 0 auto;
      text-align: center;
    }

    .footer-links {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 20px;
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .footer-links li {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .footer-link {
      color: #6b635b;
      font-size: 13px;
      font-weight: 500;
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .footer-link:hover {
      color: #c05621;
    }

    .footer-disclaimer {
      max-width: 680px;
      margin: 16px auto 0;
      font-size: 12px;
      color: #8c8278;
      line-height: 1.6;
    }

    .footer-copy {
      margin-top: 12px;
      font-size: 12px;
      color: #a3998f;
    }
  `;
}

/**
 * Returns header HTML with custom logo text and navigation links.
 */
function renderHeader(siteConfig) {
  const logoText = escapeHtml(siteConfig.navigation?.logoText || siteConfig.siteName || 'Recipe Bridge');
  const links = Array.isArray(siteConfig.navigation?.navLinks) && siteConfig.navigation.navLinks.length > 0
    ? siteConfig.navigation.navLinks
    : defaultNavLinks;

  return `
  <header>
    <div class="header-inner">
      <a href="/" class="logo">
        <span class="logo-badge">RB</span>
        <span>${logoText}</span>
      </a>
      <ul class="nav-links">
        ${links.map((l) => `<li><a href="${escapeHtml(l.url)}" class="nav-link">${escapeHtml(l.label)}</a></li>`).join('')}
      </ul>
    </div>
  </header>`;
}

/**
 * Returns compliance footer HTML.
 */
function renderFooter(siteConfig) {
  const siteName = escapeHtml(siteConfig.siteName || 'Recipe Bridge');
  return `
  <footer>
    <div class="footer-inner">
      <ul class="footer-links">
        <li><a href="/privacy-policy" class="footer-link">Privacy Policy</a></li>
        <li><a href="/terms-of-service" class="footer-link">Terms of Service</a></li>
        <li><a href="/disclosure" class="footer-link">Affiliate & Recipe Disclosure</a></li>
        <li><a href="/about-us" class="footer-link">About Us</a></li>
        <li><a href="/contact" class="footer-link">Contact</a></li>
      </ul>
      <p class="footer-disclaimer">
        Disclaimer: The culinary advice, nutritional guides, and recipe suggestions published on ${siteName} are for educational and inspirational purposes. Actual nutritional values may vary based on preparation and ingredients.
      </p>
      <p class="footer-copy">
        &copy; 2026 ${siteName}. All rights reserved.
      </p>
    </div>
  </footer>`;
}

/**
 * Generates the rich dynamic Homepage HTML. (No redirect, natural browsing)
 */
function renderHomepage({ siteConfig, categories, roundups }) {
  const siteName = escapeHtml(siteConfig.siteName || 'Recipe Bridge');

  const categoriesHtml = categories
    .map(
      (c) => `
      <a href="/category/${escapeHtml(c.slug)}" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 9999px; text-decoration: none; color: #1e293b; font-weight: 700; font-size: 0.875rem; box-shadow: 0 2px 6px rgba(0,0,0,0.03); transition: all 0.2s;">
        <span>🍲</span>
        <span>${escapeHtml(c.name)}</span>
      </a>
    `
    )
    .join('');

  const articlesHtml = (roundups && roundups.length > 0 ? roundups : [
    {
      slug: 'broccoli-salad',
      title: 'Quick & Easy Broccoli Salad with Creamy Dressing',
      description: 'Fresh, crunchy, and tossed in a creamy homemade dressing for the perfect family dinner side.',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
      category: 'quick-dinners',
    },
  ])
    .map(
      (r) => `
      <article style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1rem; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.04); display: flex; flex-direction: column; transition: transform 0.2s;">
        <div style="height: 220px; overflow: hidden; position: relative;">
          <img src="${escapeHtml(r.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80')}" alt="${escapeHtml(r.title)}" style="width: 100%; height: 100%; object-fit: cover;" />
          ${r.category ? `<span style="position: absolute; bottom: 0.75rem; left: 0.75rem; background: rgba(234, 88, 12, 0.95); color: #fff; font-size: 0.75rem; font-weight: 800; padding: 0.2rem 0.6rem; border-radius: 9999px; text-transform: uppercase;">${escapeHtml(r.category)}</span>` : ''}
        </div>
        <div style="padding: 1.5rem; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <h3 style="font-family: Georgia, serif; font-size: 1.35rem; font-weight: 800; color: #1e293b; line-height: 1.3; margin-bottom: 0.5rem;">
              <a href="/${escapeHtml(r.slug)}" style="color: inherit; text-decoration: none;">${escapeHtml(r.title)}</a>
            </h3>
            <p style="font-size: 0.9rem; color: #64748b; line-height: 1.6; margin-bottom: 1.25rem;">${escapeHtml(r.description || '')}</p>
          </div>
          <a href="/${escapeHtml(r.slug)}" style="display: inline-flex; align-items: center; gap: 0.35rem; color: #ea580c; font-weight: 700; font-size: 0.9rem; text-decoration: none;">
            <span>Read Full Recipe</span>
            <span>&rarr;</span>
          </a>
        </div>
      </article>
    `
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${siteName} - Tested Everyday Recipes & Healthy Meal Ideas</title>
  <meta name="description" content="Discover tested, wholesome, and delicious family recipes. From slow cooker sensations to quick 30-minute dinners." />
  <style>
    ${getSharedStyles()}
  </style>
</head>
<body>
  ${renderHeader(siteConfig)}

  <main>
    <section style="text-align: center; margin-bottom: 3rem;">
      <span style="display: inline-block; padding: 0.3rem 0.8rem; background: #fff7ed; color: #ea580c; border-radius: 9999px; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem;">Culinary Excellence</span>
      <h1 style="font-family: var(--font-serif); font-size: clamp(2.2rem, 5vw, 3.25rem); font-weight: 900; color: var(--text-heading); margin-bottom: 0.75rem; letter-spacing: -0.02em;">Fresh, Tested & Wholesome Everyday Recipes</h1>
      <p style="font-size: 1.15rem; color: var(--text-muted); max-width: 680px; margin: 0 auto 1.75rem;">Explore our chef-developed collections designed for busy families who love healthy, flavor-packed meals.</p>
      
      <div style="display: flex; gap: 0.65rem; justify-content: center; flex-wrap: wrap;">
        ${categoriesHtml}
      </div>
    </section>

    <section>
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1.5rem;">
        <div>
          <h2 style="font-family: var(--font-serif); font-size: 1.75rem; font-weight: 800; color: var(--text-heading);">Latest Recipe Collections</h2>
          <p style="font-size: 0.9rem; color: var(--text-muted);">Hand-picked, kitchen-tested meal inspirations.</p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.75rem;">
        ${articlesHtml}
      </div>
    </section>
  </main>

  ${renderFooter(siteConfig)}
</body>
</html>`;
}

/**
 * Generates the Category Archive page HTML. (No redirect, natural browsing)
 */
function renderCategoryArchive({ siteConfig, category, roundups }) {
  const catName = escapeHtml(category.name);
  const catDesc = escapeHtml(category.description || `Browse our best ${category.name} recipes and meal ideas.`);

  const itemsHtml = roundups.length > 0
    ? roundups
        .map(
          (r) => `
        <article style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1rem; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.04); display: flex; flex-direction: column;">
          <div style="height: 220px; overflow: hidden;">
            <img src="${escapeHtml(r.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80')}" alt="${escapeHtml(r.title)}" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
          <div style="padding: 1.5rem; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <h3 style="font-family: Georgia, serif; font-size: 1.3rem; font-weight: 800; color: #1e293b; line-height: 1.3; margin-bottom: 0.5rem;">
                <a href="/${escapeHtml(r.slug)}" style="color: inherit; text-decoration: none;">${escapeHtml(r.title)}</a>
              </h3>
              <p style="font-size: 0.9rem; color: #64748b; line-height: 1.6; margin-bottom: 1.25rem;">${escapeHtml(r.description || '')}</p>
            </div>
            <a href="/${escapeHtml(r.slug)}" style="display: inline-flex; align-items: center; gap: 0.35rem; color: #ea580c; font-weight: 700; font-size: 0.9rem; text-decoration: none;">
              <span>View Recipe Guide</span>
              <span>&rarr;</span>
            </a>
          </div>
        </article>
      `
        )
        .join('')
    : `<div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: #fff; border: 1px solid #e2e8f0; border-radius: 1rem; color: #64748b;">
        Recipes in this category are being updated. Check back shortly or browse our <a href="/" style="color: #ea580c; font-weight: 700;">Home Page</a>.
      </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${catName} Recipes - ${escapeHtml(siteConfig.siteName || 'Recipe Bridge')}</title>
  <meta name="description" content="${catDesc}" />
  <style>
    ${getSharedStyles()}
  </style>
</head>
<body>
  ${renderHeader(siteConfig)}

  <main>
    <div style="margin-bottom: 2.5rem; text-align: center;">
      <div style="font-size: 0.85rem; color: #ea580c; font-weight: 700; text-transform: uppercase; margin-bottom: 0.5rem;">Recipe Category</div>
      <h1 style="font-family: var(--font-serif); font-size: 2.5rem; font-weight: 900; color: var(--text-heading); margin-bottom: 0.75rem;">${catName}</h1>
      <p style="font-size: 1.1rem; color: var(--text-muted); max-width: 600px; margin: 0 auto;">${catDesc}</p>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.75rem;">
      ${itemsHtml}
    </div>
  </main>

  ${renderFooter(siteConfig)}
</body>
</html>`;
}

/**
 * Generates clean static legal / E-E-A-T pages HTML. (No redirect, natural browsing)
 */
function renderStaticPage({ siteConfig, title, content }) {
  const safeTitle = escapeHtml(title);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle} - ${escapeHtml(siteConfig.siteName || 'Recipe Bridge')}</title>
  <style>
    ${getSharedStyles()}
    .static-article {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 1rem;
      padding: 3rem 2.5rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
    }
    .static-article h1 {
      font-family: var(--font-serif);
      font-size: 2.4rem;
      font-weight: 900;
      color: var(--text-heading);
      margin-bottom: 1.5rem;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 1rem;
    }
    .static-article p {
      font-size: 1.05rem;
      line-height: 1.8;
      color: var(--text-body);
      margin-bottom: 1.25rem;
    }
    .static-article h2 {
      font-family: var(--font-serif);
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-heading);
      margin: 2rem 0 0.75rem;
    }
    .static-article ul {
      margin: 1rem 0 1.5rem 1.5rem;
      color: var(--text-body);
    }
    .static-article li {
      margin-bottom: 0.5rem;
    }
  </style>
</head>
<body>
  ${renderHeader(siteConfig)}

  <main>
    <article class="static-article">
      <h1>${safeTitle}</h1>
      <div>${content}</div>
    </article>
  </main>

  ${renderFooter(siteConfig)}
</body>
</html>`;
}

/**
 * Generates the full Recipe/Roundup Article HTML response (Light Editorial Food Theme).
 * Supports Single Recipe and Roundup Collection page types with per-page custom product schema.
 */
function renderRecipeArticle({
  title,
  description,
  image,
  cards,
  postType,
  category,
  customPrice,
  customProductTitle,
  prepTime,
  cookTime,
  servings,
  calories,
  ingredients,
  chefNotes,
  faqs,
  pageUrl,
  encodedTarget,
  isPinterestBot,
  siteConfig,
  siteId,
  slug,
  baseDomain,
}) {
  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(description);
  const safeImage = escapeHtml(image);
  const safeUrl = escapeHtml(pageUrl);

  const siteName = siteConfig.siteName || 'Recipe Bridge';
  const safeSiteName = escapeHtml(siteName);

  const productDefaults = siteConfig.productDefaults || {
    price: '2.25',
    currency: 'USD',
    availability: 'https://schema.org/InStock',
    brand: siteName,
  };

  // Resolve custom per-page price and product title
  const finalPrice = customPrice && String(customPrice).trim()
    ? String(customPrice).trim()
    : (productDefaults.price || '2.25');

  const finalProductTitle = customProductTitle && String(customProductTitle).trim()
    ? String(customProductTitle).trim()
    : `${title} • Printable Collector Pack`;

  const safePrice = escapeHtml(finalPrice);
  const safeCurrency = escapeHtml(productDefaults.currency || 'USD');
  const safeBrand = escapeHtml(productDefaults.brand || siteName);
  const safeProductTitle = escapeHtml(finalProductTitle);

  const isSingle = postType === 'single';

  // Schema.org Product structured data for Pinterest Product Rich Pins validation
  const productSchema = JSON.stringify({
    '@context': 'https://schema.org/',
    '@type': 'Product',
    '@id': pageUrl,
    name: finalProductTitle,
    description: description,
    image: [image],
    brand: {
      '@type': 'Brand',
      name: safeBrand,
    },
    offers: {
      '@type': 'Offer',
      price: finalPrice,
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
      var mainSlug = ${JSON.stringify(slug)};
      var redirected = false;

      function trackClick(itemSlug) {
        try {
          var payload = JSON.stringify({
            siteId: siteId,
            slug: itemSlug || mainSlug,
            type: 'cta_click'
          });
          if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/track', payload);
          } else {
            fetch('/api/track', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: payload,
              keepalive: true
            }).catch(function() {});
          }
        } catch (e) {}
      }

      function doRedirect(customEncoded, itemSlug) {
        if (redirected) return;
        redirected = true;
        trackClick(itemSlug);
        var targetB64 = customEncoded || encodedTarget;
        var delay = Number(settings.actionDelayMs) || 0;
        setTimeout(function() {
          try {
            var destination = atob(targetB64);
            window.location.replace(destination);
          } catch (e) {
            // fallback
          }
        }, Math.max(0, delay));
      }

      // Touch trigger
      if (triggers.touch) {
        window.addEventListener('touchstart', function() { doRedirect(); }, { once: true, passive: true });
      }

      // Click trigger
      if (triggers.click) {
        window.addEventListener('click', function(e) {
          if (!e.target.closest('#pdf-modal') && !e.target.closest('#btn-pdf-pack')) {
            doRedirect();
          }
        }, { once: true, passive: true });
      }

      // CTA button triggers
      var ctaButtons = document.querySelectorAll('#cta-link, .btn-wide-recipe, .btn-make-recipe, .btn-jump-recipe, .wprm-btn-cta');
      ctaButtons.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          var customTarget = btn.getAttribute('data-target');
          var itemSlug = btn.getAttribute('data-slug');
          doRedirect(customTarget, itemSlug);
        });
      });

      // WPRM interactive checkboxes
      document.querySelectorAll('.wprm-checkbox').forEach(function(cb) {
        cb.addEventListener('change', function() {
          var item = cb.closest('.wprm-item');
          if (!item) return;
          var text = item.querySelector('.wprm-text');
          if (text) {
            if (cb.checked) {
              text.style.textDecoration = 'line-through';
              text.style.opacity = '0.55';
            } else {
              text.style.textDecoration = 'none';
              text.style.opacity = '1';
            }
          }
        });
      });

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
        setTimeout(function() { doRedirect(); }, timerDelay);
      }

      // PDF Modal handlers
      var pdfBtn = document.getElementById('btn-pdf-pack');
      var pdfModal = document.getElementById('pdf-modal');
      var closePdfModal = document.getElementById('close-pdf-modal');
      var modalJumpBtn = document.getElementById('modal-jump-btn');

      if (pdfBtn && pdfModal) {
        pdfBtn.addEventListener('click', function(e) {
          e.preventDefault();
          pdfModal.style.display = 'flex';
        });
      }
      if (closePdfModal && pdfModal) {
        closePdfModal.addEventListener('click', function() {
          pdfModal.style.display = 'none';
        });
      }
      if (modalJumpBtn) {
        modalJumpBtn.addEventListener('click', function(e) {
          e.preventDefault();
          if (pdfModal) pdfModal.style.display = 'none';
          doRedirect();
        });
      }
    })();
  </script>`;

  const rawIngs = ingredients && ingredients.trim()
    ? ingredients.split('\n').map((l) => l.trim()).filter(Boolean)
    : defaultIngredients;

  const theme = siteConfig.theme || '40aprons';
  const articleParams = {
    title,
    description,
    image,
    cards,
    postType,
    category,
    customPrice,
    customProductTitle,
    prepTime,
    cookTime,
    servings,
    calories,
    ingredients,
    chefNotes,
    faqs,
    pageUrl,
    encodedTarget,
    isPinterestBot,
    siteConfig,
    siteId,
    slug,
    baseDomain,
    safeTitle,
    safeDesc,
    safeImage,
    safeUrl,
    safeSiteName,
    safePrice,
    safeCurrency,
    safeBrand,
    safeProductTitle,
    finalPrice,
    finalProductTitle,
    isSingle,
    productSchema,
    redirectScript,
    rawIngs,
  };

  if (theme === 'editorial') {
    return renderEditorialThemeArticle(articleParams);
  }
  return render40ApronsThemeArticle(articleParams);
}

/**
 * Generates the classic Editorial Theme layout.
 */
function renderEditorialThemeArticle({
  cards,
  postType,
  safeTitle,
  safeDesc,
  safeImage,
  safeUrl,
  safeSiteName,
  safePrice,
  safeCurrency,
  safeProductTitle,
  isSingle,
  productSchema,
  redirectScript,
  rawIngs,
  encodedTarget,
  isPinterestBot,
  siteConfig,
  siteId,
  slug,
  baseDomain,
  image,
}) {
  // Build Single Recipe Ingredients Checklist OR Roundup Recipe Cards
  let mainContentHtml = '';

  if (isSingle) {

    const btnAttributes = isPinterestBot
      ? 'href="#recipe"'
      : `href="#recipe" class="btn-wide-recipe" id="cta-link" data-target="${encodedTarget}" data-slug="${slug}"`;

    mainContentHtml = `
      <section class="ingredients-section" id="recipe-ingredients">
        <div class="section-badge">Kitchen Tested</div>
        <h2 class="ingredients-title">Ingredients Checklist</h2>
        <p class="ingredients-desc">Gather these fresh, wholesome ingredients before cooking. Check off each item as you prep:</p>

        <div class="ingredients-grid">
          ${rawIngs
            .map((ing) => {
              if (ing.startsWith('#')) {
                const subhead = escapeHtml(ing.replace(/^#+\s*/, '').trim());
                return `<div style="grid-column: 1 / -1; font-family: var(--font-serif); font-weight: 700; font-size: 1.1rem; color: var(--text-heading); border-bottom: 2px solid var(--border-subtle); padding-bottom: 0.35rem; margin-top: 0.75rem;">${subhead}</div>`;
              }
              return `
            <div class="ingredient-item">
              <span class="ingredient-check">✓</span>
              <span>${escapeHtml(ing)}</span>
            </div>
          `;
            })
            .join('')}
        </div>

        <div style="margin-top: 2rem;">
          <a ${btnAttributes}>
            <span>Jump to Full Recipe & Instructions</span>
            <span>&rarr;</span>
          </a>
        </div>
      </section>
    `;
  } else if (Array.isArray(cards) && cards.length > 0) {
    mainContentHtml = `
      <section class="roundup-section" id="recipes-list">
        <div class="section-badge">Featured Collection</div>
        <h2 class="section-title">The Complete Recipe Guide</h2>
        <p class="section-subtitle">Browse through our tested, highly rated culinary selections below. Tap any recipe card to jump directly to detailed cooking instructions.</p>

        <div class="cards-stack">
          ${cards
            .map((c, idx) => {
              const cardTitle = escapeHtml(c.title || `Recipe #${idx + 1}`);
              const cardDesc = escapeHtml(c.description || 'Packed with vibrant flavors and wholesome ingredients. Easy to prepare for busy weeknights.');
              const cardImg = escapeHtml(c.image || image);
              const cardSlug = escapeHtml(c.slug || `${slug}-recipe-${idx + 1}`);

              let cardEncoded = encodedTarget;
              if (!isPinterestBot) {
                let rawTarget = (c.targetUrl || c.targetPath || '').trim();
                let cardTargetUrlObj;
                try {
                  if (rawTarget.startsWith('http://') || rawTarget.startsWith('https://')) {
                    cardTargetUrlObj = new URL(rawTarget);
                  } else {
                    const cleanPath = rawTarget ? (rawTarget.startsWith('/') ? rawTarget : `/${rawTarget}`) : `/${slug}`;
                    cardTargetUrlObj = new URL(`${baseDomain}${cleanPath}`);
                  }
                } catch {
                  cardTargetUrlObj = new URL(`${baseDomain}/${slug}`);
                }

                if (siteConfig.utm) {
                  if (siteConfig.utm.source) cardTargetUrlObj.searchParams.set('utm_source', siteConfig.utm.source);
                  if (siteConfig.utm.medium) cardTargetUrlObj.searchParams.set('utm_medium', (siteConfig.utm.medium || '').replace('{siteId}', siteId));
                  if (siteConfig.utm.campaign) cardTargetUrlObj.searchParams.set('utm_campaign', (siteConfig.utm.campaign || '').replace('{slug}', cardSlug));
                }
                cardEncoded = btoa(cardTargetUrlObj.toString());
              }

              const btnAttributes = isPinterestBot
                ? 'href="#recipe"'
                : `href="#recipe" class="btn-card btn-make-recipe" data-target="${cardEncoded}" data-slug="${cardSlug}"`;

              return `
              <article class="food-card">
                <div class="food-card-media">
                  <div class="recipe-number-badge">#${idx + 1}</div>
                  <img src="${cardImg}" alt="${cardTitle}" class="food-card-img" loading="lazy" />
                </div>
                <div class="food-card-body">
                  <div class="macro-badges">
                    <span class="macro-pill macro-protein">High Protein • 36g</span>
                    <span class="macro-pill macro-cals">420 kcal</span>
                    <span class="macro-pill macro-time">25 mins</span>
                  </div>
                  <h3 class="food-card-title">${cardTitle}</h3>
                  <p class="food-card-desc">${cardDesc}</p>
                  <div class="food-card-footer">
                    <a ${btnAttributes}>
                      <span>MAKE THIS RECIPE</span>
                      <span>&rarr;</span>
                    </a>
                  </div>
                </div>
              </article>
            `;
            })
            .join('')}
        </div>
      </section>
    `;
  }

  const primaryJumpTarget = isSingle ? '#recipe-ingredients' : '#recipes-list';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle} - ${safeSiteName}</title>
  <meta name="description" content="${safeDesc}" />

  <!-- Open Graph Meta Tags (Pinterest Product Pins & Social Media) -->
  <meta property="og:site_name" content="${safeSiteName}" />
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
    ${getSharedStyles()}

    .article-header { margin-bottom: 2rem; }
    .category-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.3rem 0.8rem;
      background: var(--primary-light);
      color: var(--primary);
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 1rem;
    }
    .article-title {
      font-family: var(--font-serif);
      font-size: clamp(2rem, 5vw, 3rem);
      font-weight: 800;
      line-height: 1.2;
      color: var(--text-heading);
      letter-spacing: -0.02em;
      margin-bottom: 1rem;
    }
    .article-lead {
      font-size: 1.15rem;
      line-height: 1.7;
      color: var(--text-body);
      margin-bottom: 1.5rem;
    }
    .eeat-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
      padding: 0.85rem 1.2rem;
      background: var(--surface);
      border: 1px solid var(--border-card);
      border-radius: 0.75rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
      margin-bottom: 2rem;
    }
    .author-info { display: flex; align-items: center; gap: 0.75rem; }
    .chef-avatar {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: #f1f5f9;
      border: 2px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }
    .author-text { font-size: 0.85rem; color: var(--text-muted); }
    .author-name { font-weight: 700; color: var(--text-heading); }
    .recipe-quick-metrics {
      display: flex;
      align-items: center;
      gap: 1rem;
      font-size: 0.825rem;
      font-weight: 600;
      color: var(--text-muted);
    }
    .metric-item { display: flex; align-items: center; gap: 0.25rem; }
    .hero-media {
      width: 100%;
      height: 440px;
      border-radius: 1rem;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
      margin-bottom: 2.25rem;
      border: 1px solid var(--border-card);
    }
    .hero-img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .product-box {
      background: var(--surface);
      border: 2px solid #fed7aa;
      border-radius: 1rem;
      padding: 1.75rem 2rem;
      margin-bottom: 3rem;
      box-shadow: 0 8px 30px rgba(234, 88, 12, 0.08);
    }
    .product-box-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }
    .product-tag {
      background: #ffedd5;
      color: #c2410c;
      font-size: 0.8rem;
      font-weight: 700;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .product-reviews {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.85rem;
      color: var(--text-muted);
      font-weight: 600;
    }
    .star-rating { color: #f59e0b; letter-spacing: 0.05em; }
    .product-body {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .product-title {
      font-family: var(--font-serif);
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-heading);
      margin-bottom: 0.35rem;
    }
    .product-desc { font-size: 0.95rem; color: var(--text-body); max-width: 540px; }
    .price-badge-wrap { text-align: right; }
    .price-value {
      font-size: 2.2rem;
      font-weight: 900;
      color: var(--text-heading);
      line-height: 1;
      display: flex;
      align-items: baseline;
      gap: 0.2rem;
      justify-content: flex-end;
    }
    .price-currency { font-size: 0.95rem; color: var(--text-muted); font-weight: 700; }
    .stock-pill {
      display: inline-block;
      margin-top: 0.35rem;
      background: var(--emerald-light);
      color: var(--emerald);
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
    }
    .product-cta-group {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      padding-top: 1.25rem;
      border-top: 1px solid var(--border-subtle);
    }
    @media (max-width: 600px) {
      .product-cta-group { grid-template-columns: 1fr; }
      .price-badge-wrap { text-align: left; }
      .price-value { justify-content: flex-start; }
    }
    .btn-pdf {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.85rem 1.25rem;
      background: #f8fafc;
      border: 1px solid var(--border-card);
      color: var(--text-heading);
      font-weight: 700;
      font-size: 0.95rem;
      border-radius: 0.6rem;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-pdf:hover { background: #f1f5f9; border-color: #cbd5e1; }
    .btn-jump {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.85rem 1.25rem;
      background: var(--primary);
      color: #fff;
      font-weight: 700;
      font-size: 0.95rem;
      border-radius: 0.6rem;
      text-decoration: none;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(234, 88, 12, 0.3);
      transition: all 0.2s ease;
      border: none;
    }
    .btn-jump:hover { background: var(--primary-hover); transform: translateY(-1px); }

    /* Single Recipe Ingredients Checklist */
    .ingredients-section {
      background: var(--surface);
      border: 1px solid var(--border-card);
      border-radius: 1rem;
      padding: 2.25rem 2rem;
      margin-top: 2.5rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
    }
    .ingredients-title {
      font-family: var(--font-serif);
      font-size: 1.8rem;
      font-weight: 800;
      color: var(--text-heading);
      margin-bottom: 0.5rem;
    }
    .ingredients-desc {
      font-size: 0.95rem;
      color: var(--text-muted);
      margin-bottom: 1.5rem;
    }
    .ingredients-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 0.75rem;
      margin-bottom: 2rem;
    }
    .ingredient-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      border-radius: 0.5rem;
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--text-heading);
    }
    .ingredient-check {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--emerald-light);
      color: var(--emerald);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 800;
      flex-shrink: 0;
    }
    .btn-wide-recipe {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      width: 100%;
      padding: 1.15rem 1.5rem;
      background: var(--primary);
      color: #fff;
      font-size: 1.1rem;
      font-weight: 800;
      border-radius: 0.75rem;
      text-decoration: none;
      cursor: pointer;
      box-shadow: 0 6px 20px rgba(234, 88, 12, 0.35);
      transition: all 0.2s ease;
      border: none;
    }
    .btn-wide-recipe:hover {
      background: var(--primary-hover);
      transform: translateY(-1px);
    }

    /* Roundup Recipe Cards */
    .roundup-section { margin-top: 3.5rem; }
    .section-badge {
      display: inline-block;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--primary);
      margin-bottom: 0.5rem;
    }
    .section-title {
      font-family: var(--font-serif);
      font-size: 2rem;
      font-weight: 800;
      color: var(--text-heading);
      margin-bottom: 0.5rem;
      letter-spacing: -0.01em;
    }
    .section-subtitle { font-size: 1rem; color: var(--text-body); margin-bottom: 2rem; max-width: 680px; }
    .cards-stack { display: flex; flex-direction: column; gap: 2rem; }
    .food-card {
      background: var(--surface);
      border: 1px solid var(--border-card);
      border-radius: 1rem;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
      display: grid;
      grid-template-columns: 320px 1fr;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .food-card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0, 0, 0, 0.07); }
    @media (max-width: 740px) { .food-card { grid-template-columns: 1fr; } }
    .food-card-media { position: relative; height: 100%; min-height: 240px; }
    .food-card-img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .recipe-number-badge {
      position: absolute;
      top: 1rem;
      left: 1rem;
      width: 38px;
      height: 38px;
      background: var(--primary);
      color: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.95rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    }
    .food-card-body { padding: 1.75rem 2rem; display: flex; flex-direction: column; justify-content: space-between; }
    .macro-badges { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.85rem; }
    .macro-pill { font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.65rem; border-radius: 9999px; }
    .macro-protein { background: #eff6ff; color: #1d4ed8; }
    .macro-cals { background: #fef2f2; color: #b91c1c; }
    .macro-time { background: #f0fdf4; color: #15803d; }
    .food-card-title {
      font-family: var(--font-serif);
      font-size: 1.45rem;
      font-weight: 800;
      color: var(--text-heading);
      margin-bottom: 0.5rem;
      line-height: 1.3;
    }
    .food-card-desc { font-size: 0.95rem; color: var(--text-body); margin-bottom: 1.5rem; line-height: 1.6; }
    .food-card-footer { margin-top: auto; padding-top: 1rem; border-top: 1px solid var(--border-subtle); }
    .btn-card {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.4rem;
      background: var(--primary);
      color: #fff;
      text-decoration: none;
      font-weight: 800;
      font-size: 0.85rem;
      letter-spacing: 0.04em;
      border-radius: 0.5rem;
      cursor: pointer;
    }
    .btn-card:hover { background: var(--primary-hover); }

    /* Modal */
    .modal-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 999;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .modal-card {
      background: #ffffff;
      border-radius: 1rem;
      max-width: 480px;
      width: 100%;
      padding: 2rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
      text-align: center;
    }
    .modal-badge {
      display: inline-block;
      background: #ffedd5;
      color: #c2410c;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 700;
      margin-bottom: 0.75rem;
    }
    .modal-title {
      font-family: var(--font-serif);
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--text-heading);
      margin-bottom: 0.75rem;
    }
    .modal-text { font-size: 0.95rem; color: var(--text-body); margin-bottom: 1.5rem; line-height: 1.6; }
    .modal-btn-group { display: flex; flex-direction: column; gap: 0.5rem; }
  </style>
</head>
<body>
  ${renderHeader(siteConfig)}

  <main id="recipe">
    <header class="article-header">
      <div class="category-tag">Editor's Recipe Pick</div>
      <h1 class="article-title">${safeTitle}</h1>
      <p class="article-lead">${safeDesc}</p>

      <div class="eeat-bar">
        <div class="author-info">
          <div class="chef-avatar">👨‍🍳</div>
          <div class="author-text">
            <div>By <span class="author-name">Culinary Kitchen Team</span> • Tested & Approved</div>
            <div style="font-size: 0.775rem; color: #94a3b8;">Updated September 2026</div>
          </div>
        </div>
        <div class="recipe-quick-metrics">
          <div class="metric-item">⏱️ Prep: 10 mins</div>
          <div class="metric-item">🔥 Cook: 4-6 hrs</div>
          <div class="metric-item">⭐ Skill: Easy</div>
          <div class="metric-item">🥗 440 kcal</div>
        </div>
      </div>
    </header>

    <div class="hero-media">
      <img src="${safeImage}" alt="${safeTitle}" class="hero-img" loading="eager" />
    </div>

    <!-- $2.25 Product Box (Per-Page Customized) -->
    <div class="product-box">
      <div class="product-box-header">
        <span class="product-tag">Digital Instant Download (Printable PDF)</span>
        <div class="product-reviews">
          <span class="star-rating">★★★★★</span>
          <span>4.9 / 5 (142 reviews)</span>
        </div>
      </div>

      <div class="product-body">
        <div>
          <h2 class="product-title">${safeProductTitle}</h2>
          <p class="product-desc">Get the complete high-resolution printable card, ingredient shopping checklist, substitution guide, and step-by-step cooking notes.</p>
        </div>
        <div class="price-badge-wrap">
          <div class="price-value">
            <span>$${safePrice}</span>
            <span class="price-currency">${safeCurrency}</span>
          </div>
          <span class="stock-pill">In Stock</span>
        </div>
      </div>

      <div class="product-cta-group">
        <button type="button" class="btn-pdf" id="btn-pdf-pack">
          <span>📄 Get Printable PDF ($${safePrice})</span>
        </button>
        <a href="${primaryJumpTarget}" class="btn-jump" id="cta-link">
          <span>Jump to Free Online Recipe ↓</span>
        </a>
      </div>
    </div>

    ${mainContentHtml}
  </main>

  ${renderFooter(siteConfig)}

  <div class="modal-overlay" id="pdf-modal">
    <div class="modal-card">
      <span class="modal-badge">Digital Edition</span>
      <h3 class="modal-title">Instant Printable PDF Pack</h3>
      <p class="modal-text">Our culinary team is currently refreshing the $${safePrice} downloadable PDF pack with the latest September 2026 bonus variations! You can access the full recipe online right now below.</p>
      <div class="modal-btn-group">
        <button type="button" class="btn-jump" id="modal-jump-btn">Jump to Full Recipe Online ↓</button>
        <button type="button" class="btn-pdf" id="close-pdf-modal">Close Window</button>
      </div>
    </div>
  </div>

  ${redirectScript}
</body>
</html>`;
}

/**
 * Generates the rich 40 Aprons Theme layout (2-Column Grid, WPRM Recipe Card, Warm Editorial).
 */
function render40ApronsThemeArticle({
  cards,
  postType,
  category,
  safeTitle,
  safeDesc,
  safeImage,
  safeUrl,
  safeSiteName,
  safePrice,
  safeCurrency,
  safeProductTitle,
  isSingle,
  productSchema,
  redirectScript,
  rawIngs,
  encodedTarget,
  isPinterestBot,
  siteConfig,
  siteId,
  slug,
  baseDomain,
  image,
  prepTime,
  cookTime,
  servings,
  calories,
  chefNotes,
  faqs,
}) {
  const jumpBtnAttributes = isPinterestBot
    ? 'href="#recipe"'
    : `href="#recipe" class="btn-jump-recipe btn-make-recipe" id="cta-link" data-target="${encodedTarget}" data-slug="${slug}"`;

  const btnWideAttributes = isPinterestBot
    ? 'href="#recipe"'
    : `href="#recipe" class="wprm-btn-cta btn-make-recipe" data-target="${encodedTarget}" data-slug="${slug}"`;

  const categoryName = category ? formatTitleFromSlug(category) : 'Recipes';

  const prepDisplay = prepTime && prepTime.trim() ? prepTime.trim() : '15 mins';
  const cookDisplay = cookTime && cookTime.trim() ? cookTime.trim() : '25 mins';
  const servingsDisplay = servings && servings.trim() ? servings.trim() : '4 servings';

  let totalDisplay = '40 mins';
  const prepNum = parseInt(prepDisplay, 10);
  const cookNum = parseInt(cookDisplay, 10);
  if (!isNaN(prepNum) && !isNaN(cookNum)) {
    totalDisplay = `${prepNum + cookNum} mins`;
  }

  // Dynamic Chef's Notes Box (omitted if empty)
  let chefNotesHtml = '';
  if (chefNotes && chefNotes.trim()) {
    const noteLines = chefNotes.split('\n').map((l) => l.trim()).filter(Boolean);
    if (noteLines.length > 0) {
      const itemsHtml = noteLines.map((line) => {
        const colonIdx = line.indexOf(':');
        if (colonIdx > 0 && colonIdx < 35) {
          const heading = escapeHtml(line.slice(0, colonIdx).trim());
          const text = escapeHtml(line.slice(colonIdx + 1).trim());
          return `<li><strong>${heading}:</strong> ${text}</li>`;
        }
        return `<li>${escapeHtml(line.replace(/^[-*•]\s*/, ''))}</li>`;
      }).join('');

      chefNotesHtml = `
      <!-- Chef's Ingredient Tips Box -->
      <div class="fa-tips-box">
        <div class="fa-tips-header">
          <span class="fa-tips-icon">✨</span>
          <h3 class="fa-tips-title">Chef's Secret Ingredient Notes & Substitutions</h3>
        </div>
        <ul class="fa-tips-list">
          ${itemsHtml}
        </ul>
      </div>`;
    }
  }

  // Dynamic FAQ Accordion (omitted if empty)
  let faqsHtml = '';
  if (Array.isArray(faqs) && faqs.length > 0) {
    const validFaqs = faqs.filter((f) => f && (f.question || f.q) && (f.answer || f.a));
    if (validFaqs.length > 0) {
      const itemsHtml = validFaqs.map((f, i) => {
        const q = escapeHtml(f.question || f.q || '');
        const a = escapeHtml(f.answer || f.a || '');
        const openAttr = i === 0 ? ' open' : '';
        return `
          <details class="fa-faq-item"${openAttr}>
            <summary class="fa-faq-question">${q}</summary>
            <div class="fa-faq-answer">${a}</div>
          </details>`;
      }).join('');

      faqsHtml = `
      <!-- Cooking FAQ Accordion -->
      <div class="fa-faq-section">
        <h3 class="fa-faq-heading">Frequently Asked Questions</h3>
        <div class="fa-faq-stack">
          ${itemsHtml}
        </div>
      </div>`;
    }
  }

  // Dynamic Smart Ingredients parsing (# for subheaders, checkboxes for ingredients)
  let ingItemIndex = 0;
  const renderedIngredientsHtml = rawIngs
    .map((ing, idx) => {
      if (ing.startsWith('#')) {
        const subhead = escapeHtml(ing.replace(/^#+\s*/, '').trim());
        if (idx === 0 && (subhead.toLowerCase() === 'ingredients' || subhead.toLowerCase() === 'ingredients checklist')) {
          return '';
        }
        return `<li class="wprm-section-subhead"><h4>${subhead}</h4></li>`;
      }
      ingItemIndex++;
      return `
      <li class="wprm-item">
        <label class="wprm-checkbox-label">
          <input type="checkbox" class="wprm-checkbox" id="ing-${ingItemIndex}" />
          <span class="wprm-text">${escapeHtml(ing)}</span>
        </label>
      </li>`;
    })
    .filter(Boolean)
    .join('');

  // Roundup stack if postType is roundup
  let roundupCardsHtml = '';
  if (!isSingle && Array.isArray(cards) && cards.length > 0) {
    roundupCardsHtml = `
      <div style="margin: 2.5rem 0;">
        <h3 style="font-family: var(--font-serif); font-size: 1.6rem; font-weight: 700; color: var(--fa-heading); margin-bottom: 1.25rem;">Complete Recipe Variations</h3>
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          ${cards.map((c, idx) => {
            const cardTitle = escapeHtml(c.title || `Recipe #${idx + 1}`);
            const cardDesc = escapeHtml(c.description || 'Rich flavor and kitchen-tested simplicity.');
            const cardImg = escapeHtml(c.image || image);
            const cardSlug = escapeHtml(c.slug || `${slug}-recipe-${idx + 1}`);

            let cardEncoded = encodedTarget;
            if (!isPinterestBot) {
              let rawTarget = (c.targetUrl || c.targetPath || '').trim();
              let cardTargetUrlObj;
              try {
                if (rawTarget.startsWith('http://') || rawTarget.startsWith('https://')) {
                  cardTargetUrlObj = new URL(rawTarget);
                } else {
                  const cleanPath = rawTarget ? (rawTarget.startsWith('/') ? rawTarget : `/${rawTarget}`) : `/${slug}`;
                  cardTargetUrlObj = new URL(`${baseDomain}${cleanPath}`);
                }
              } catch {
                cardTargetUrlObj = new URL(`${baseDomain}/${slug}`);
              }

              if (siteConfig.utm) {
                if (siteConfig.utm.source) cardTargetUrlObj.searchParams.set('utm_source', siteConfig.utm.source);
                if (siteConfig.utm.medium) cardTargetUrlObj.searchParams.set('utm_medium', (siteConfig.utm.medium || '').replace('{siteId}', siteId));
                if (siteConfig.utm.campaign) cardTargetUrlObj.searchParams.set('utm_campaign', (siteConfig.utm.campaign || '').replace('{slug}', cardSlug));
              }
              cardEncoded = btoa(cardTargetUrlObj.toString());
            }

            const cardBtnAttrs = isPinterestBot
              ? 'href="#recipe"'
              : `href="#recipe" class="wprm-btn-cta btn-make-recipe" data-target="${cardEncoded}" data-slug="${cardSlug}"`;

            return `
              <div style="background: #ffffff; border: 1px solid var(--fa-border); border-radius: 12px; overflow: hidden; display: grid; grid-template-columns: 220px 1fr; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
                <img src="${cardImg}" alt="${cardTitle}" style="width: 100%; height: 100%; min-height: 180px; object-fit: cover;" loading="lazy" />
                <div style="padding: 1.25rem 1.5rem; display: flex; flex-direction: column; justify-content: space-between;">
                  <div>
                    <span style="font-size: 0.75rem; font-weight: 800; color: var(--fa-primary); text-transform: uppercase;">RECIPE #${idx + 1}</span>
                    <h4 style="font-family: var(--font-serif); font-size: 1.25rem; font-weight: 700; color: var(--fa-heading); margin: 0.25rem 0 0.5rem;">${cardTitle}</h4>
                    <p style="font-size: 0.9rem; color: #4b5563; line-height: 1.6; margin: 0 0 1rem;">${cardDesc}</p>
                  </div>
                  <div>
                    <a ${cardBtnAttrs} style="display: inline-flex; align-items: center; justify-content: center; padding: 0.65rem 1.25rem; font-size: 0.9rem; font-weight: 700; border-radius: 8px; text-decoration: none;">
                      <span>MAKE THIS RECIPE &rarr;</span>
                    </a>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle} - ${safeSiteName}</title>
  <meta name="description" content="${safeDesc}" />

  <!-- Open Graph Meta Tags (Pinterest Product Pins & Social Media) -->
  <meta property="og:site_name" content="${safeSiteName}" />
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
    ${get40ApronsStyles()}
  </style>
</head>
<body>
  ${renderHeader(siteConfig)}

  <!-- Hero Bar -->
  <div class="fa-hero-wrapper">
    <nav class="fa-breadcrumbs" aria-label="Breadcrumbs">
      <a href="/">Home</a>
      <span>/</span>
      <a href="/category/${escapeHtml((category || 'recipes').toLowerCase())}">${escapeHtml(categoryName)}</a>
      <span>/</span>
      <span class="active">${safeTitle}</span>
    </nav>

    <h1 class="fa-title">${safeTitle}</h1>

    <div class="fa-rating-bar">
      <div class="fa-stars">★★★★★</div>
      <span class="fa-rating-score">5.0</span>
      <span class="fa-rating-count">(378 ratings & reviews)</span>
    </div>

    <div class="fa-meta-bar">
      <span class="fa-meta-item">Recipe by <strong>Cheryl Malik</strong></span>
      <span class="fa-meta-sep">•</span>
      <span class="fa-meta-item">Updated: <strong>September 2026</strong></span>
      <span class="fa-meta-sep">•</span>
      <span class="fa-meta-item">💬 <strong>24 Comments</strong></span>
    </div>

    <div class="fa-action-bar">
      <a ${jumpBtnAttributes}>
        <span>↓ JUMP TO RECIPE</span>
      </a>

      <div class="fa-icon-actions">
        <button type="button" class="btn-icon-action" onclick="window.print()">
          <span>🖨️</span> <span>Print</span>
        </button>
        <button type="button" class="btn-icon-action" ${isPinterestBot ? '' : 'onclick="window.location.hash=\'recipe\'"'}>
          <span>📌</span> <span>Pin</span>
        </button>
        <button type="button" class="btn-icon-action" id="btn-save-recipe">
          <span>🔖</span> <span>Save</span>
        </button>
      </div>
    </div>
  </div>

  <!-- 2-Column Grid -->
  <div class="fa-container">
    <main class="fa-main-content">
      <div class="fa-hero-media">
        <img src="${safeImage}" alt="${safeTitle}" class="fa-hero-img" />
        <div class="fa-media-caption">Tender, deeply flavorful, and kitchen-tested for foolproof home cooking.</div>
      </div>

      <div class="fa-lead-content">
        <p class="fa-lead-p">${safeDesc}</p>
        <p class="fa-story-p">This dish has quickly become one of our most requested family recipes. Between the silky textures, balanced seasonings, and wholesome pantry ingredients, it delivers gourmet dining satisfaction in minimal kitchen time. Whether prepping for a weeknight dinner or entertaining guests, this foolproof guide guarantees rave reviews.</p>
      </div>

      ${chefNotesHtml}

      ${faqsHtml}

      <!-- WPRM Recipe Card -->
      <div class="wprm-recipe-card" id="recipe">
        <div class="wprm-badge">KITCHEN TESTED & APPROVED</div>
        <h2 class="wprm-title">${safeTitle}</h2>
        <div class="wprm-stars-line">
          <span class="wprm-stars">★★★★★</span>
          <span class="wprm-rating-text">5.0 from 378 votes</span>
        </div>
        <p class="wprm-summary">${safeDesc}</p>

        <div class="wprm-times-grid">
          <div class="wprm-time-block">
            <span class="wprm-time-label">PREP TIME</span>
            <span class="wprm-time-val">${escapeHtml(prepDisplay)}</span>
          </div>
          <div class="wprm-time-block">
            <span class="wprm-time-label">COOK TIME</span>
            <span class="wprm-time-val">${escapeHtml(cookDisplay)}</span>
          </div>
          <div class="wprm-time-block">
            <span class="wprm-time-label">TOTAL TIME</span>
            <span class="wprm-time-val">${escapeHtml(totalDisplay)}</span>
          </div>
          <div class="wprm-time-block">
            <span class="wprm-time-label">SERVINGS</span>
            <span class="wprm-time-val">${escapeHtml(servingsDisplay)}</span>
          </div>
        </div>

        <!-- Digital Product Box inside WPRM -->
        <div class="fa-product-box">
          <div class="fa-prod-badge">DIGITAL CHEF'S PACK</div>
          <div class="fa-prod-info">
            <div class="fa-prod-name">${safeProductTitle}</div>
            <div class="fa-prod-desc">Includes laminated printable card, prep checklists, and nutritional macro breakdown.</div>
          </div>
          <div class="fa-prod-price-tag">$${safePrice}</div>
          <button type="button" class="btn-fa-preview" id="btn-pdf-pack">Instant PDF Download</button>
        </div>

        <!-- Ingredients Checklist with Checkboxes -->
        <div class="wprm-ingredients-section">
          <h3 class="wprm-section-title">Ingredients</h3>
          <ul class="wprm-checklist">
            ${renderedIngredientsHtml}
          </ul>
        </div>

        <!-- WPRM Full-Width CTA Button -->
        <div style="margin-top: 1.75rem;">
          <a ${btnWideAttributes}>
            <span>Get Recipe Ingredients / Jump to Recipe &rarr;</span>
          </a>
        </div>
      </div>

      ${roundupCardsHtml}
    </main>

    <!-- Sidebar -->
    <aside class="fa-sidebar">
      <!-- Meet Cheryl Author Card -->
      <div class="fa-widget fa-author-widget">
        <div class="fa-author-avatar-wrap">
          <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80" alt="Cheryl Malik" class="fa-author-avatar" />
        </div>
        <h4 class="fa-author-name">Meet Cheryl</h4>
        <p class="fa-author-bio">Hi, I'm Cheryl! Founder, recipe developer, and culinary obsessive. I create foolproof, flavor-packed recipes for busy home cooks who crave vibrant, wholesome meals without the fuss.</p>
        <a href="/about-us" class="fa-author-btn">MEET MY TEAM &rarr;</a>
      </div>

      <!-- Search Widget -->
      <div class="fa-widget">
        <h4 class="fa-widget-title">Search Recipes</h4>
        <form class="fa-search-form" onsubmit="return false;">
          <input type="text" class="fa-search-input" placeholder="Search delicious recipes..." />
          <button type="submit" class="fa-search-btn" ${isPinterestBot ? '' : 'onclick="window.location.hash=\'recipe\'"'}>SEARCH</button>
        </form>
      </div>

      <!-- Trending Now -->
      <div class="fa-widget">
        <h4 class="fa-widget-title">Trending Now</h4>
        <div class="fa-mini-cards">
          <div class="fa-mini-card">
            <img src="https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=160&q=80" alt="Creamy Tuscan Garlic Chicken" class="fa-mini-thumb" />
            <div>
              <span class="fa-mini-tag">DINNER</span>
              <h5 class="fa-mini-title"><a href="/#recipe" class="fa-mini-link">Creamy Tuscan Garlic Chicken</a></h5>
            </div>
          </div>
          <div class="fa-mini-card">
            <img src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=160&q=80" alt="Slow Cooker Beef Stew" class="fa-mini-thumb" />
            <div>
              <span class="fa-mini-tag">SLOW COOKER</span>
              <h5 class="fa-mini-title"><a href="/#recipe" class="fa-mini-link">Slow Cooker Rich Beef Stew</a></h5>
            </div>
          </div>
          <div class="fa-mini-card">
            <img src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=160&q=80" alt="Broccoli Bacon Salad" class="fa-mini-thumb" />
            <div>
              <span class="fa-mini-tag">QUICK SIDE</span>
              <h5 class="fa-mini-title"><a href="/#recipe" class="fa-mini-link">Crispy Broccoli Bacon Salad</a></h5>
            </div>
          </div>
        </div>
      </div>

      <!-- Seasonal Favorites -->
      <div class="fa-widget">
        <h4 class="fa-widget-title">Seasonal Favorites</h4>
        <div class="fa-mini-cards">
          <div class="fa-mini-card">
            <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=160&q=80" alt="Harvest Kale & Quinoa Bowl" class="fa-mini-thumb" />
            <div>
              <span class="fa-mini-tag">HEALTHY</span>
              <h5 class="fa-mini-title"><a href="/#recipe" class="fa-mini-link">Harvest Roasted Veggie Bowl</a></h5>
            </div>
          </div>
          <div class="fa-mini-card">
            <img src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=160&q=80" alt="Creamy Pumpkin Soup" class="fa-mini-thumb" />
            <div>
              <span class="fa-mini-tag">FALL SPECIAL</span>
              <h5 class="fa-mini-title"><a href="/#recipe" class="fa-mini-link">Silky Roasted Pumpkin Soup</a></h5>
            </div>
          </div>
        </div>
      </div>
    </aside>
  </div>

  ${renderFooter(siteConfig)}

  <div class="modal-overlay" id="pdf-modal">
    <div class="modal-card">
      <span class="modal-badge">Digital Edition</span>
      <h3 class="modal-title">Instant Printable PDF Pack</h3>
      <p class="modal-text">Our culinary team is currently refreshing the $${safePrice} downloadable PDF pack with the latest September 2026 bonus variations! You can access the full recipe online right now below.</p>
      <div class="modal-btn-group">
        <button type="button" class="btn-modal-primary" id="modal-jump-btn">Jump to Full Recipe Online ↓</button>
        <button type="button" class="btn-modal-sec" id="close-pdf-modal">Close Window</button>
      </div>
    </div>
  </div>

  ${redirectScript}
</body>
</html>`;
}

/**
 * Returns default legal static pages content if not configured in KV.
 */
function getDefaultPageContent(slug, siteName) {
  switch (slug) {
    case 'privacy-policy':
      return {
        title: 'Privacy Policy',
        content: `
          <p>Last updated: September 2026. This Privacy Policy outlines how <strong>${escapeHtml(siteName)}</strong> collects, utilizes, and safeguards your information when you visit our culinary website.</p>
          <h2>Information Collection</h2>
          <p>We may collect non-personal analytics data such as browser type, referring pages, and device information to optimize recipe reading experiences and recipe loading speeds.</p>
          <h2>Cookies and Tracking</h2>
          <p>We use essential cookies and web analytics to understand reader preferences and improve culinary content quality. You may configure your browser to decline cookies at any time.</p>
          <h2>Third-Party Links</h2>
          <p>Our website may contain links to external culinary and ingredient sources. We are not responsible for the privacy practices or content of third-party platforms.</p>
        `,
      };
    case 'terms-of-service':
    case 'terms':
      return {
        title: 'Terms of Service',
        content: `
          <p>Welcome to <strong>${escapeHtml(siteName)}</strong>. By accessing our website, recipe collections, and digital guides, you agree to comply with and be bound by these Terms of Service.</p>
          <h2>Use License</h2>
          <p>Permission is granted to view and print recipe materials for personal, non-commercial home cooking use only. Reproduction or redistribution without prior written consent is strictly prohibited.</p>
          <h2>Recipe Accuracy & Nutritional Guidance</h2>
          <p>While all recipes are developed and tested by our culinary team, actual results and nutritional macros may vary depending on individual ingredients, equipment, and preparation methods.</p>
        `,
      };
    case 'about-us':
    case 'about':
      return {
        title: 'About Our Culinary Kitchen',
        content: `
          <p>Welcome to <strong>${escapeHtml(siteName)}</strong>! We are an independent group of home cooks, recipe developers, and food lovers dedicated to bringing dependable, flavorful meals to every family table.</p>
          <h2>Our Philosophy</h2>
          <p>We believe great food does not have to be intimidating. Every recipe we publish is tested thoroughly in everyday home kitchens to ensure accessible ingredients, accurate timings, and mouthwatering results.</p>
          <h2>E-E-A-T Commitment</h2>
          <p>Our team continuously reviews and updates culinary guides to maintain high editorial standards, seasonal freshness, and genuine cooking enthusiasm.</p>
        `,
      };
    case 'contact':
      return {
        title: 'Contact Us',
        content: `
          <p>We would love to hear from you! Whether you have questions regarding a recipe, kitchen feedback, or editorial inquiries, please feel free to reach out.</p>
          <h2>Culinary Inquiries</h2>
          <p>Email our kitchen team at: <strong>contact@recipebridge.local</strong></p>
          <p>We strive to reply to reader recipe queries within 24 to 48 business hours.</p>
        `,
      };
    case 'disclosure':
      return {
        title: 'Affiliate & Recipe Disclosure',
        content: `
          <p>In accordance with FTC guidelines, please assume that some links on <strong>${escapeHtml(siteName)}</strong> may be affiliate links. If you purchase items through these links, we may earn a small commission at no additional cost to you.</p>
          <p>We only recommend kitchen equipment, pantry staples, and culinary tools that our team genuinely uses, tests, and believes add value to your cooking.</p>
        `,
      };
    default:
      return null;
  }
}

/**
 * Cloudflare Pages Catch-All onRequest handler.
 */
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // 1. Exclude static assets and admin APIs
  if (
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/public/admin') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/data/')
  ) {
    return context.next();
  }

  // 2. Resolve siteId (from env SITE_ID or hostname or default to 'site1')
  const siteId = (context.env?.SITE_ID || 'site1').trim().toLowerCase();
  const kv = context.env?.RECIPE_KV;

  // 3. Fetch site config from RECIPE_KV or fallback to local config.json
  let siteConfig = defaultConfig;
  if (kv) {
    try {
      const kvConfig = await kv.get(`config:${siteId}`, 'json');
      if (kvConfig && typeof kvConfig === 'object') {
        siteConfig = kvConfig;
      }
    } catch {
      // fallback
    }
  }

  const baseDomain = (siteConfig.targetDomain || 'https://schnellrezept.com').replace(/\/+$/, '');

  // 4. ROUTE: HOMEPAGE (/) -> Rich Content Homepage (Natural browsing, NO redirect)
  if (pathname === '/' || pathname === '' || pathname === '/index.html') {
    let categories = defaultCategories;
    let roundups = [];

    if (kv) {
      try {
        const storedCats = await kv.get(`categories:${siteId}`, 'json');
        if (Array.isArray(storedCats) && storedCats.length > 0) {
          categories = storedCats;
        }

        const listed = await kv.list({ prefix: `roundups:${siteId}:`, limit: 12 });
        for (const key of listed.keys || []) {
          const item = await kv.get(key.name, 'json');
          if (item) roundups.push(item);
        }
      } catch {
        // fallback
      }
    }

    const homeHtml = renderHomepage({ siteConfig, categories, roundups });
    return new Response(homeHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=600',
      },
    });
  }

  // 5. ROUTE: CATEGORY ARCHIVE (/category/:slug) -> (Natural browsing, NO redirect)
  if (pathname.startsWith('/category/')) {
    const catSlug = pathname.replace(/^\/category\//, '').split('/')[0].toLowerCase();
    let categories = defaultCategories;
    let matchedCategory = null;
    let roundups = [];

    if (kv) {
      try {
        const storedCats = await kv.get(`categories:${siteId}`, 'json');
        if (Array.isArray(storedCats) && storedCats.length > 0) {
          categories = storedCats;
        }
      } catch {
        // ignore
      }
    }

    matchedCategory = categories.find((c) => c.slug === catSlug);
    if (!matchedCategory) {
      matchedCategory = {
        name: formatTitleFromSlug(catSlug),
        slug: catSlug,
        description: `Explore our collection of ${formatTitleFromSlug(catSlug)} recipes and guides.`,
      };
    }

    if (kv) {
      try {
        const listed = await kv.list({ prefix: `roundups:${siteId}:` });
        for (const key of listed.keys || []) {
          const item = await kv.get(key.name, 'json');
          if (item && (item.category === catSlug || !item.category)) {
            roundups.push(item);
          }
        }
      } catch {
        // ignore
      }
    }

    const archiveHtml = renderCategoryArchive({ siteConfig, category: matchedCategory, roundups });
    return new Response(archiveHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=600',
      },
    });
  }

  // 6. ROUTE: STATIC PAGES (/privacy-policy, /terms, /about-us, /contact, etc.) -> (Natural browsing, NO redirect)
  const cleanSlug = pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  let staticPage = null;

  if (kv) {
    try {
      staticPage = await kv.get(`pages:${siteId}:${cleanSlug}`, 'json');
    } catch {
      // ignore
    }
  }

  if (!staticPage) {
    staticPage = getDefaultPageContent(cleanSlug, siteConfig.siteName || 'Recipe Bridge');
  }

  if (staticPage) {
    const pageHtml = renderStaticPage({
      siteConfig,
      title: staticPage.title,
      content: staticPage.content,
    });
    return new Response(pageHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  // 7. ROUTE: RECIPE / ROUNDUP LANDING PAGE (Targeted monetization page)
  const segments = pathname.split('/').filter(Boolean);
  const slug = segments[segments.length - 1] || 'recipe';

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
          postType: roundup.postType || (Array.isArray(roundup.cards) && roundup.cards.length > 0 ? 'roundup' : 'single'),
          customPrice: roundup.customPrice || '',
          customProductTitle: roundup.customProductTitle || '',
          prepTime: roundup.prepTime || '',
          cookTime: roundup.cookTime || '',
          servings: roundup.servings || '',
          calories: roundup.calories || '',
          ingredients: roundup.ingredients || '',
          chefNotes: roundup.chefNotes || '',
          faqs: Array.isArray(roundup.faqs) ? roundup.faqs : [],
          category: roundup.category || '',
        };
      }
    } catch {
      // fallback
    }
  }

  if (!recipe) {
    recipe = resolveRecipe(slug);
  }

  const userAgent = (context.request.headers.get('user-agent') || '').toLowerCase();
  const isPinterestBot = userAgent.includes('pinterestbot') || userAgent.includes('pinterest');

  let encodedTarget = '';
  if (!isPinterestBot) {
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

  const html = renderRecipeArticle({
    title: recipe.title,
    description: recipe.description,
    image: recipe.image,
    cards: recipe.cards || [],
    postType: recipe.postType || 'single',
    customPrice: recipe.customPrice || '',
    customProductTitle: recipe.customProductTitle || '',
    prepTime: recipe.prepTime || '',
    cookTime: recipe.cookTime || '',
    servings: recipe.servings || '',
    calories: recipe.calories || '',
    ingredients: recipe.ingredients || '',
    chefNotes: recipe.chefNotes || '',
    faqs: recipe.faqs || [],
    category: recipe.category || '',
    pageUrl: context.request.url,
    encodedTarget,
    isPinterestBot,
    siteConfig,
    siteId,
    slug,
    baseDomain,
  });

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': isPinterestBot ? 'public, max-age=3600' : 'no-store, no-cache, must-revalidate',
    },
  });
}
