// adc-card-item is a child block used inside adc-cards and adc-card-carousel.
// When used standalone it renders as a single card.
// Field order: image, imageAlt, title, description, cta_label, cta_url

function cell(row) {
  return row?.firstElementChild || row;
}

function extractImage(imageCell, altText) {
  if (!imageCell) return null;
  const pic = imageCell.querySelector('picture');
  if (pic) { if (altText) { const img = pic.querySelector('img'); if (img) img.alt = altText; } return pic; }
  const img = imageCell.querySelector('img');
  if (img) { if (altText) img.alt = altText; return img; }
  const src = imageCell.textContent.trim();
  if (src && (src.startsWith('/') || src.startsWith('http'))) {
    const el = document.createElement('img');
    el.src = src;
    el.alt = altText || '';
    el.loading = 'lazy';
    return el;
  }
  return null;
}

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const altText = cell(rows[1])?.textContent.trim() || '';
  const picEl = extractImage(cell(rows[0]), altText);
  const title = rows[2]?.textContent.trim();
  const desc = rows[3]?.textContent.trim();
  const ctaLabel = rows[4]?.textContent.trim();
  const ctaUrl = rows[5]?.textContent.trim();

  block.textContent = '';
  block.className += ' adc-card';

  if (picEl) {
    const imgWrap = document.createElement('div');
    imgWrap.className = 'adc-card-img';
    const imgNode = picEl.closest ? (picEl.closest('picture') || picEl) : picEl;
    imgWrap.append(imgNode);
    block.append(imgWrap);
  }

  const body = document.createElement('div');
  body.className = 'adc-card-body';

  if (title) {
    const h = document.createElement('h3');
    h.className = 'adc-card-title';
    h.textContent = title;
    body.append(h);
  }

  if (desc) {
    const p = document.createElement('p');
    p.className = 'adc-card-desc';
    p.textContent = desc;
    body.append(p);
  }

  if (ctaLabel && ctaUrl) {
    const a = document.createElement('a');
    a.href = ctaUrl;
    a.className = 'adc-card-link';
    a.textContent = ctaLabel;
    body.append(a);
  }

  block.append(body);
}
