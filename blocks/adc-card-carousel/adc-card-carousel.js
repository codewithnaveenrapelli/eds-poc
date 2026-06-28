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

function isConfigRow(row) {
  const cells = [...row.querySelectorAll(':scope > div')];
  if (cells.length !== 1) return false;
  const c = cells[0];
  if (c.querySelector('picture, img')) return false;
  if (c.querySelector('a[href]')) return false;
  const text = c.textContent.trim();
  if (text.startsWith('/') || text.startsWith('http') || text.startsWith('//')) return false;
  return true;
}

function buildCard(cells) {
  const card = document.createElement('div');
  card.className = 'adc-carousel-card';

  const altText = cells[1]?.textContent.trim() || '';
  const picEl = extractImage(cells[0], altText);
  if (picEl) {
    const imgWrap = document.createElement('div');
    imgWrap.className = 'adc-carousel-card-img';
    const imgNode = picEl.closest ? (picEl.closest('picture') || picEl) : picEl;
    imgWrap.append(imgNode);
    card.append(imgWrap);
  }

  const body = document.createElement('div');
  body.className = 'adc-carousel-card-body';

  const title = cells[2]?.textContent.trim();
  if (title) {
    const p = document.createElement('p');
    p.className = 'adc-carousel-card-title';
    p.textContent = title;
    body.append(p);
  }

  const desc = cells[3]?.textContent.trim();
  if (desc) {
    const d = document.createElement('p');
    d.className = 'adc-carousel-card-desc';
    d.textContent = desc;
    body.append(d);
  }

  const ctaLabel = cells[4]?.textContent.trim();
  const ctaUrl = cells[5]?.textContent.trim();
  if (ctaLabel && ctaUrl) {
    const a = document.createElement('a');
    a.href = ctaUrl;
    a.className = 'adc-carousel-card-link';
    a.textContent = ctaLabel;
    body.append(a);
  }

  card.append(body);
  return card;
}

function renderCarousel(block, cards, perScreen) {
  const wrapper = document.createElement('div');
  wrapper.className = 'adc-carousel-wrapper';

  const track = document.createElement('div');
  track.className = 'adc-carousel-track';
  track.style.setProperty('--carousel-per-screen', String(perScreen));

  cards.forEach((cardEl) => {
    const item = document.createElement('div');
    item.className = 'adc-carousel-item';
    item.append(cardEl);
    track.append(item);
  });

  wrapper.append(track);

  const total = cards.length;
  let current = 0;

  const goTo = (idx) => {
    current = Math.max(0, Math.min(idx, total - perScreen));
    track.style.transform = `translateX(-${(current / total) * 100}%)`;
    block.querySelectorAll('.adc-carousel-dot').forEach((d, i) => {
      d.classList.toggle('adc-carousel-dot-active', i === current);
    });
  };

  const prev = document.createElement('button');
  prev.className = 'adc-carousel-btn adc-carousel-btn-prev';
  prev.type = 'button';
  prev.setAttribute('aria-label', 'Previous');
  prev.innerHTML = '&#8249;';
  prev.addEventListener('click', () => goTo(current - 1));

  const next = document.createElement('button');
  next.className = 'adc-carousel-btn adc-carousel-btn-next';
  next.type = 'button';
  next.setAttribute('aria-label', 'Next');
  next.innerHTML = '&#8250;';
  next.addEventListener('click', () => goTo(current + 1));

  const dots = document.createElement('div');
  dots.className = 'adc-carousel-dots';

  for (let i = 0; i < total; i += 1) {
    const dot = document.createElement('button');
    dot.className = `adc-carousel-dot${i === 0 ? ' adc-carousel-dot-active' : ''}`;
    dot.type = 'button';
    dot.setAttribute('aria-label', `Go to card ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dots.append(dot);
  }

  block.textContent = '';

  if (total > 1) {
    block.append(prev, wrapper, next, dots);
  } else {
    block.append(wrapper);
  }
}

export default function decorate(block) {
  const allRows = [...block.querySelectorAll(':scope > div')];
  if (!allRows.length) return;

  // Separate config rows (title, cardsPerScreen) from card item rows
  let titleText = '';
  let cardsPerScreen = 3;
  let startIdx = 0;

  while (startIdx < allRows.length && isConfigRow(allRows[startIdx])) {
    const val = allRows[startIdx].querySelector(':scope > div')?.textContent.trim() || '';
    const num = parseInt(val, 10);
    if (!Number.isNaN(num) && num >= 2 && num <= 6) {
      cardsPerScreen = num;
    } else if (val) {
      titleText = val;
    }
    startIdx += 1;
  }

  block.style.setProperty('--cards-per-screen', String(cardsPerScreen));
  const cardRows = allRows.slice(startIdx);

  if (titleText) {
    const h = document.createElement('h2');
    h.className = 'adc-carousel-title';
    h.textContent = titleText;
    block.prepend(h);
  }

  if (!cardRows.length) return;

  const cards = cardRows.map((row) => {
    const cells = [...row.querySelectorAll(':scope > div')];
    return buildCard(cells);
  });

  renderCarousel(block, cards, cardsPerScreen);
}
