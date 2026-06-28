// adc-hero-banner is a CONTAINER block.
// Config rows (1 cell): image, imageAlt, variant
// adc-hero-text child (2 cells): richtext content + type (title/tagline/description)
// adc-button child (4 cells): label + url + variant + newTab

const LAYOUT_VARIANTS = ['left', 'center', 'right'];

function extractImage(imageCell, altText) {
  if (!imageCell) return null;
  const pic = imageCell.querySelector('picture');
  if (pic) {
    if (altText) { const img = pic.querySelector('img'); if (img) img.alt = altText; }
    return pic;
  }
  const img = imageCell.querySelector('img');
  if (img) { if (altText) img.alt = altText; return img; }
  const a = imageCell.querySelector('a');
  if (a) {
    const imgInA = a.querySelector('img');
    if (imgInA) { if (altText) imgInA.alt = altText; return imgInA; }
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

function hasImageContent(cell) {
  return !!(cell.querySelector('picture, img') || cell.querySelector('a[href]'));
}

export default function decorate(block) {
  const allRows = [...block.querySelectorAll(':scope > div')];

  let bgImageCell = null;
  let imageAlt = '';
  let variant = 'left';
  const textItems = [];
  const ctaItems = [];

  allRows.forEach((row) => {
    const cells = [...row.querySelectorAll(':scope > div')];

    if (cells.length === 1) {
      // Config row — image, imageAlt, or variant
      const [firstCell] = cells;
      if (hasImageContent(firstCell)) {
        bgImageCell = firstCell;
      } else {
        const text = firstCell.textContent.trim();
        if (LAYOUT_VARIANTS.includes(text.toLowerCase())) {
          variant = text.toLowerCase();
        } else {
          imageAlt = text;
        }
      }
    } else if (cells.length === 2) {
      // adc-hero-text child: cells[0]=content (richtext), cells[1]=type
      const [contentCell, typeCell] = cells;
      const type = typeCell.textContent.trim().toLowerCase() || 'description';
      textItems.push({
        content: contentCell, type,
      });
    } else if (cells.length >= 3) {
      // adc-button child: cells[0]=label, cells[1]=url, cells[2]=variant, cells[3]=newTab
      const [labelCell, urlCell] = cells;
      const label = labelCell.textContent.trim();
      const url = urlCell.textContent.trim();
      const btnVariant = cells[2]?.textContent.trim() || 'primary';
      const newTab = cells[3]?.textContent.trim() === 'true';
      if (label && url) {
        ctaItems.push({
          label, url, variant: btnVariant, newTab,
        });
      }
    }
  });

  block.classList.add(`variant-${variant}`);
  block.textContent = '';

  // Background image
  const picEl = extractImage(bgImageCell, imageAlt);
  if (picEl) {
    const media = document.createElement('div');
    media.className = 'adc-hero-banner-media';
    const imgNode = (picEl.closest && picEl.closest('picture')) || picEl;
    media.append(imgNode);
    block.append(media);
  }

  // Content area
  const content = document.createElement('div');
  content.className = 'adc-hero-banner-content';

  textItems.forEach(({ content: el, type }) => {
    if (type === 'title') {
      const h = document.createElement('h2');
      h.className = 'adc-hero-banner-title';
      h.innerHTML = el.innerHTML;
      content.append(h);
    } else if (type === 'tagline') {
      const p = document.createElement('p');
      p.className = 'adc-hero-banner-eyebrow';
      p.innerHTML = el.innerHTML;
      content.append(p);
    } else {
      const p = document.createElement('p');
      p.className = 'adc-hero-banner-desc';
      p.innerHTML = el.innerHTML;
      content.append(p);
    }
  });

  if (ctaItems.length) {
    const actions = document.createElement('div');
    actions.className = 'adc-hero-banner-actions';
    ctaItems.forEach((
      {
        label, url, variant: bv, newTab,
      },
    ) => {
      const a = document.createElement('a');
      a.href = url;
      a.className = `adc-hero-banner-btn adc-hero-banner-btn-${bv}`;
      a.textContent = label;
      if (newTab) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
      actions.append(a);
    });
    content.append(actions);
  }

  block.append(content);
}
