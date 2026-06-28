function getSourceUrl(block) {
  const configured = block.dataset.source || block.getAttribute('data-source');
  return configured ? configured.trim() : '';
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

function renderCard(card, source) {
  if (!card) return '';

  const image = card.image || {};
  const logo = card.logo || {};
  const imageSrc = resolveAssetUrl(image.src || '', source);
  const logoSrc = resolveAssetUrl(logo.src || '', source);
  const tag = card.tag ? `<p class="adc-cards-tag">${card.tag}</p>` : '';
  const title = card.title ? `<h3>${card.title}</h3>` : '';
  const description = card.description ? `<p>${card.description}</p>` : '';
  const cta = card.link && card.link.href
    ? `<a class="button" href="${card.link.href}"${card.link.newTab ? ' target="_blank" rel="noopener noreferrer"' : ''}>${card.link.label || 'Learn more'}</a>`
    : '';

  return `
    <li class="adc-cards-item">
      ${imageSrc ? `<img src="${imageSrc}" alt="${image.alt || ''}" loading="lazy">` : ''}
      <div class="adc-cards-body">
        ${logoSrc ? `<img class="adc-cards-logo" src="${logoSrc}" alt="${logo.alt || ''}" loading="lazy">` : ''}
        ${tag}
        ${title}
        ${description}
        ${cta}
      </div>
    </li>
  `;
}

function textFromCell(cell) {
  return (cell?.textContent || '').trim();
}

function cardFromInlineRow(row, index) {
  const cells = [...row.children];
  const imageEl = cells[0]?.querySelector('img');
  const logoEl = cells[1]?.querySelector('img');
  const linkEl = cells[5]?.querySelector('a[href]');

  const image = imageEl
    ? { src: imageEl.getAttribute('src') || '', alt: imageEl.getAttribute('alt') || '' }
    : {};

  const logo = logoEl
    ? { src: logoEl.getAttribute('src') || '', alt: logoEl.getAttribute('alt') || '' }
    : {};

  const link = linkEl
    ? {
      label: (linkEl.textContent || '').trim() || 'Learn more',
      href: linkEl.getAttribute('href') || '',
      newTab: (linkEl.getAttribute('target') || '').toLowerCase() === '_blank',
    }
    : null;

  return {
    id: `inline-card-${index + 1}`,
    image,
    logo,
    tag: textFromCell(cells[2]),
    title: textFromCell(cells[3]),
    description: textFromCell(cells[4]),
    link,
  };
}

function renderInlineCards(block) {
  const rows = [...block.children].filter((child) => child.children.length > 0);
  const cards = rows.map((row, index) => cardFromInlineRow(row, index));
  if (cards.length === 0) {
    block.innerHTML = '<p>Cards content is not authored.</p>';
    return;
  }

  block.innerHTML = `<ul class="adc-cards-list">${cards.map((card) => renderCard(card, '')).join('')}</ul>`;
}

export default async function decorate(block) {
  const source = getSourceUrl(block);
  if (!source) {
    renderInlineCards(block);
    return;
  }

  try {
    const payload = await fetchContractJson(source, 'cards');
    const cards = Array.isArray(payload.items) ? payload.items : [];

    block.innerHTML = `<ul class="adc-cards-list">${cards.map((card) => renderCard(card, source)).join('')}</ul>`;
  } catch (error) {
    block.innerHTML = `<p>${error.message}</p>`;
  }
}
