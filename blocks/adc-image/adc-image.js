function cell(row) { return row?.firstElementChild || row; }

function extractImage(imageCell, altText) {
  if (!imageCell) return null;
  // Case 1: already rendered as picture or img
  const pic = imageCell.querySelector('picture');
  if (pic) {
    if (altText) { const img = pic.querySelector('img'); if (img) img.alt = altText; }
    return pic;
  }
  let img = imageCell.querySelector('img');
  if (img) { if (altText) img.alt = altText; return img; }
  // Case 2: anchor wrapping an image
  const aImg = imageCell.querySelector('a');
  if (aImg) {
    img = aImg.querySelector('img');
    if (img) { if (altText) img.alt = altText; return img; }
  }
  // Case 3: reference stored as URL/path text
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
  const caption = rows[2]?.textContent.trim();
  const linkUrl = rows[3]?.textContent.trim();
  const size = rows[4]?.textContent.trim() || 'full';

  block.textContent = '';
  block.classList.add(`size-${size}`);

  let content = document.createElement('div');
  content.className = 'adc-image-wrap';

  if (picEl) {
    const imgNode = picEl.closest ? (picEl.closest('picture') || picEl) : picEl;
    if (linkUrl) {
      const a = document.createElement('a');
      a.href = linkUrl;
      a.append(imgNode);
      content.append(a);
    } else {
      content.append(imgNode);
    }
  }

  if (caption) {
    const fig = document.createElement('figure');
    fig.className = 'adc-image-figure';
    fig.append(content);
    const figCap = document.createElement('figcaption');
    figCap.className = 'adc-image-caption';
    figCap.textContent = caption;
    fig.append(figCap);
    content = fig;
  }

  block.append(content);
}
