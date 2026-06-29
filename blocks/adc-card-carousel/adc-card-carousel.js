// adc-card-carousel CONTAINER block.
// Config rows (1 cell): title text or cardsPerScreen number.
// Card-item rows: nested containers (adc-card-item) detected by hasSubRows().
// Each card-item sub-row follows adc-card-item.js cell-count conventions:
//   1 cell = config (variant / link_url / link_newTab)
//   2 cells + image = adc-card-image (1st) or adc-card-logo (2nd)
//   2 cells + text  = adc-hero-text (content + type)
//   4 cells         = adc-button (label + url + variant + newTab)

const CARD_TYPES = [
  'default', 'logo', 'information', 'support', 'patient-story', 'clickable-card',
];

function hasSubRows(row) {
  return !!row.firstElementChild?.querySelector(':scope > div');
}

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

function buildCarouselCard(row) {
  const subRows = [...row.querySelectorAll(':scope > div')];

  let cardType = 'default';
  let cardLink = '';
  let openInNewTab = false;
  let imageCell = null;
  let imageAlt = '';
  const titleItems = [];
  const descItems = [];
  const actions = [];
  let imageCount = 0;

  subRows.forEach((subRow) => {
    const cells = [...subRow.querySelectorAll(':scope > div')];

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
        }
        // logo skipped in carousel (no logo display needed)
      } else {
        const type = c1.textContent.trim().toLowerCase() || 'description';
        if (type === 'title') {
          titleItems.push(c0);
        } else {
          descItems.push(c0);
        }
      }
    } else if (cells.length >= 3) {
      const [labelCell, urlCell] = cells;
      const label = labelCell.textContent.trim();
      const url = urlCell.textContent.trim();
      const newTab = cells[3]?.textContent.trim() === 'true';
      if (label && url) {
        actions.push({
          label, url, newTab,
        });
      }
    }
  });

  const card = document.createElement('div');
  card.className = `adc-carousel-card adc-carousel-card-type-${cardType}`;

  const isLinked = (cardType === 'clickable-card' || cardType === 'support') && cardLink;
  let wrapper = card;
  if (isLinked) {
    const a = document.createElement('a');
    a.href = cardLink;
    a.className = 'adc-carousel-card-link-wrap';
    if (openInNewTab) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    card.append(a);
    wrapper = a;
  }

  const picEl = extractImage(imageCell, imageAlt);
  if (picEl) {
    const imgWrap = document.createElement('div');
    imgWrap.className = 'adc-carousel-card-img';
    imgWrap.append(picEl.closest ? (picEl.closest('picture') || picEl) : picEl);
    wrapper.append(imgWrap);
  }

  const body = document.createElement('div');
  body.className = 'adc-carousel-card-body';

  titleItems.forEach((titleEl) => {
    const p = document.createElement('p');
    p.className = 'adc-carousel-card-title';
    p.innerHTML = titleEl.innerHTML;
    body.append(p);
  });

  descItems.forEach((descEl) => {
    const d = document.createElement('p');
    d.className = 'adc-carousel-card-desc';
    d.innerHTML = descEl.innerHTML;
    body.append(d);
  });

  if (!isLinked && actions.length) {
    const [firstAction] = actions;
    const a = document.createElement('a');
    a.href = firstAction.url;
    a.className = 'adc-carousel-card-link';
    a.textContent = firstAction.label;
    if (firstAction.newTab) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    body.append(a);
  }

  wrapper.append(body);
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

  // Config rows are simple 1-cell rows (not nested card containers)
  let titleText = '';
  let cardsPerScreen = 3;
  let startIdx = 0;

  while (startIdx < allRows.length && !hasSubRows(allRows[startIdx])) {
    const [firstCell] = allRows[startIdx].querySelectorAll(':scope > div');
    const val = firstCell?.textContent.trim() || '';
    const num = parseInt(val, 10);
    if (!Number.isNaN(num) && num >= 2 && num <= 6) {
      cardsPerScreen = num;
    } else if (val) {
      titleText = val;
    }
    startIdx += 1;
  }

  block.style.setProperty('--cards-per-screen', String(cardsPerScreen));
  const cardRows = allRows.slice(startIdx).filter(hasSubRows);

  if (titleText) {
    const h = document.createElement('h2');
    h.className = 'adc-carousel-title';
    h.textContent = titleText;
    block.prepend(h);
  }

  if (!cardRows.length) return;

  const cards = cardRows.map((row) => buildCarouselCard(row));

  renderCarousel(block, cards, cardsPerScreen);
}
