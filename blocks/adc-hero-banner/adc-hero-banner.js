function getCurrentPagePath() {
  const { pathname } = window.location;
  if (!pathname || pathname === '/') {
    return '';
  }

  return pathname
    .replace(/\.html$/i, '')
    .replace(/\/$/, '');
}

function toContractUrl(resourcePath) {
  if (!resourcePath) {
    return '';
  }

  const trimmed = resourcePath.trim();
  if (!trimmed) {
    return '';
  }

  if (/\.eds-v\d+\.json$/i.test(trimmed) || /\.model\.json$/i.test(trimmed)) {
    return trimmed;
  }

  return `${trimmed}.eds-v1.json`;
}

function resolveCandidateSources(block) {
  const fallback = '/blocks/adc-hero-banner/contract.v1.json';

  const configuredSource = block.dataset.source || block.getAttribute('data-source');
  const configuredComponentPath = block.dataset.componentPath || block.dataset.resourcePath;
  const componentNode = block.dataset.componentNode || 'herobanner';
  const componentRoot = block.dataset.componentRoot || 'jcr:content/root';

  const currentPagePath = getCurrentPagePath();
  const derivedComponentPath = currentPagePath
    ? `${currentPagePath}/${componentRoot}/${componentNode}`.replace(/\/+/g, '/')
    : '';

  const legacyLink = block.querySelector('a[href]')?.getAttribute('href') || '';

  const candidates = [
    configuredSource,
    toContractUrl(configuredComponentPath),
    toContractUrl(derivedComponentPath),
    legacyLink,
    fallback,
  ]
    .filter(Boolean)
    .map((value) => value.trim())
    .filter(Boolean);

  return [...new Set(candidates)];
}

function renderButtons(buttons) {
  if (!Array.isArray(buttons) || buttons.length === 0) return '';

  const items = buttons
    .filter((button) => button && button.label && button.href)
    .map((button) => {
      const target = button.newTab ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a class="button" href="${button.href}"${target}>${button.label}</a>`;
    })
    .join('');

  return `<div class="adc-hero-banner-actions">${items}</div>`;
}

function resolveAssetUrl(url, source) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;

  if (source && /^https?:\/\//i.test(source) && url.startsWith('/')) {
    try {
      return `${new URL(source).origin}${url}`;
    } catch {
      return url;
    }
  }

  if (window.EDS_AEM_ORIGIN && url.startsWith('/')) {
    return `${window.EDS_AEM_ORIGIN}${url}`;
  }

  return url;
}

async function fetchContractJson(source, componentName) {
  const response = await fetch(source, { credentials: 'include' });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${componentName} data: ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    const body = await response.text();
    const hint = body && body.includes('<')
      ? 'Non-JSON response (likely login page/CORS/404).'
      : 'Non-JSON response.';
    throw new Error(`${hint} URL: ${source}`);
  }

  return response.json();
}

async function fetchFirstAvailableContract(candidates, componentName) {
  const tryAt = async (index, lastError) => {
    if (index >= candidates.length) {
      throw lastError || new Error(`No valid ${componentName} source candidates found.`);
    }

    const source = candidates[index];
    try {
      // Use the first endpoint that responds with JSON successfully.
      const payload = await fetchContractJson(source, componentName);
      return { payload, source };
    } catch (error) {
      return tryAt(index + 1, error);
    }
  };

  return tryAt(0);
}

function renderHero(data, source) {
  const image = data.image || {};
  const content = data.content || {};
  const desktopSrc = resolveAssetUrl(image.desktopSrc || '', source);
  const tabletSrc = resolveAssetUrl(image.tabletSrc || '', source);
  const mobileSrc = resolveAssetUrl(image.mobileSrc || '', source);

  return `
    <div class="adc-hero-banner-media">
      <picture>
        ${mobileSrc ? `<source media="(max-width: 767px)" srcset="${mobileSrc}">` : ''}
        ${tabletSrc ? `<source media="(max-width: 1024px)" srcset="${tabletSrc}">` : ''}
        <img src="${desktopSrc}" alt="${image.alt || ''}" loading="lazy">
      </picture>
    </div>
    <div class="adc-hero-banner-content">
      ${content.eyebrow ? `<p class="adc-hero-banner-eyebrow">${content.eyebrow}</p>` : ''}
      ${content.title ? `<h2>${content.title}</h2>` : ''}
      ${content.description ? `<p>${content.description}</p>` : ''}
      ${renderButtons(content.buttons)}
    </div>
  `;
}

function renderInlineHero(block) {
  // If already rendered once, keep existing direct markup stable on re-decoration.
  if (block.querySelector('.adc-hero-banner-media') && block.querySelector('.adc-hero-banner-content')) {
    return true;
  }

  const rows = [...block.children];
  if (rows.length < 2) {
    return false;
  }

  const media = rows[0].cloneNode(true);
  const content = rows[1].cloneNode(true);
  const actionLinks = [...content.querySelectorAll('a[href]')];
  actionLinks.forEach((link) => link.remove());

  const actions = actionLinks
    .map((link) => {
      const href = link.getAttribute('href') || '';
      if (!href) return '';
      const label = (link.textContent || '').trim() || 'Learn more';
      const target = (link.getAttribute('target') || '').toLowerCase() === '_blank';
      return `<a class="button" href="${href}"${target ? ' target="_blank" rel="noopener noreferrer"' : ''}>${label}</a>`;
    })
    .filter(Boolean)
    .join('');

  block.innerHTML = `
    <div class="adc-hero-banner-media">${media.innerHTML}</div>
    <div class="adc-hero-banner-content">
      ${content.innerHTML}
      ${actions ? `<div class="adc-hero-banner-actions">${actions}</div>` : ''}
    </div>
  `;

  return true;
}

export default async function decorate(block) {
  const mode = (block.dataset.mode || '').toLowerCase();
  if (mode === 'direct') {
    const rendered = renderInlineHero(block);
    if (!rendered) {
      block.innerHTML = '<p>Hero banner direct content is not authored.</p>';
    }
    return;
  }

  const sources = resolveCandidateSources(block);
  if (sources.length === 0) {
    block.innerHTML = '<p>Hero banner source is not configured.</p>';
    return;
  }

  try {
    const { payload, source } = await fetchFirstAvailableContract(sources, 'hero banner');
    block.innerHTML = renderHero(payload, source);
  } catch (error) {
    // Keep failure visible in-authoring and preview during early POC phase.
    block.innerHTML = `<p>${error.message}</p>`;
  }
}
