function buildData(block) {
  const data = {};
  block.querySelectorAll(':scope > div').forEach((row) => {
    const cells = [...row.querySelectorAll(':scope > div')];
    if (cells.length === 2) {
      const [keyCell, valCell] = cells;
      const key = keyCell.textContent.trim().toLowerCase();
      data[key] = valCell;
    }
  });
  return data;
}

function extractImage(imageCell, altText) {
  if (!imageCell) return null;
  const pic = imageCell.querySelector('picture');
  if (pic) {
    if (altText) { const img = pic.querySelector('img'); if (img) img.alt = altText; }
    return pic;
  }
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
  const variant = [...block.classList]
    .find((c) => ['left', 'center', 'right'].includes(c)) || 'left';
  const data = buildData(block);
  block.textContent = '';
  block.classList.add(`variant-${variant}`);

  const altText = data.imagealt?.textContent.trim() || '';
  const picEl = extractImage(data.image, altText);
  if (picEl) {
    const media = document.createElement('div');
    media.className = 'adc-hero-banner-media';
    const imgNode = picEl.closest ? (picEl.closest('picture') || picEl) : picEl;
    media.append(imgNode);
    block.append(media);
  }

  const content = document.createElement('div');
  content.className = 'adc-hero-banner-content';

  if (data.title?.textContent.trim()) {
    const h = document.createElement('h1');
    h.className = 'adc-hero-banner-title';
    h.innerHTML = data.title.innerHTML;
    content.append(h);
  }

  if (data.description?.innerHTML?.trim()) {
    const d = document.createElement('div');
    d.className = 'adc-hero-banner-desc';
    d.innerHTML = data.description.innerHTML;
    content.append(d);
  }

  const cta1Label = data.cta1label?.textContent.trim();
  const cta1Url = data.cta1url?.textContent.trim();
  const cta2Label = data.cta2label?.textContent.trim();
  const cta2Url = data.cta2url?.textContent.trim();
  const hasCta = (cta1Label && cta1Url) || (cta2Label && cta2Url);

  if (hasCta) {
    const actions = document.createElement('div');
    actions.className = 'adc-hero-banner-actions';
    if (cta1Label && cta1Url) {
      const a = document.createElement('a');
      a.href = cta1Url;
      a.textContent = cta1Label;
      a.className = 'adc-hero-banner-btn-primary';
      actions.append(a);
    }
    if (cta2Label && cta2Url) {
      const a = document.createElement('a');
      a.href = cta2Url;
      a.textContent = cta2Label;
      a.className = 'adc-hero-banner-btn-secondary';
      actions.append(a);
    }
    content.append(actions);
  }

  block.append(content);
}
