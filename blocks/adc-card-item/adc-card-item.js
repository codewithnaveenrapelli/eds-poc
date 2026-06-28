// adc-card-item is a child block used inside adc-cards and adc-card-carousel.
// When used standalone it renders as a single card.
// Field order: image, imageAlt, title, description, cta_label, cta_url

function cell(row) {
  return row?.firstElementChild || row;
}

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const picEl = cell(rows[0])?.querySelector('picture, img');
  const title = rows[2]?.textContent.trim();
  const desc = rows[3]?.textContent.trim();
  const ctaLabel = rows[4]?.textContent.trim();
  const ctaUrl = rows[5]?.textContent.trim();

  block.textContent = '';
  block.className += ' adc-card';

  if (picEl) {
    const imgWrap = document.createElement('div');
    imgWrap.className = 'adc-card-img';
    imgWrap.append(picEl.closest('picture') || picEl);
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
