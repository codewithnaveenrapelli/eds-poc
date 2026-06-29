// adc-card-item is a CONTAINER block (child of adc-cards).
// Config rows (1 cell): variant (card type) | link_url | link_newTab
// adc-card-image child (2 cells): image ref + imageAlt — 1st image row
// adc-card-logo child  (2 cells): logo ref + logoAlt  — 2nd image row
// adc-hero-text child  (2 cells): richtext + type (title / description)
// adc-button child     (4 cells): label + url + variant + newTab

const CARD_TYPES = [
  'default', 'logo', 'information', 'support', 'patient-story', 'clickable-card',
];

function hasImageContent(cell) {
  return !!(cell.querySelector('picture, img') || cell.querySelector('a[href]'));
}

function extractImage(imageCell, altText) {
  if (!imageCell) return null;
  const pic = imageCell.querySelector('picture');
  if (pic) {
    if (altText) {
      const img = pic.querySelector('img');
      if (img) img.alt = altText;
    }
    return pic;
  }
  const img = imageCell.querySelector('img');
  if (img) {
    if (altText) img.alt = altText;
    return img;
  }
  const a = imageCell.querySelector('a');
  if (a) {
    const imgInA = a.querySelector('img');
    if (imgInA) {
      if (altText) imgInA.alt = altText;
      return imgInA;
    }
    const href = a.getAttribute('href') || '';
    if (href && (href.startsWith('/') || href.startsWith('http') || href.startsWith('//'))) {
      const el = document.createElement('img');
      el.src = href;
      el.alt = altText || '';
      el.loading = 'lazy';
      return el;
    }
  }
  const src = imageCell.textContent.trim();
  if (src && (src.startsWith('/') || src.startsWith('http') || src.startsWith('//'))) {
    const el = document.createElement('img');
    el.src = src;
    el.alt = altText || '';
    el.loading = 'lazy';
    return el;
  }
  return null;
}

export default function decorate(block) {
  const allRows = [...block.querySelectorAll(':scope > div')];

  let cardType = 'default';
  let cardLink = '';
  let openInNewTab = false;
  let imageCell = null;
  let imageAlt = '';
  let logoCell = null;
  let logoAlt = '';
  const textItems = [];
  const actions = [];
  let imageCount = 0;

  allRows.forEach((row) => {
    const cells = [...row.querySelectorAll(':scope > div')];

    if (cells.length === 1) {
      const [firstCell] = cells;
      const text = firstCell.textContent.trim().toLowerCase();
      if (CARD_TYPES.includes(text)) {
        cardType = text;
      } else if (text === 'true' || text === 'false') {
        openInNewTab = text === 'true';
      } else {
        const raw = firstCell.textContent.trim();
        if (raw.startsWith('/') || raw.startsWith('http') || raw.startsWith('//')) {
          cardLink = raw;
        }
      }
    } else if (cells.length === 2) {
      const [c0, c1] = cells;
      if (hasImageContent(c0)) {
        imageCount += 1;
        if (imageCount === 1) {
          imageCell = c0;
          imageAlt = c1.textContent.trim();
        } else {
          logoCell = c0;
          logoAlt = c1.textContent.trim();
        }
      } else {
        const type = c1.textContent.trim().toLowerCase() || 'description';
        textItems.push({ content: c0, type });
      }
    } else if (cells.length >= 3) {
      const [labelCell, urlCell] = cells;
      const label = labelCell.textContent.trim();
      const url = urlCell.textContent.trim();
      const btnVariant = cells[2]?.textContent.trim() || 'primary';
      const newTab = cells[3]?.textContent.trim() === 'true';
      if (label && url) {
        actions.push({
          label, url, variant: btnVariant, newTab,
        });
      }
    }
  });

  block.textContent = '';
  block.classList.add(`card-type-${cardType}`);

  const inner = document.createElement('div');
  inner.className = 'adc-card-inner';

  // For clickable-card and support: wrap content in an anchor
  const isLinked = (cardType === 'clickable-card' || cardType === 'support') && cardLink;
  let contentEl = inner;
  if (isLinked) {
    const a = document.createElement('a');
    a.href = cardLink;
    a.className = 'adc-card-link';
    if (openInNewTab) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    inner.append(a);
    contentEl = a;
  }

  // Media: primary image + optional logo (only for default type)
  const media = document.createElement('div');
  media.className = 'adc-card-media';

  const picEl = extractImage(imageCell, imageAlt);
  if (picEl) {
    const imgWrap = document.createElement('div');
    imgWrap.className = 'adc-card-img';
    imgWrap.append(picEl.closest ? (picEl.closest('picture') || picEl) : picEl);
    media.append(imgWrap);
  }

  if (logoCell) {
    const logoPicEl = extractImage(logoCell, logoAlt);
    if (logoPicEl) {
      const logoWrap = document.createElement('div');
      logoWrap.className = 'adc-card-logo-img';
      logoWrap.append(
        logoPicEl.closest ? (logoPicEl.closest('picture') || logoPicEl) : logoPicEl,
      );
      media.append(logoWrap);
    }
  }

  if (media.children.length) {
    contentEl.append(media);
  }

  // Body: title / description text + action buttons
  const body = document.createElement('div');
  body.className = 'adc-card-body';

  textItems.forEach(({ content, type }) => {
    if (type === 'title') {
      const h = document.createElement('h3');
      h.className = 'adc-card-title';
      h.innerHTML = content.innerHTML;
      body.append(h);
    } else {
      const p = document.createElement('p');
      p.className = 'adc-card-desc';
      p.innerHTML = content.innerHTML;
      body.append(p);
    }
  });

  if (!isLinked && actions.length) {
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'adc-card-actions';
    actions.forEach(({
      label, url, variant: bv, newTab,
    }) => {
      const a = document.createElement('a');
      a.href = url;
      a.className = `adc-card-action adc-card-action-${bv}`;
      a.textContent = label;
      if (newTab) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
      actionsDiv.append(a);
    });
    body.append(actionsDiv);
  }

  contentEl.append(body);
  block.append(inner);
}
