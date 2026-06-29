// adc-card-carousel: container block.
// Parent config rows (1 cell): title text or cardsPerScreen number (2–6).
// Card-item children use resourceType block/v1/block/item — fields render as cells in
// a single row (not a nested block element). Cell structure per card:
//   cells[0]: variant text  (classes field → text cell for block/item children)
//   cells[1]: card image    (image + imageAlt field-collapsed into <picture>)
//   cells[2]: logo image    (logo  + logoAlt  field-collapsed into <picture>)
//   cells[3]: content group (content_title, content_description, content_cta+ctaText)

const CLICKABLE_TYPES = new Set(['clickable-card', 'support']);

function buildCarouselCard(cells) {
  const variant = cells[0]?.textContent.trim() || '';
  const imageCell = cells[1];
  const contentCell = cells[3]?.firstElementChild;

  const picture = imageCell?.querySelector('picture');

  const card = document.createElement('div');
  card.className = `adc-carousel-card adc-carousel-card-type-${variant || 'default'}`;

  if (picture) {
    const imgWrap = document.createElement('div');
    imgWrap.className = 'adc-carousel-card-img';
    imgWrap.append(picture);
    card.append(imgWrap);
  }

  const body = document.createElement('div');
  body.className = 'adc-carousel-card-body';

  const heading = contentCell?.querySelector('h1,h2,h3,h4,h5,h6');
  const desc = contentCell?.querySelector('p');
  const cta = contentCell?.querySelector('a');

  if (heading) {
    const p = document.createElement('p');
    p.className = 'adc-carousel-card-title';
    p.innerHTML = heading.innerHTML;
    body.append(p);
  }

  if (desc) {
    const d = document.createElement('p');
    d.className = 'adc-carousel-card-desc';
    d.innerHTML = desc.innerHTML;
    body.append(d);
  }

  if (!CLICKABLE_TYPES.has(variant) && cta) {
    const a = document.createElement('a');
    a.href = cta.href;
    a.className = 'adc-carousel-card-link';
    a.textContent = cta.textContent.trim();
    if (cta.target === '_blank') {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    body.append(a);
  }

  card.append(body);

  if (CLICKABLE_TYPES.has(variant) && cta) {
    const wrap = document.createElement('a');
    wrap.href = cta.href;
    wrap.className = 'adc-carousel-card-link-wrap';
    if (cta.target === '_blank') {
      wrap.target = '_blank';
      wrap.rel = 'noopener noreferrer';
    }
    wrap.append(...card.childNodes);
    card.append(wrap);
  }

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

  let titleText = '';
  let cardsPerScreen = 3;
  const cardRows = [];

  allRows.forEach((row) => {
    const cells = [...row.querySelectorAll(':scope > div')];
    if (cells.length === 1) {
      // Config row: title or cardsPerScreen count
      const val = cells[0].textContent.trim();
      const num = parseInt(val, 10);
      if (!Number.isNaN(num) && num >= 2 && num <= 6) {
        cardsPerScreen = num;
      } else if (val) {
        titleText = val;
      }
    } else if (cells.length >= 3) {
      cardRows.push(cells);
    }
  });

  block.style.setProperty('--cards-per-screen', String(cardsPerScreen));

  if (titleText) {
    const h = document.createElement('h2');
    h.className = 'adc-carousel-title';
    h.textContent = titleText;
    block.prepend(h);
  }

  if (!cardRows.length) return;

  const cards = cardRows.map((cells) => buildCarouselCard(cells));
  renderCarousel(block, cards, cardsPerScreen);
}
