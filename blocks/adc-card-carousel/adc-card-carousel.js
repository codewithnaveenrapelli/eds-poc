function getSourceUrl(block) {
  const fallback = '/blocks/adc-card-carousel/contract.v1.json';
  const configured = block.dataset.source || block.getAttribute('data-source');
  if (configured) return configured;

  const link = block.querySelector('a[href]');
  return link ? link.href : fallback;
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

function stripHtml(input) {
  const tmp = document.createElement('div');
  tmp.innerHTML = input || '';
  return (tmp.textContent || '').trim();
}

function normalizeCarouselPayload(payload) {
  if (Array.isArray(payload.items)) {
    return {
      cardsPerScreen: Number(payload.cardsPerScreen || 1),
      items: payload.items,
    };
  }

  const itemsOrder = Array.isArray(payload[':itemsOrder']) ? payload[':itemsOrder'] : [];
  const itemsMap = payload[':items'] || {};

  const items = itemsOrder
    .map((key) => itemsMap[key])
    .filter(Boolean)
    .map((item) => ({
      title: stripHtml(item['jcr:title'] || item['cq:panelTitle'] || ''),
      description: stripHtml(item['jcr:description'] || ''),
      image: null,
      link: null,
    }));

  return {
    cardsPerScreen: Number(payload.cardsPerScreen || 1),
    items,
  };
}

function renderSlide(item, source) {
  if (!item) return '';
  const imageSrc = item.image ? resolveAssetUrl(item.image.src || '', source) : '';

  return `
    <li class="adc-card-carousel-slide">
      ${imageSrc ? `<img src="${imageSrc}" alt="${item.image.alt || ''}" loading="lazy">` : ''}
      ${item.title ? `<h3>${item.title}</h3>` : ''}
      ${item.description ? `<p>${item.description}</p>` : ''}
      ${item.link && item.link.href ? `<a class="button" href="${item.link.href}">${item.link.label || 'Learn more'}</a>` : ''}
    </li>
  `;
}

export default async function decorate(block) {
  const source = getSourceUrl(block);
  if (!source) {
    block.innerHTML = '<p>Card carousel source is not configured.</p>';
    return;
  }

  try {
    const payload = await fetchContractJson(source, 'card carousel');
    const normalized = normalizeCarouselPayload(payload);
    const { cardsPerScreen, items } = normalized;

    block.innerHTML = `<ul class="adc-card-carousel-track" style="--cards-per-screen:${cardsPerScreen}">${items.map((item) => renderSlide(item, source)).join('')}</ul>`;
  } catch (error) {
    block.innerHTML = `<p>${error.message}</p>`;
  }
}
